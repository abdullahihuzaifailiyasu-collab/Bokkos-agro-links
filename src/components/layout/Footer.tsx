import React from 'react';
import { Sprout, MapPin, ShieldCheck, Phone, Globe } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="font-bold text-lg text-white">
                Bokkos <span className="text-emerald-400">AgroLink</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-md">
              “Connecting Farmers to Better Markets.” A digital platform designed for the potato
              value chain in Bokkos Local Government Area, Plateau State, Nigeria. Bridging smallholder
              farmers directly with commercial wholesalers, food processors, and catering buyers.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bokkos LGA (Daffo, Butura, Manguna, Richa), Plateau State, Nigeria</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>https://bokkosagrolink.org</span>
            </div>
          </div>

          {/* Value Chain Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Potato Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-emerald-400 transition"
                >
                  Browse Potato Listings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-emerald-400 transition"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-emerald-400 transition"
                >
                  Register as Farmer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-emerald-400 transition"
                >
                  Register as Potato Buyer
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Project & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Research Context
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Final-Year B.Sc. Computer Science Research Project: <br />
              <strong className="text-stone-300">
                “Design and Development of a Digital Platform for Connecting Potato Farmers and Buyers in Bokkos LGA.”
              </strong>
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Role-Based Access Control Protected</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Bokkos AgroLink. All rights reserved.</p>
          <p>Designed for Nigerian Agricultural Reality • Low-Bandwidth Optimized</p>
        </div>
      </div>
    </footer>
  );
};
