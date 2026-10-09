import React from 'react';
import { Button } from '../components/common/Button.tsx';
import { Sprout, ShoppingBag, ShieldCheck, MapPin, Truck, PhoneCall, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          Potato Value Chain Linkage
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          How Bokkos AgroLink Works
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Designed specifically for Bokkos Local Government Area, Plateau State—Nigeria’s hub
          for Irish potato cultivation. Here is how our platform eliminates exploitative middlemen
          and secures farm gate transactions.
        </p>
      </div>

      {/* For Farmers */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">For Bokkos Potato Farmers</h2>
            <p className="text-xs text-stone-500">Daffo, Butura, Manguna, Richa, Mushere, and surrounding wards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="font-bold text-stone-900 text-sm">Post Harvest Ahead of Time</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              List variety (Caruso, Marabel, Nicola), bag quantity, and quality grade right before or during harvest.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="font-bold text-stone-900 text-sm">Set Your Own Price</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              You declare your farm gate price per bag without brokers forcing below-cost sales.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="font-bold text-stone-900 text-sm">Connect Directly via Phone</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Accept orders and arrange physical pickup/inspection in Bokkos directly with the buyer.
            </p>
          </div>
        </div>
      </div>

      {/* For Buyers */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">For Wholesalers & Commercial Buyers</h2>
            <p className="text-xs text-stone-500">Bulk distributors, chips manufacturers, supermarkets, and caterers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="font-bold text-stone-900 text-sm">Filter Real Bokkos Harvests</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Find Grade A processing tubers or certified seed potatoes with accurate harvest timestamps.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="font-bold text-stone-900 text-sm">Submit Purchase Order</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Specify your required bag count and target vehicle collection date in Bokkos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
            <span className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="font-bold text-stone-900 text-sm">Collect at Farm Gate</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Once approved, speak directly with the farmer to supervise loading and settle accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onNavigate('marketplace')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Explore Bokkos Potato Marketplace Now
        </Button>
      </div>
    </div>
  );
};
