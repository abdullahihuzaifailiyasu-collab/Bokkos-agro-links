import React, { useState } from 'react';
import { Transaction } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { Modal } from './Feedback.tsx';
import { Button } from './Button.tsx';
import { Input } from './Input.tsx';
import { CheckCircle2, ShieldCheck, Truck, AlertCircle } from 'lucide-react';

interface FulfillTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onCompleted: (completedTx: Transaction) => void;
}

export const FulfillTransactionModal: React.FC<FulfillTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onCompleted,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'CASH_ON_DELIVERY' | 'POS'>('TRANSFER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsSubmitting(true);
      const paymentLabel = 
        paymentMethod === 'TRANSFER' 
          ? 'Direct Bank Transfer' 
          : paymentMethod === 'CASH_ON_DELIVERY' 
          ? 'Cash on Delivery at Farm Gate' 
          : 'PoS Terminal / Mobile Transfer';

      const completionText = `Payment settled via ${paymentLabel}. ${notes.trim() ? `Note: ${notes.trim()}` : 'Tubers inspected and accepted.'}`;

      const res = await api.completeTransaction(transaction.id, {
        completionNotes: completionText,
      });

      if (res.success && res.transaction) {
        onCompleted(res.transaction);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-left space-y-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Confirm Order Fulfillment</span>
          </div>
          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            Verify Collection & Settlement
          </h3>
          <p className="text-xs text-stone-500">
            Confirm that the potato bags have been inspected, handed over at Bokkos, and payment settled.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Summary Box */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
          <div className="flex justify-between pb-2 border-b border-stone-200">
            <span className="text-stone-500">Order Reference:</span>
            <span className="font-mono font-bold text-stone-900">#{transaction.id.slice(0, 10)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Produce:</span>
            <strong className="text-stone-900">{transaction.variety} ({transaction.grade.replace('_', ' ')})</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Quantity:</span>
            <strong className="text-stone-900">{transaction.quantity} {transaction.unit}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Farmer:</span>
            <span className="text-stone-800">{transaction.farmerName} ({transaction.farmerWard} Ward)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Buyer:</span>
            <span className="text-stone-800">{transaction.buyerName}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-stone-200 text-sm">
            <span className="font-bold text-stone-900">Total Settlement:</span>
            <strong className="font-extrabold text-emerald-800">₦{transaction.totalAmount.toLocaleString()}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1.5">
              Settlement Method Used
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                Cash at Farm Gate
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('POS')}
                className={`p-2.5 rounded-xl border text-center transition font-semibold ${
                  paymentMethod === 'POS'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                PoS / Agent
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
              Quality Inspection & Pickup Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tubers inspected, clean and healthy, loaded into pickup truck."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs outline-none focus:border-emerald-600 text-stone-900"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Marking this as completed will update your official trade registry and generate a verifiable Digital Waybill & Receipt.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Complete Order
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
