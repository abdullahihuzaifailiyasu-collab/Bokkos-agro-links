import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Button } from '../components/common/Button.tsx';
import { EmptyState } from '../components/common/Feedback.tsx';
import { Bell, CheckCheck, Clock, ArrowLeft, ExternalLink, ChevronRight } from 'lucide-react';

export const NotificationsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.linkUrl) {
      if (n.linkUrl.includes('/farmer/requests') || n.linkUrl.includes('/farmer/')) {
        onNavigate('farmer-dashboard');
      } else if (n.linkUrl.includes('/buyer/')) {
        onNavigate('buyer-dashboard');
      } else if (n.linkUrl.includes('/produce')) {
        onNavigate('marketplace');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Notifications & Trade Alerts
          </h1>
          <p className="text-xs text-stone-500">
            Real-time updates regarding your Bokkos potato orders, status confirmations, and waybills
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'UNREAD'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-stone-200 animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications Yet'}
          description="When farmers or buyers interact with your potato batches or orders, updates will appear here."
          icon={<Bell className="w-6 h-6 text-stone-400" />}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden divide-y divide-stone-100">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition cursor-pointer ${
                !n.isRead ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-stone-50'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                  )}
                  <h4 className={`text-sm ${!n.isRead ? 'font-bold text-stone-900' : 'font-medium text-stone-800'}`}>
                    {n.title}
                  </h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-4">
                  {n.message}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-stone-400 pl-4 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="shrink-0 text-stone-400 pt-1">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
