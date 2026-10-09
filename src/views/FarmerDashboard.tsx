import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ProduceListing, ProduceRequest, Transaction } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { StatusBadge, Badge } from '../components/common/Badge.tsx';
import { Modal, EmptyState } from '../components/common/Feedback.tsx';
import { WaybillReceiptModal } from '../components/common/WaybillReceiptModal.tsx';
import { FulfillTransactionModal } from '../components/common/FulfillTransactionModal.tsx';
import { 
  Sprout, 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertCircle,
  Truck,
  Trash2,
  Edit,
  Printer,
  ChevronRight,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

interface FarmerDashboardProps {
  onNavigate: (view: string) => void;
  onEditProduce?: (produce: ProduceListing) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigate, onEditProduce }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [requests, setRequests] = useState<ProduceRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab filters for requests
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED'>('ALL');

  // Accept request modal state
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [targetRequest, setTargetRequest] = useState<ProduceRequest | null>(null);
  const [pickupNotes, setPickupNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Transaction fulfillment & receipt modal states
  const [activeFulfillTx, setActiveFulfillTx] = useState<Transaction | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Delete listing state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listingsRes, requestsRes, txRes] = await Promise.all([
        api.getMyProduce(),
        api.getFarmerRequests(),
        api.getTransactions(),
      ]);

      if (listingsRes.success) setListings(listingsRes.produce);
      if (requestsRes.success) setRequests(requestsRes.requests);
      if (txRes.success) setTransactions(txRes.transactions);
    } catch (err) {
      console.error('Failed to load farmer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAcceptModal = (req: ProduceRequest) => {
    setTargetRequest(req);
    setPickupNotes(`Pickup at farm store, ${user?.farmerProfile?.wardLocation || 'Butura'} Ward, Bokkos LGA.`);
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!targetRequest) return;
    try {
      setActionLoading(true);
      const res = await api.updateRequestStatus(targetRequest.id, {
        status: 'ACCEPTED',
        pickupLocationNotes: pickupNotes,
      });
      if (res.success) {
        setAcceptModalOpen(false);
        setTargetRequest(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = window.prompt('Please provide a reason for declining this order:', 'Allocated to another batch or stock depleted.');
    if (reason === null) return;
    try {
      setActionLoading(true);
      const res = await api.rejectProduceRequest(requestId, reason);
      if (res.success) {
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      setDeleteLoading(true);
      const res = await api.deleteProduceListing(id);
      if (res.success) {
        setDeleteConfirmId(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleListingStatus = async (item: ProduceListing, newStatus: string) => {
    try {
      const res = await api.updateProduce(item.id, {
        status: newStatus,
      });
      if (res.success) {
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');
  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING_FULFILLMENT');
  const completedTransactions = transactions.filter((t) => t.status === 'COMPLETED');

  const totalBagsAvailable = listings
    .filter((l) => l.status === 'AVAILABLE')
    .reduce((acc, curr) => acc + (curr.quantityBags || 0), 0);

  const totalEarnedNaira = completedTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'ALL') return true;
    return r.status === requestFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          {user?.avatarUrl || user?.farmerProfile?.avatarUrl ? (
            <img
              src={user?.avatarUrl || user?.farmerProfile?.avatarUrl}
              alt={user?.fullName || 'Farmer Photo'}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
              {user?.fullName?.charAt(0) || 'F'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                Farmer Producer Portal
              </span>
              <span className="text-xs text-stone-500">
                Ward: <strong>{user?.farmerProfile?.wardLocation || 'Bokkos'}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              Welcome back, {user?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Manage your potato harvest batches, respond to wholesale buyers, and verify farm-gate collections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('farmer-add-produce')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Post New Potato Harvest
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Potatoes In Stock
          </span>
          <div className="text-2xl font-black text-stone-900">
            {totalBagsAvailable} <span className="text-xs font-normal text-stone-500">bags</span>
          </div>
          <span className="text-xs text-emerald-700 font-medium">
            Across {listings.filter((l) => l.status === 'AVAILABLE').length} active batches
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Pending Orders to Review
          </span>
          <div className="text-2xl font-black text-amber-600">
            {pendingRequests.length}
          </div>
          <span className="text-xs text-stone-500">
            {pendingRequests.length > 0 ? 'Requires your acceptance' : 'All orders reviewed'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Awaiting Vehicle Pickup
          </span>
          <div className="text-2xl font-black text-emerald-800">
            {pendingTransactions.length}
          </div>
          <span className="text-xs text-stone-500">
            Accepted orders ready for dispatch
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500 block">
            Completed Sales Volume
          </span>
          <div className="text-2xl font-black text-emerald-800">
            ₦{totalEarnedNaira.toLocaleString()}
          </div>
          <span className="text-xs text-stone-500">
            {completedTransactions.length} fulfilled deliveries
          </span>
        </div>
      </div>

      {/* Orders & Requests Management */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Buyer Purchase Requests
            </h2>
            <p className="text-xs text-stone-500">
              Wholesalers and processors requesting potato batches from your Bokkos farm
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setRequestFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                requestFilter === 'ALL'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setRequestFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                requestFilter === 'PENDING'
                  ? 'bg-white text-amber-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setRequestFilter('ACCEPTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                requestFilter === 'ACCEPTED'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Accepted ({acceptedRequests.length})
            </button>
          </div>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title="No Incoming Purchase Requests"
            description="When buyers discover your listed batches in the Bokkos marketplace and place an order, they will appear here."
            actionText="List More Potatoes"
            onAction={() => onNavigate('farmer-add-produce')}
          />
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center text-xs text-stone-500">
            No requests found in this filter category.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden divide-y divide-stone-100">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/50 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={req.status} />
                    <span className="text-sm font-bold text-stone-900">
                      {req.produceVariety} ({req.quantityBags} bags)
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      #{req.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Buyer: <strong className="text-stone-900">{req.buyerName}</strong>
                      {req.buyerBusinessName && ` (${req.buyerBusinessName})`}
                    </span>
                    {req.buyerPhone && (
                      <a
                        href={`tel:${req.buyerPhone}`}
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3 h-3" /> {req.buyerPhone}
                      </a>
                    )}
                    <span>
                      Total Value: <strong className="text-emerald-800">₦{req.totalPrice.toLocaleString()}</strong>
                    </span>
                    <span className="text-stone-400">
                      Requested: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {req.notes && (
                    <div className="p-2 bg-stone-50 rounded-lg text-xs text-stone-600 max-w-xl">
                      <span className="font-semibold text-stone-700">Buyer's note:</span> "{req.notes}"
                    </div>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block font-medium">
                      Pickup Scheduled: <strong>{req.proposedPickupDate || 'Agreed by phone'}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'PENDING' ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenAcceptModal(req)}
                        isLoading={actionLoading}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Accept & Reserve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectRequest(req.id)}
                        isLoading={actionLoading}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        Decline
                      </Button>
                    </>
                  ) : req.status === 'ACCEPTED' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const matchingTx = transactions.find((t) => t.requestId === req.id);
                          if (matchingTx) {
                            if (matchingTx.status === 'COMPLETED') {
                              setActiveReceiptTx(matchingTx);
                            } else {
                              setActiveFulfillTx(matchingTx);
                            }
                          } else {
                            alert('Transaction record is ready. You can verify pickup with the buyer.');
                          }
                        }}
                        leftIcon={<Truck className="w-4 h-4 text-emerald-700" />}
                      >
                        Fulfillment Status
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Transactions & Waybills Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Dispatches & Completed Waybills
            </h2>
            <p className="text-xs text-stone-500">
              Official fulfillment records, digital receipts, and farm-gate handover certificates
            </p>
          </div>
          <span className="text-xs text-stone-500">{transactions.length} records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            No transactions generated yet. When you accept a buyer request, a transaction waybill is created here for collection and settlement.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden divide-y divide-stone-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.status === 'COMPLETED' ? 'green' : 'amber'}>
                      {tx.status === 'COMPLETED' ? 'FULFILLED' : 'AWAITING PICKUP'}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-stone-900">
                      #{tx.id.toUpperCase().slice(0, 12)}
                    </span>
                    <span className="text-xs font-semibold text-stone-700">
                      {tx.variety} ({tx.quantity} {tx.unit})
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                    <span>Buyer: <strong>{tx.buyerName}</strong></span>
                    <span>Total Value: <strong className="text-emerald-800">₦{tx.totalAmount.toLocaleString()}</strong></span>
                    <span className="text-stone-400">
                      Date: {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {tx.completionNotes && (
                    <p className="text-[11px] text-stone-500 italic">
                      "{tx.completionNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {tx.status === 'PENDING_FULFILLMENT' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveFulfillTx(tx)}
                      leftIcon={<PackageCheck className="w-4 h-4" />}
                    >
                      Confirm Handover
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveReceiptTx(tx)}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                  >
                    View Waybill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Potato Batches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              My Listed Potato Harvests
            </h2>
            <p className="text-xs text-stone-500">
              Active batches visible to wholesale buyers in the Bokkos marketplace
            </p>
          </div>
          <span className="text-xs text-stone-500">{listings.length} batches total</span>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            title="You haven't listed any potato harvest"
            description="Publish your available potato varieties, bag sizes, and farm gate price to start receiving orders."
            actionText="List Your First Harvest"
            onAction={() => onNavigate('farmer-add-produce')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={item.status} />
                    <span className="text-xs font-semibold text-stone-500">
                      {item.bagType || item.unit}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      {item.variety}
                    </h3>
                    <span className="text-xs text-emerald-800 font-medium block">
                      {item.grade.replace('_', ' ')} • Bokkos {item.farmerWard} Ward
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Stock Available:</span>
                      <strong className="text-stone-900">{item.quantityBags} bags</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Farm Gate Price:</span>
                      <strong className="text-stone-900">₦{item.pricePerBag?.toLocaleString() || item.pricePerUnit?.toLocaleString()} / bag</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Harvest Date:</span>
                      <span className="text-stone-700">
                        {new Date(item.harvestDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-stone-500 italic line-clamp-2">
                      "{item.description}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <select
                      value={item.status}
                      onChange={(e) => handleToggleListingStatus(item, e.target.value)}
                      className="text-[11px] bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 outline-none text-stone-700"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="SOLD_OUT">Sold Out</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onEditProduce) onEditProduce(item);
                        onNavigate('farmer-add-produce');
                      }}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accept Request Modal with Pickup Notes */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        size="md"
      >
        <div className="text-left space-y-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              Accept Buyer Purchase Order
            </h3>
            <p className="text-xs text-stone-500">
              Confirm this order to reserve the potato bags and generate a collection waybill for {targetRequest?.buyerName}.
            </p>
          </div>

          {targetRequest && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold">
                Order: {targetRequest.quantityBags} bags of {targetRequest.produceVariety}
              </div>
              <div>Estimated Total: ₦{targetRequest.totalPrice.toLocaleString()}</div>
              <div>Buyer Contact: {targetRequest.buyerPhone}</div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
              Pickup Location Directions for Buyer
            </label>
            <textarea
              rows={3}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="e.g. Butura Hausa farm gate, along Bokkos-Barkin Ladi road. Call me 30 mins before arrival."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs outline-none focus:border-emerald-600 text-stone-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAcceptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmAccept}
              isLoading={actionLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Acceptance
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        size="sm"
      >
        <div className="text-left space-y-4">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 w-fit">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            Delete Potato Listing?
          </h3>
          <p className="text-xs text-stone-600">
            Are you sure you want to delete this listing? This batch will no longer be visible to buyers in the Bokkos marketplace.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => deleteConfirmId && handleDeleteListing(deleteConfirmId)}
              isLoading={deleteLoading}
              className="bg-rose-600 hover:bg-rose-700 border-rose-600 text-white"
            >
              Delete Listing
            </Button>
          </div>
        </div>
      </Modal>

      {/* Fulfillment Modal */}
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

      {/* Digital Waybill & Receipt Modal */}
      <WaybillReceiptModal
        isOpen={activeReceiptTx !== null}
        onClose={() => setActiveReceiptTx(null)}
        transaction={activeReceiptTx}
      />
    </div>
  );
};
