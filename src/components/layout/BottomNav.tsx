import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { LayoutDashboard, ShoppingBag, PlusCircle, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1 px-2 shadow-lg">
      <div className="flex items-center justify-around">
        {user.role === 'FARMER' && (
          <>
            <button
              onClick={() => onNavigate('farmer-dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'farmer-dashboard'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'farmer-add-produce'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <PlusCircle className="w-5 h-5 mb-0.5 text-emerald-700" />
              <span>Add Produce</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-requests')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'farmer-requests'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span>Requests</span>
            </button>

            <button
              onClick={() => onNavigate('marketplace')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'marketplace'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span>Market</span>
            </button>
          </>
        )}

        {user.role === 'BUYER' && (
          <>
            <button
              onClick={() => onNavigate('marketplace')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'marketplace'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5 text-emerald-700" />
              <span>Browse</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'buyer-dashboard'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-requests')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'buyer-requests'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span>Requests</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-purchases')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'buyer-purchases'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 mb-0.5" />
              <span>Purchases</span>
            </button>
          </>
        )}

        {user.role === 'ADMIN' && (
          <>
            <button
              onClick={() => onNavigate('admin-overview')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'admin-overview'
                  ? 'text-blue-800 font-bold bg-blue-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onNavigate('admin-users')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'admin-users'
                  ? 'text-blue-800 font-bold bg-blue-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span>Users</span>
            </button>

            <button
              onClick={() => onNavigate('marketplace')}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium min-h-[48px] rounded-xl transition ${
                currentView === 'marketplace'
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span>Listings</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
