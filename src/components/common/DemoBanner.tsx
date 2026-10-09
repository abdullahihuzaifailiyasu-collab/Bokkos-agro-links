import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ShieldCheck, UserCheck, ShoppingBag, Sprout, Share2 } from 'lucide-react';
import { ShareAppModal } from './ShareAppModal.tsx';

export const DemoBanner: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="bg-stone-900 text-stone-300 text-xs px-4 py-2 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider">
            Demo Sandbox
          </span>
          <span className="hidden sm:inline text-stone-400">
            Quickly test roles for Bokkos LGA research:
          </span>
          {user ? (
            <span className="text-white font-medium">
              Logged in as: <strong className="text-emerald-400">{user.fullName}</strong> ({user.role})
            </span>
          ) : (
            <span className="text-stone-400">Viewing as Visitor</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => demoLogin('farmer1')}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-emerald-950 hover:text-emerald-300 border border-stone-700 transition flex items-center gap-1.5"
            title="Switch to Farmer Baba Danladi (Butura)"
          >
            <Sprout className="w-3 h-3 text-emerald-400" />
            <span>Farmer (Danladi)</span>
          </button>

          <button
            onClick={() => demoLogin('farmer2')}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-emerald-950 hover:text-emerald-300 border border-stone-700 transition flex items-center gap-1.5"
            title="Switch to Farmer Esther (Daffo)"
          >
            <Sprout className="w-3 h-3 text-emerald-400" />
            <span>Farmer (Esther)</span>
          </button>

          <button
            onClick={() => demoLogin('buyer1')}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-950 hover:text-amber-300 border border-stone-700 transition flex items-center gap-1.5"
            title="Switch to Buyer Alhaji Musa (Wholesaler)"
          >
            <ShoppingBag className="w-3 h-3 text-amber-400" />
            <span>Buyer (Musa)</span>
          </button>

          <button
            onClick={() => demoLogin('buyer2')}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-950 hover:text-amber-300 border border-stone-700 transition flex items-center gap-1.5"
            title="Switch to Buyer Chinedu (Processor)"
          >
            <ShoppingBag className="w-3 h-3 text-amber-400" />
            <span>Buyer (Chinedu)</span>
          </button>

          <button
            onClick={() => demoLogin('admin')}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-blue-950 hover:text-blue-300 border border-stone-700 transition flex items-center gap-1.5"
            title="Switch to Admin Supervisor Abdullahi Huzaifa Iliyas"
          >
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span>Admin (Abdullahi)</span>
          </button>

          <button
            onClick={() => setShareOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-900/90 text-emerald-200 hover:bg-emerald-800 hover:text-white border border-emerald-700 transition flex items-center gap-1.5 font-medium ml-1"
            title="Host & Share Bokkos AgroLink Online"
          >
            <Share2 className="w-3 h-3 text-emerald-300" />
            <span>Host & Share</span>
          </button>
        </div>
      </div>

      <ShareAppModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
};
