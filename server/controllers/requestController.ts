import { Request, Response } from 'express';
import { db } from '../db/store.ts';
import { PurchaseRequest, Transaction, RequestStatus } from '../../src/types/index.ts';

export const requestController = {
  // POST /api/requests
  createRequest(req: Request, res: Response): void {
    try {
      if (!req.user || req.user.role !== 'BUYER') {
        res.status(403).json({
          success: false,
          message: 'Only registered buyers can submit purchase requests.',
        });
        return;
      }

      const { listingId, requestedQuantity, note } = req.body;

      if (!listingId || !requestedQuantity) {
        res.status(400).json({
          success: false,
          message: 'Listing ID and requested quantity are required.',
        });
        return;
      }

      const qty = Number(requestedQuantity);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({
          success: false,
          message: 'Requested quantity must be a positive number.',
        });
        return;
      }

      const listing = db.listings.get(listingId);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Produce listing not found.' });
        return;
      }

      if (listing.status !== 'AVAILABLE') {
        res.status(400).json({
          success: false,
          message: `This listing is currently ${listing.status.toLowerCase()} and cannot accept new purchase requests.`,
        });
        return;
      }

      if (qty > listing.availableQuantity) {
        res.status(400).json({
          success: false,
          message: `Requested quantity (${qty} ${listing.unit}) exceeds currently available quantity (${listing.availableQuantity} ${listing.unit}).`,
        });
        return;
      }

      if (qty < listing.minimumOrderQuantity) {
        res.status(400).json({
          success: false,
          message: `Requested quantity is below the minimum order requirement (${listing.minimumOrderQuantity} ${listing.unit}).`,
        });
        return;
      }

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();
      const totalEstimatedAmount = qty * listing.pricePerUnit;

      const newRequest: PurchaseRequest = {
        id: requestId,
        listingId: listing.id,
        listingVariety: listing.variety,
        listingGrade: listing.grade,
        listingUnit: listing.unit,
        unitPrice: listing.pricePerUnit,
        buyerId: req.user.id,
        buyerName: req.user.fullName,
        buyerPhone: req.user.phoneNumber,
        buyerBusinessName: req.user.buyerProfile?.businessName,
        buyerCity: req.user.buyerProfile?.operatingCity || 'Plateau State',
        farmerId: listing.farmerId,
        farmerName: listing.farmerName,
        farmerPhone: listing.farmerPhone,
        farmerWard: listing.farmerWard,
        requestedQuantity: qty,
        totalEstimatedAmount,
        note: note ? note.trim() : undefined,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      };

      db.purchaseRequests.set(requestId, newRequest);

      // Create notification for Farmer
      db.createNotification({
        userId: listing.farmerId,
        title: 'New Purchase Request Received',
        message: `${req.user.fullName} requested ${qty} ${listing.unit} of ${listing.variety} (${listing.grade}).`,
        type: 'REQUEST_RECEIVED',
        linkUrl: '/farmer/requests',
      });

      // Log activity
      db.logActivity({
        actorId: req.user.id,
        actorName: req.user.fullName,
        actorRole: 'BUYER',
        action: 'REQUEST_SUBMITTED',
        targetEntity: 'PURCHASE_REQUEST',
        targetId: requestId,
        details: `Buyer requested ${qty} ${listing.unit} from ${listing.farmerName} totaling ₦${totalEstimatedAmount.toLocaleString()}`,
      });

      res.status(201).json({
        success: true,
        message: 'Purchase request submitted successfully. The farmer has been notified.',
        request: newRequest,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to submit purchase request: ' + (err.message || 'Unknown'),
      });
    }
  },

  // GET /api/requests
  getRequests(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { status } = req.query;
      let requests = Array.from(db.purchaseRequests.values());

      if (req.user.role === 'FARMER') {
        requests = requests.filter((r) => r.farmerId === req.user!.id);
      } else if (req.user.role === 'BUYER') {
        requests = requests.filter((r) => r.buyerId === req.user!.id);
      }
      // ADMIN sees all requests

      if (status && typeof status === 'string' && status !== 'ALL') {
        requests = requests.filter((r) => r.status === status);
      }

      // Sort newest first
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve purchase requests: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/requests/:id/status
  updateRequestStatus(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const { status, rejectionReason, pickupLocationNotes } = req.body;

      const request = db.purchaseRequests.get(id);
      if (!request) {
        res.status(404).json({ success: false, message: 'Purchase request not found.' });
        return;
      }

      const now = new Date().toISOString();

      // Case 1: Buyer cancels their own PENDING request
      if (status === 'CANCELLED') {
        if (request.buyerId !== req.user.id && req.user.role !== 'ADMIN') {
          res.status(403).json({
            success: false,
            message: 'Only the requesting buyer or an admin can cancel this request.',
          });
          return;
        }

        if (request.status !== 'PENDING') {
          res.status(400).json({
            success: false,
            message: `Cannot cancel a request that has already been ${request.status.toLowerCase()}.`,
          });
          return;
        }

        request.status = 'CANCELLED';
        request.updatedAt = now;
        db.purchaseRequests.set(id, request);

        // Notify farmer
        db.createNotification({
          userId: request.farmerId,
          title: 'Request Cancelled',
          message: `${request.buyerName} cancelled their request for ${request.requestedQuantity} ${request.listingUnit} of ${request.listingVariety}.`,
          type: 'REQUEST_CANCELLED',
          linkUrl: '/farmer/requests',
        });

        res.json({
          success: true,
          message: 'Request cancelled successfully.',
          request,
        });
        return;
      }

      // Case 2: Farmer accepts or rejects
      if (status === 'ACCEPTED' || status === 'REJECTED') {
        if (request.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
          res.status(403).json({
            success: false,
            message: 'Only the listing farmer can accept or reject this request.',
          });
          return;
        }

        if (request.status !== 'PENDING') {
          res.status(400).json({
            success: false,
            message: `This request has already been ${request.status.toLowerCase()}.`,
          });
          return;
        }

        if (status === 'REJECTED') {
          request.status = 'REJECTED';
          request.rejectionReason = rejectionReason || 'Quantity not currently feasible or logistical constraints.';
          request.updatedAt = now;
          db.purchaseRequests.set(id, request);

          db.createNotification({
            userId: request.buyerId,
            title: 'Purchase Request Declined',
            message: `Farmer ${request.farmerName} could not accept your request: "${request.rejectionReason}"`,
            type: 'REQUEST_REJECTED',
            linkUrl: '/buyer/requests',
          });

          res.json({
            success: true,
            message: 'Purchase request rejected.',
            request,
          });
          return;
        }

        if (status === 'ACCEPTED') {
          // Check if listing has enough quantity
          const listing = db.listings.get(request.listingId);
          if (!listing) {
            res.status(400).json({
              success: false,
              message: 'Underlying produce listing is no longer available.',
            });
            return;
          }

          if (listing.availableQuantity < request.requestedQuantity) {
            res.status(400).json({
              success: false,
              message: `Available quantity (${listing.availableQuantity} ${listing.unit}) is now less than requested quantity (${request.requestedQuantity} ${listing.unit}).`,
            });
            return;
          }

          // Deduct quantity from listing
          listing.availableQuantity -= request.requestedQuantity;
          if (listing.availableQuantity === 0) {
            listing.status = 'SOLD_OUT';
          }
          listing.updatedAt = now;
          db.listings.set(listing.id, listing);

          request.status = 'ACCEPTED';
          request.updatedAt = now;
          db.purchaseRequests.set(id, request);

          // Create formal Transaction record
          const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const newTransaction: Transaction = {
            id: transactionId,
            requestId: request.id,
            listingId: request.listingId,
            buyerId: request.buyerId,
            buyerName: request.buyerName,
            buyerPhone: request.buyerPhone,
            farmerId: request.farmerId,
            farmerName: request.farmerName,
            farmerPhone: request.farmerPhone,
            farmerWard: request.farmerWard,
            variety: request.listingVariety,
            grade: request.listingGrade,
            quantity: request.requestedQuantity,
            unit: request.listingUnit,
            unitPrice: request.unitPrice,
            totalAmount: request.totalEstimatedAmount,
            status: 'PENDING_FULFILLMENT',
            pickupLocationNotes: pickupLocationNotes || `${listing.farmLocation}, Bokkos LGA`,
            createdAt: now,
          };
          db.transactions.set(transactionId, newTransaction);

          // Notify buyer
          db.createNotification({
            userId: request.buyerId,
            title: 'Purchase Request Accepted! 🎉',
            message: `${request.farmerName} accepted your request for ${request.requestedQuantity} ${request.listingUnit} of ${request.listingVariety}. You can now coordinate pickup.`,
            type: 'REQUEST_ACCEPTED',
            linkUrl: '/buyer/purchases',
          });

          // Log activity
          db.logActivity({
            actorId: req.user.id,
            actorName: req.user.fullName,
            actorRole: 'FARMER',
            action: 'REQUEST_ACCEPTED',
            targetEntity: 'TRANSACTION',
            targetId: transactionId,
            details: `Farmer accepted request for ${request.requestedQuantity} ${request.listingUnit}. Transaction record created.`,
          });

          res.json({
            success: true,
            message: 'Purchase request accepted! A transaction record has been created for fulfillment.',
            request,
            transaction: newTransaction,
          });
          return;
        }
      }

      res.status(400).json({
        success: false,
        message: 'Invalid status transition requested.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update request status: ' + (err.message || 'Unknown'),
      });
    }
  },
};
