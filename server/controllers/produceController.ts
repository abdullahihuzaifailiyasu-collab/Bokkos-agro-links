import { Request, Response } from 'express';
import { db } from '../db/store.ts';
import { ProduceListing, PotatoGrade, PotatoVariety, QuantityUnit, ListingStatus } from '../../src/types/index.ts';

export const produceController = {
  // GET /api/produce
  getListings(req: Request, res: Response): void {
    try {
      const {
        q,
        variety,
        grade,
        ward,
        minPrice,
        maxPrice,
        status,
        sortBy,
        farmerId,
      } = req.query;

      let results: ProduceListing[] = Array.from(db.listings.values());

      // If farmerId specified (e.g. farmer viewing their own listings)
      if (farmerId && typeof farmerId === 'string') {
        results = results.filter((l) => l.farmerId === farmerId);
      } else {
        // By default on public marketplace, only show AVAILABLE listings unless admin/farmer requests otherwise
        const targetStatus = typeof status === 'string' ? status : 'AVAILABLE';
        if (targetStatus !== 'ALL') {
          results = results.filter((l) => l.status === targetStatus);
        }
      }

      // Filter by variety
      if (variety && typeof variety === 'string' && variety !== 'ALL') {
        results = results.filter((l) => l.variety.toLowerCase() === variety.toLowerCase());
      }

      // Filter by grade
      if (grade && typeof grade === 'string' && grade !== 'ALL') {
        results = results.filter((l) => l.grade === grade);
      }

      // Filter by Bokkos ward
      if (ward && typeof ward === 'string' && ward !== 'ALL') {
        results = results.filter((l) => l.farmerWard.toLowerCase() === ward.toLowerCase());
      }

      // Filter by price range
      if (minPrice && !isNaN(Number(minPrice))) {
        results = results.filter((l) => l.pricePerUnit >= Number(minPrice));
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        results = results.filter((l) => l.pricePerUnit <= Number(maxPrice));
      }

      // Text search in variety, farmerName, location, description
      if (q && typeof q === 'string' && q.trim().length > 0) {
        const query = q.trim().toLowerCase();
        results = results.filter((l) =>
          l.variety.toLowerCase().includes(query) ||
          l.farmerName.toLowerCase().includes(query) ||
          l.farmerWard.toLowerCase().includes(query) ||
          l.farmLocation.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query)
        );
      }

      // Sorting
      if (sortBy === 'price_asc') {
        results.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      } else if (sortBy === 'price_desc') {
        results.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
      } else if (sortBy === 'quantity_desc') {
        results.sort((a, b) => b.availableQuantity - a.availableQuantity);
      } else {
        // Default: newest first
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      res.json({
        success: true,
        count: results.length,
        listings: results,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve produce listings: ' + (err.message || 'Unknown'),
      });
    }
  },

  // GET /api/produce/:id
  getListingById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const listing = db.listings.get(id);

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Produce listing not found.',
        });
        return;
      }

      res.json({
        success: true,
        listing,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve listing: ' + (err.message || 'Unknown'),
      });
    }
  },

  // POST /api/produce
  createListing(req: Request, res: Response): void {
    try {
      if (!req.user || req.user.role !== 'FARMER') {
        res.status(403).json({
          success: false,
          message: 'Only registered farmers can create produce listings.',
        });
        return;
      }

      const {
        variety,
        grade,
        availableQuantity,
        minimumOrderQuantity,
        unit,
        pricePerUnit,
        farmLocation,
        harvestDate,
        availabilityPeriod,
        description,
        imageUrl,
      } = req.body;

      // Validation
      if (!variety || !grade || !availableQuantity || !unit || !pricePerUnit || !farmLocation) {
        res.status(400).json({
          success: false,
          message: 'Variety, grade, available quantity, unit, price per unit, and farm location are required.',
        });
        return;
      }

      const qty = Number(availableQuantity);
      const price = Number(pricePerUnit);
      const minQty = minimumOrderQuantity ? Number(minimumOrderQuantity) : 1;

      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ success: false, message: 'Available quantity must be a strictly positive number.' });
        return;
      }

      if (isNaN(price) || price <= 0) {
        res.status(400).json({ success: false, message: 'Price per unit must be a strictly positive number (NGN).' });
        return;
      }

      const farmerWard = req.user.farmerProfile?.wardLocation || 'Bokkos Central';
      const cooperativeName = req.user.farmerProfile?.cooperativeName;

      const newListingId = `lst_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();

      // Default high quality potato imagery if no custom image is supplied
      const finalImage = imageUrl || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80';

      const newListing: ProduceListing = {
        id: newListingId,
        farmerId: req.user.id,
        farmerName: req.user.fullName,
        farmerPhone: req.user.phoneNumber,
        farmerWard,
        cooperativeName,
        variety: variety as PotatoVariety,
        grade: grade as PotatoGrade,
        availableQuantity: qty,
        minimumOrderQuantity: minQty,
        unit: unit as QuantityUnit,
        pricePerUnit: price,
        farmLocation: farmLocation.trim(),
        harvestDate: harvestDate || new Date().toISOString().split('T')[0],
        availabilityPeriod: availabilityPeriod || 'Ready for pickup',
        description: description ? description.trim() : `Freshly harvested ${variety} (${grade}) from ${farmerWard}, Bokkos LGA.`,
        imageUrl: finalImage,
        status: 'AVAILABLE',
        createdAt: now,
        updatedAt: now,
      };

      db.listings.set(newListingId, newListing);

      db.logActivity({
        actorId: req.user.id,
        actorName: req.user.fullName,
        actorRole: 'FARMER',
        action: 'LISTING_CREATED',
        targetEntity: 'PRODUCE_LISTING',
        targetId: newListingId,
        details: `Listed ${qty} ${unit} of ${variety} (${grade}) at ₦${price.toLocaleString()}/${unit}`,
      });

      res.status(201).json({
        success: true,
        message: 'Produce listing published successfully!',
        listing: newListing,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create listing: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/produce/:id
  updateListing(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const listing = db.listings.get(id);

      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found.' });
        return;
      }

      // Check ownership or admin
      if (listing.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to modify this listing.',
        });
        return;
      }

      const {
        variety,
        grade,
        availableQuantity,
        minimumOrderQuantity,
        unit,
        pricePerUnit,
        farmLocation,
        harvestDate,
        availabilityPeriod,
        description,
        imageUrl,
        status,
      } = req.body;

      if (availableQuantity !== undefined) {
        const q = Number(availableQuantity);
        if (isNaN(q) || q < 0) {
          res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
          return;
        }
        listing.availableQuantity = q;
        if (q === 0) listing.status = 'SOLD_OUT';
      }

      if (pricePerUnit !== undefined) {
        const p = Number(pricePerUnit);
        if (isNaN(p) || p <= 0) {
          res.status(400).json({ success: false, message: 'Price must be greater than zero.' });
          return;
        }
        listing.pricePerUnit = p;
      }

      if (variety) listing.variety = variety;
      if (grade) listing.grade = grade;
      if (unit) listing.unit = unit;
      if (minimumOrderQuantity) listing.minimumOrderQuantity = Number(minimumOrderQuantity);
      if (farmLocation) listing.farmLocation = farmLocation;
      if (harvestDate) listing.harvestDate = harvestDate;
      if (availabilityPeriod) listing.availabilityPeriod = availabilityPeriod;
      if (description !== undefined) listing.description = description;
      if (imageUrl) listing.imageUrl = imageUrl;
      if (status) listing.status = status as ListingStatus;

      listing.updatedAt = new Date().toISOString();
      db.listings.set(listing.id, listing);

      res.json({
        success: true,
        message: 'Listing updated successfully.',
        listing,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update listing: ' + (err.message || 'Unknown'),
      });
    }
  },

  // DELETE /api/produce/:id
  deleteListing(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const listing = db.listings.get(id);

      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found.' });
        return;
      }

      if (listing.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Unauthorized to delete this listing.' });
        return;
      }

      // Check if there are active pending purchase requests on this listing
      let hasPending = false;
      for (const r of db.purchaseRequests.values()) {
        if (r.listingId === id && r.status === 'PENDING') {
          hasPending = true;
          break;
        }
      }

      if (hasPending) {
        // Soft deactivate instead of hard delete to preserve request integrity
        listing.status = 'INACTIVE';
        listing.updatedAt = new Date().toISOString();
        db.listings.set(listing.id, listing);

        res.json({
          success: true,
          message: 'Listing has pending buyer requests; it has been deactivated rather than permanently removed.',
          listing,
        });
        return;
      }

      db.listings.delete(id);

      db.logActivity({
        actorId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: 'LISTING_DELETED',
        targetEntity: 'PRODUCE_LISTING',
        targetId: id,
        details: `Deleted listing for ${listing.variety} (${listing.grade})`,
      });

      res.json({
        success: true,
        message: 'Listing removed successfully.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete listing: ' + (err.message || 'Unknown'),
      });
    }
  },
};
