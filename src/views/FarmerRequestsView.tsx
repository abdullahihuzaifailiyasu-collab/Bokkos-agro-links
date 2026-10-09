import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ProduceRequest } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { StatusBadge, Badge } from '../components/common/Badge.tsx';
import { EmptyState } from '../components/common/Feedback.tsx';
import { ArrowLeft, Phone, Calendar, CheckCircle2, XCircle, MapPin } from 'lucide-react';

export const FarmerRequestsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [requests, setRequests] = useState<ProduceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerRequests();
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to load farmer requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await api.acceptProduceRequest(id);
      if (res.success) {
        await fetchRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await api.rejectProduceRequest(id);
      if (res.success) {
        await fetchRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={() => onNavigate('farmer-dashboard')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Incoming Buyer Requests
          </h1>
          <p className="text-xs text-stone-500">
            Confirm orders, verify pickup dates, and coordinate directly with buyers
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-stone-200 animate-pulse h-28"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No Requests Received Yet"
          description="Buyers looking for potato stocks in Bokkos will contact you when they submit orders."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <span className="text-xs font-semibold text-stone-500">
                    Order Ref: #{req.id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs text-stone-400">
                  Received: {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block">
                    Variety & Bags
                  </span>
                  <span className="text-sm font-bold text-stone-900 block mt-0.5">
                    {req.produceVariety} ({req.quantityBags} bags)
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block">
                    Buyer Details
                  </span>
                  <span className="text-sm font-bold text-stone-900 block mt-0.5">
                    {req.buyerName}
                  </span>
                  {req.buyerPhone && (
                    <a
                      href={`tel:${req.buyerPhone}`}
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                    >
                      <Phone className="w-3 h-3" /> {req.buyerPhone}
                    </a>
                  )}
                </div>

                <div>
                  <span className="text-stone-400 uppercase tracking-wider text-[10px] block">
                    Agreed Total
                  </span>
                  <span className="text-base font-black text-stone-900 block mt-0.5">
                    ₦{req.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Scheduled: {req.proposedPickupDate || 'Not specified'}
                  </span>
                </div>
              </div>

              {req.notes && (
                <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600">
                  <span className="font-semibold text-stone-700">Buyer's note:</span> {req.notes}
                </div>
              )}

              {req.status === 'PENDING' && (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(req.id)}
                    isLoading={actionLoadingId === req.id}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Decline Order
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAccept(req.id)}
                    isLoading={actionLoadingId === req.id}
                  >
                    Accept Order & Reserve Stock
                  </Button>
                </div>
              )}

              {req.status === 'ACCEPTED' && (
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/50 p-3 rounded-xl">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Order accepted. Contact buyer via phone to arrange inspection and collection at Bokkos.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
