import { Request, Response } from 'express';
import { db } from '../db/store.ts';
import { Transaction } from '../../src/types/index.ts';

export const transactionController = {
  // GET /api/transactions
  getTransactions(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { status } = req.query;
      let txs = Array.from(db.transactions.values());

      if (req.user.role === 'FARMER') {
        txs = txs.filter((t) => t.farmerId === req.user!.id);
      } else if (req.user.role === 'BUYER') {
        txs = txs.filter((t) => t.buyerId === req.user!.id);
      }

      if (status && typeof status === 'string' && status !== 'ALL') {
        txs = txs.filter((t) => t.status === status);
      }

      // Sort newest first
      txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        success: true,
        count: txs.length,
        transactions: txs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions: ' + (err.message || 'Unknown'),
      });
    }
  },

  // GET /api/transactions/:id
  getTransactionById(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const tx = db.transactions.get(id);

      if (!tx) {
        res.status(404).json({ success: false, message: 'Transaction not found.' });
        return;
      }

      // Check authorization: must be the farmer, the buyer, or admin
      if (tx.farmerId !== req.user.id && tx.buyerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Unauthorized to view this transaction.' });
        return;
      }

      res.json({
        success: true,
        transaction: tx,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transaction details: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/transactions/:id/complete
  completeTransaction(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const { completionNotes } = req.body;

      const tx = db.transactions.get(id);
      if (!tx) {
        res.status(404).json({ success: false, message: 'Transaction not found.' });
        return;
      }

      if (tx.farmerId !== req.user.id && tx.buyerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Unauthorized to complete this transaction.' });
        return;
      }

      if (tx.status === 'COMPLETED') {
        res.status(400).json({ success: false, message: 'This transaction has already been completed.' });
        return;
      }

      const now = new Date().toISOString();
      tx.status = 'COMPLETED';
      tx.completedAt = now;
      tx.completionNotes = completionNotes || `Fulfillment confirmed by ${req.user.fullName} (${req.user.role}). Handover and settlement verified.`;

      db.transactions.set(id, tx);

      // Update associated purchase request
      const reqRecord = db.purchaseRequests.get(tx.requestId);
      if (reqRecord) {
        reqRecord.status = 'COMPLETED';
        reqRecord.updatedAt = now;
        db.purchaseRequests.set(reqRecord.id, reqRecord);
      }

      // Notify the other party
      const notifyTargetId = req.user.id === tx.farmerId ? tx.buyerId : tx.farmerId;
      db.createNotification({
        userId: notifyTargetId,
        title: 'Transaction Completed ✅',
        message: `Transaction for ${tx.quantity} ${tx.unit} of ${tx.variety} has been marked as COMPLETED by ${req.user.fullName}.`,
        type: 'TRANSACTION_COMPLETED',
        linkUrl: req.user.id === tx.farmerId ? '/buyer/purchases' : '/farmer/transactions',
      });

      // Log activity
      db.logActivity({
        actorId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: 'TRANSACTION_COMPLETED',
        targetEntity: 'TRANSACTION',
        targetId: id,
        details: `Completed transaction of ${tx.quantity} ${tx.unit} totaling ₦${tx.totalAmount.toLocaleString()}`,
      });

      res.json({
        success: true,
        message: 'Transaction successfully marked as completed!',
        transaction: tx,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to complete transaction: ' + (err.message || 'Unknown'),
      });
    }
  },
};
