import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ProduceRequest, Transaction } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { StatusBadge, Badge } from '../components/common/Badge.tsx';
import { EmptyState, Modal } from '../components/common/Feedback.tsx';
import { WaybillReceiptModal } from '../components/common/WaybillReceiptModal.tsx';
import { FulfillTransactionModal } from '../components/common/FulfillTransactionModal.tsx';
import { 
  ShoppingBag, 
  FileText, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  ArrowRight,
  PackageCheck,
  Printer,
  XCircle,
  Truck,
  MapPin,
  Clock
} from 'lucide-react';

export const BuyerDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProduceRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter tab
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'>('ALL');

  // Modals
  const [activeFulfillTx, setActiveFulfillTx] = useState<Transaction | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, txRes] = await Promise.all([
        api.getBuyerRequests(),
        api.getBuyerTransactions(),
      ]);
      if (reqRes.success) setRequests(reqRes.requests);
      if (txRes.success) setTransactions(txRes.transactions);
    } catch (err) {
      console.error('Failed to load buyer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelRequest = async (id: string) => {
    try {
      setCancelLoading(true);
      const res = await api.cancelProduceRequest(id);
      if (res.success) {
        setCancelModalId(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request');
    } finally {
      setCancelLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');
  const completedTransactions = transactions.filter((t) => t.status === 'COMPLETED');
  const totalSpend = completedTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'COMPLETED') return false;
    return r.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          {user?.avatarUrl || user?.buyerProfile?.avatarUrl ? (
            <img
              src={user?.avatarUrl || user?.buyerProfile?.avatarUrl}
              alt={user?.fullName || 'Buyer Photo'}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-600 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
              {user?.fullName?.charAt(0) || 'B'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase">
                Buyer Procurement Portal
              </span>
              <span className="text-xs text-stone-500">
                Business: <strong>{user?.buyerProfile?.businessName || user?.fullName}</strong> ({user?.buyerProfile?.buyerType || 'Wholesaler'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Track your Bokkos potato orders, verify pickup dispatches, and download verified trade receipts
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onNavigate('marketplace')}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
        >
          Browse Bokkos Harvest
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Awaiting Farmer Confirmation
          </span>
          <div className="text-2xl font-black text-amber-600">{pendingRequests.length}</div>
          <span className="text-xs text-stone-500">Pending review by farmers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Accepted & Ready for Pickup
          </span>
          <div className="text-2xl font-black text-emerald-700">{acceptedRequests.length}</div>
          <span className="text-xs text-emerald-800 font-medium">Ready for dispatch verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Fulfilled Purchases
          </span>
          <div className="text-2xl font-black text-stone-900">{completedTransactions.length}</div>
          <span className="text-xs text-stone-500">Official settled waybills</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Total Sourced Value
          </span>
          <div className="text-2xl font-black text-emerald-800">
            ₦{totalSpend.toLocaleString()}
          </div>
          <span className="text-xs text-stone-500">Direct from Bokkos farm gates</span>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'ALL'
              ? 'bg-emerald-900 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All Active Orders ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Pending Confirmation ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('ACCEPTED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'ACCEPTED'
              ? 'bg-emerald-700 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Ready for Pickup ({acceptedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'COMPLETED'
              ? 'bg-stone-800 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Waybill History ({completedTransactions.length})
        </button>
      </div>

      {/* Active Orders List */}
      {activeTab !== 'COMPLETED' && (
        <section className="space-y-4">
          {requests.length === 0 ? (
            <EmptyState
              title="No Active Purchase Requests"
              description="Browse available potato batches in Bokkos LGA to place orders directly with verified local farmers."
              actionText="Browse Bokkos Potatoes"
              onAction={() => onNavigate('marketplace')}
            />
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center text-xs text-stone-500">
              No purchase orders found in this filter category.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const matchingTx = transactions.find((t) => t.requestId === req.id);
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.status} />
                        <span className="text-xs font-bold text-stone-800">
                          #{req.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-stone-400">
                          Ordered on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {req.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelModalId(req.id)}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs py-1"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-stone-400 uppercase tracking-wider text-[10px] block">
                          Potato Batch
                        </span>
                        <span className="text-sm font-bold text-stone-900 block mt-0.5">
                          {req.produceVariety} ({req.quantityBags} bags)
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 uppercase tracking-wider text-[10px] block">
                          Farmer Contact & Ward
                        </span>
                        <span className="text-sm font-bold text-stone-900 block mt-0.5">
                          {req.farmerName}
                        </span>
                        {req.farmerPhone && (
                          <a
                            href={`tel:${req.farmerPhone}`}
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                          >
                            <Phone className="w-3 h-3" /> {req.farmerPhone}
                          </a>
                        )}
                      </div>

                      <div>
                        <span className="text-stone-400 uppercase tracking-wider text-[10px] block">
                          Total Payable
                        </span>
                        <span className="text-base font-black text-stone-900 block mt-0.5">
                          ₦{req.totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Target Pickup: {req.proposedPickupDate || 'Agreed by phone'}
                        </span>
                      </div>
                    </div>

                    {req.status === 'ACCEPTED' && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Farmer Accepted Your Order! Ready for Collection.</span>
                          </div>
                          <p className="text-emerald-950 pl-6 text-[11px]">
                            Contact farmer at <strong>{req.farmerPhone}</strong> to coordinate vehicle arrival at farm gate in Bokkos.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {matchingTx ? (
                            <>
                              {matchingTx.status === 'PENDING_FULFILLMENT' ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setActiveFulfillTx(matchingTx)}
                                  leftIcon={<PackageCheck className="w-4 h-4" />}
                                >
                                  Confirm Pickup & Settle
                                </Button>
                              ) : null}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveReceiptTx(matchingTx)}
                                leftIcon={<Printer className="w-3.5 h-3.5" />}
                              >
                                View Waybill
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alert(`Call ${req.farmerPhone} to confirm collection.`)}
                            >
                              Call Farmer
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Completed Purchases Section */}
      {(activeTab === 'ALL' || activeTab === 'COMPLETED') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Fulfilled Purchases & Official Waybills
              </h2>
              <p className="text-xs text-stone-500">
                Verifiable trade documentation and digital receipts for transported Bokkos potatoes
              </p>
            </div>
            <span className="text-xs text-stone-500">{completedTransactions.length} settled</span>
          </div>

          {completedTransactions.length === 0 ? (
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-center text-xs text-stone-500">
              No completed transactions yet. Once an accepted order is collected and payment is verified, your official waybill will be stored here.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden divide-y divide-stone-100">
              {completedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="green">FULFILLED & SETTLED</Badge>
                      <span className="font-mono font-bold text-stone-900">
                        #{tx.id.toUpperCase().slice(0, 12)}
                      </span>
                      <span className="font-semibold text-stone-800">
                        {tx.variety} ({tx.quantity} {tx.unit})
                      </span>
                    </div>

                    <div className="text-stone-600 flex flex-wrap items-center gap-3">
                      <span>Producer: <strong>{tx.farmerName}</strong> ({tx.farmerWard} Ward)</span>
                      <span>Total Paid: <strong className="text-emerald-800">₦{tx.totalAmount.toLocaleString()}</strong></span>
                      <span className="text-stone-400">
                        Completed: {new Date(tx.completedAt || tx.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {tx.completionNotes && (
                      <p className="text-[11px] text-stone-500 italic">
                        "{tx.completionNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveReceiptTx(tx)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                    >
                      Print Waybill
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={cancelModalId !== null}
        onClose={() => setCancelModalId(null)}
        size="sm"
      >
        <div className="text-left space-y-4">
          <h3 className="text-lg font-bold text-stone-900">
            Cancel Purchase Request?
          </h3>
          <p className="text-xs text-stone-600">
            Are you sure you want to cancel this pending request? The farmer will be notified and the reservation will be released.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalId(null)}
            >
              Keep Order
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => cancelModalId && handleCancelRequest(cancelModalId)}
              isLoading={cancelLoading}
              className="bg-rose-600 hover:bg-rose-700 border-rose-600 text-white"
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Fulfillment Verification Modal */}
      <FulfillTransactionModal
        isOpen={activeFulfillTx !== null}
        onClose={() => setActiveFulfillTx(null)}
        transaction={activeFulfillTx}
        onCompleted={async (completedTx) => {
          setActiveFulfillTx(null);
          await loadData();
          setActiveReceiptTx(completedTx);
        }}
      />

      {/* Official Waybill Modal */}
      <WaybillReceiptModal
        isOpen={activeReceiptTx !== null}
        onClose={() => setActiveReceiptTx(null)}
        transaction={activeReceiptTx}
      />
    </div>
  );
};
