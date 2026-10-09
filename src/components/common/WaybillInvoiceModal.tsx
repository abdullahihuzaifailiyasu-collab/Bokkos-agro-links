import React from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  QrCode, 
  Building2,
  Calendar,
  MapPin,
  Scale,
  PackageCheck
} from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { EscrowTransaction } from '../../types/index.ts';

interface WaybillInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: EscrowTransaction;
}

export const WaybillInvoiceModal: React.FC<WaybillInvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto overflow-hidden border border-stone-200 shadow-2xl text-left">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-stone-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">Official Plateau State Produce Transit Waybill</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="text-white border-stone-700 bg-stone-800 hover:bg-stone-700 text-xs font-bold"
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-waybill-doc" className="p-6 sm:p-10 space-y-6 text-stone-900 bg-white">
          
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    BA
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-emerald-950">
                      BOKKOS AGROLINK
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                      Plateau State Agricultural Transit Authority
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md border border-emerald-300 inline-block">
                  OFFICIAL WAYBILL & ESCROW VOUCHER
                </span>
                <div className="font-mono text-xs font-black text-stone-800 mt-1">
                  NO: {transaction.waybillNumber}
                </div>
                <div className="text-2xs text-stone-500">
                  Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Key Reference Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-2xs text-stone-400 uppercase font-semibold block">Escrow Contract</span>
              <span className="font-bold text-stone-900 font-mono">{transaction.escrowCode}</span>
            </div>
            <div>
              <span className="text-2xs text-stone-400 uppercase font-semibold block">Quality Passport</span>
              <span className="font-bold text-emerald-700 font-mono">{transaction.qualityPassportCode}</span>
            </div>
            <div>
              <span className="text-2xs text-stone-400 uppercase font-semibold block">Vault Status</span>
              <span className="font-black text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] inline-block">
                {transaction.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-2xs text-stone-400 uppercase font-semibold block">Transit Route</span>
              <span className="font-bold text-stone-900">Bokkos → {transaction.destinationCity}</span>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Origin Depot & Consignor
              </span>
              <div className="font-bold text-stone-900 text-sm">{transaction.farmerName}</div>
              <div className="text-stone-600 text-2xs space-y-0.5">
                <div>Origin Depot: {transaction.originDepot}</div>
                <div>LGA: Bokkos Local Government Area, Plateau State</div>
                <div>Contact Phone: {transaction.farmerPhone}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-700" /> Consignee / Buyer
              </span>
              <div className="font-bold text-stone-900 text-sm">{transaction.buyerName}</div>
              <div className="text-stone-600 text-2xs space-y-0.5">
                <div>Destination: {transaction.destinationCity}</div>
                <div>Contact Phone: {transaction.buyerPhone}</div>
                <div>Settlement: NIBSS Direct Disbursement on Arrival</div>
              </div>
            </div>
          </div>

          {/* Consignment Particulars Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-700 font-bold text-2xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Commodity & Cultivar</th>
                  <th className="p-3 text-center">Packaging</th>
                  <th className="p-3 text-right">Volume</th>
                  <th className="p-3 text-right">Escrow Locked Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-stone-900">{transaction.relatedEntity}</div>
                    <div className="text-2xs text-stone-500">Certified PADP High-Grade Nicola / Caruso Potato Batch</div>
                  </td>
                  <td className="p-3 text-center text-stone-700 font-mono">
                    50kg Polypropylene Jute Bags
                  </td>
                  <td className="p-3 text-right font-black text-stone-900">
                    {transaction.quantityBags.toLocaleString()} Bags
                  </td>
                  <td className="p-3 text-right font-black text-emerald-900 text-sm">
                    ₦{transaction.totalAmountNaira.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vehicle & Checkpoint Seal */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-amber-900 uppercase flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-800" /> Logistics Carrier & Security Seals
              </span>
              <span className="font-mono text-2xs font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                SEAL #{transaction.securitySealNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs text-stone-700 pt-1">
              <div>Assigned Truck: <strong className="text-stone-900">{transaction.logisticsProvider}</strong></div>
              <div>Inspection Officer: <strong className="text-stone-900">Engr. D. Bot (PADP)</strong></div>
              <div>Highway Route: <strong className="text-stone-900">A234 Jos-Akwanga-Lafia-Enugu</strong></div>
            </div>
          </div>

          {/* Signatures & QR Code */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-stone-300 rounded-xl bg-white">
                <QrCode className="w-14 h-14 text-stone-900" />
              </div>
              <div className="text-2xs text-stone-500 space-y-0.5">
                <div className="font-bold text-stone-900">Digital NIBSS / PADP Manifest QR</div>
                <div>Scan with mobile phone to verify escrow lock status</div>
                <div className="font-mono text-[10px] text-stone-400">HASH: SHA256-BKK-{transaction.waybillNumber}</div>
              </div>
            </div>

            <div className="flex gap-8 text-center text-2xs text-stone-600">
              <div className="space-y-6">
                <div className="w-32 border-b border-stone-400 pb-1 font-mono text-[10px] italic text-stone-500">
                  {transaction.farmerName.slice(0, 14)}...
                </div>
                <span className="font-bold block uppercase text-stone-700">Depot Loader Signature</span>
              </div>
              <div className="space-y-6">
                <div className="w-32 border-b border-stone-400 pb-1 font-mono text-[10px] italic text-emerald-800">
                  ✓ VERIFIED PADP SEAL
                </div>
                <span className="font-bold block uppercase text-stone-700">Quality Inspector Stamp</span>
              </div>
            </div>
          </div>

          {/* Footer Legal Disclaimer */}
          <div className="text-[10px] text-stone-400 text-center leading-relaxed pt-2 border-t border-stone-100">
            This document constitutes an official digital haulage manifest under the Plateau State Agricultural Produce Logistics Law. Funds held in neutral trust under Bokkos AgroLink Escrow Vault are released upon verifiable warehouse scanning.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-end gap-3 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
          >
            Print / Save as PDF
          </Button>
        </div>

      </div>
    </div>
  );
};
