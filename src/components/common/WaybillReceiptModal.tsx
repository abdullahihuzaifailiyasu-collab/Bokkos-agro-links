import React from 'react';
import { Transaction } from '../../types/index.ts';
import { Modal } from './Feedback.tsx';
import { Button } from './Button.tsx';
import { Badge } from './Badge.tsx';
import { 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Phone, 
  Truck, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface WaybillReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const WaybillReceiptModal: React.FC<WaybillReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaction.completedAt || transaction.createdAt).toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(transaction.completedAt || transaction.createdAt).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="text-left space-y-6">
        {/* Actions Bar (No-Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Official Trade Waybill & Tuber Receipt
              </h3>
              <p className="text-xs text-stone-500">
                Bokkos Local Government Area Potato Value Chain Registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRef}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy Ref'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-base">
                  BA
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight leading-none">
                    BOKKOS AGROLINK
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase">
                    Potato Value Chain Registry • Bokkos LGA, Plateau State
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 block font-semibold">
                WAYBILL / INVOICE REF
              </span>
              <span className="font-mono text-sm font-bold text-stone-900">
                #{transaction.id.toUpperCase()}
              </span>
              <div className="text-[11px] text-stone-500">
                Date: {formattedDate} ({formattedTime})
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Fulfillment Status:</span>
              <Badge variant={transaction.status === 'COMPLETED' ? 'green' : 'amber'}>
                {transaction.status === 'COMPLETED' ? 'FULFILLED & SETTLED' : 'PENDING PICKUP'}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Direct Farm-Gate Handover</span>
            </div>
          </div>

          {/* Parties: Producer & Consignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-stone-200">
            {/* Seller */}
            <div className="space-y-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-900 block">
                PRODUCER (FARMER)
              </span>
              <div className="font-bold text-stone-900 text-base">
                {transaction.farmerName}
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Ward: <strong>{transaction.farmerWard} Ward</strong>, Bokkos LGA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Tel: {transaction.farmerPhone}</span>
                </div>
              </div>
            </div>

            {/* Buyer */}
            <div className="space-y-2 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900 block">
                CONSIGNEE (BUYER)
              </span>
              <div className="font-bold text-stone-900 text-base">
                {transaction.buyerName}
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Tel: {transaction.buyerPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Pickup Location: {transaction.pickupLocationNotes || 'Bokkos Town Collection Point'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commodity Details Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Commodity Specifications
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Variety</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Packaging / Unit</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  <tr>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {transaction.variety} Potato
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-[11px] font-semibold">
                        {transaction.grade.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {transaction.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900">
                      {transaction.quantity} bags
                    </td>
                    <td className="py-3 px-3 text-right text-stone-700">
                      ₦{transaction.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-800 text-sm">
                      ₦{transaction.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Completion & Verification Notes */}
          {transaction.completionNotes && (
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-stone-700 block">Fulfillment Inspection Notes:</span>
              <p className="text-stone-600 italic">"{transaction.completionNotes}"</p>
            </div>
          )}

          {/* Grand Total & Certification Footer */}
          <div className="pt-4 border-t-2 border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-[11px] text-stone-500 max-w-sm space-y-0.5">
              <p className="font-semibold text-stone-700">Digital Authenticity Verification</p>
              <p>Generated via Bokkos AgroLink Platform. Confirms farm gate handover and bilateral payment settlement.</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                Total Transaction Value
              </span>
              <span className="text-2xl font-black text-emerald-900">
                ₦{transaction.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="flex justify-end print:hidden">
          <Button variant="outline" size="md" onClick={onClose}>
            Close Waybill
          </Button>
        </div>
      </div>
    </Modal>
  );
};
