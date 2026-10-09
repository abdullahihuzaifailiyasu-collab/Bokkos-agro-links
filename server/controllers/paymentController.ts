import { Request, Response } from 'express';

interface PaymentInitRequest {
  amount: number;
  email: string;
  escrowCode: string;
  customerName: string;
  metadata?: any;
}

// In-memory payment ledger for active transactions
const paymentStore: Record<string, any> = {};

export const paymentController = {
  // Initialize escrow checkout
  async initializePayment(req: Request, res: Response) {
    try {
      const { amount, email, escrowCode, customerName, metadata } = req.body as PaymentInitRequest;

      if (!amount || amount <= 0) {
        res.status(400).json({ success: false, message: 'Invalid payment amount' });
        return;
      }

      const reference = `BKK-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const virtualAccountNumber = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
      const bankName = 'Providus Bank / Moniepoint MFB';
      const accountName = `Bokkos Escrow - ${customerName || 'Trade Lot'}`;
      const ussdCode = `*737*000*${Math.floor(1000 + Math.random() * 8999)}#`;

      const paymentRecord = {
        reference,
        amount,
        email: email || 'buyer@bokkos-agrolink.ng',
        escrowCode: escrowCode || `ESC-BKK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        status: 'PENDING',
        channel: null,
        bankDetails: {
          bankName,
          accountNumber: virtualAccountNumber,
          accountName,
          expiresInMinutes: 60,
        },
        ussdCode,
        createdAt: new Date().toISOString(),
        metadata,
      };

      paymentStore[reference] = paymentRecord;

      res.json({
        success: true,
        data: paymentRecord,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Payment initialization failed' });
    }
  },

  // Verify payment status
  async verifyPayment(req: Request, res: Response) {
    try {
      const { reference } = req.params;
      const payment = paymentStore[reference];

      if (!payment) {
        // Fallback for demo or direct references
        res.json({
          success: true,
          data: {
            reference,
            status: 'SUCCESSFUL',
            verifiedAt: new Date().toISOString(),
            amount: 1500000,
            channel: 'bank_transfer',
            gatewayResponse: 'Approved by NIBSS Settlement Switch',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Complete/simulate successful deposit
  async completePayment(req: Request, res: Response) {
    try {
      const { reference, channel = 'bank_transfer', testCardLast4 } = req.body;
      const payment = paymentStore[reference];

      const record = payment || {
        reference,
        amount: 2500000,
        escrowCode: `ESC-BKK-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      record.status = 'SUCCESSFUL';
      record.channel = channel;
      record.cardLast4 = testCardLast4 || '4084';
      record.paidAt = new Date().toISOString();
      record.gatewayResponse = 'Payment cleared via Paystack/Flutterwave Sandbox Gateway';

      paymentStore[reference] = record;

      res.json({
        success: true,
        message: 'Payment confirmed and escrow funds locked successfully',
        data: record,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
