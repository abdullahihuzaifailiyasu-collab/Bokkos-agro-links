import React, { useState, useEffect } from 'react';
import { Button } from '../components/common/Button.tsx';
import { Badge, StatusBadge } from '../components/common/Badge.tsx';
import { ProduceListing } from '../types/index.ts';
import { api } from '../services/api.ts';
import { 
  Sprout, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Users, 
  BarChart3, 
  PhoneCall, 
  BadgeCheck,
  Award,
  Lock,
  Phone
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onSelectListing?: (listing: ProduceListing) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectListing }) => {
  const [featuredListings, setFeaturedListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getProduceListings({ status: 'AVAILABLE', limit: 4 });
        if (res.success) {
          setFeaturedListings(res.produce);
        }
      } catch (err) {
        console.error('Failed to load featured produce:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Bokkos LGA Potato Value Chain Network
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Connecting Bokkos Potato Farmers Directly to Verified Buyers.
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
                Eliminate exploitative middlemen and cut post-harvest losses. Farmers in Daffo,
                Butura, Manguna, and Richa list freshly harvested potatoes directly for bulk wholesalers,
                chips processors, and catering buyers across Nigeria.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold shadow-lg"
                  onClick={() => onNavigate('marketplace')}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Browse Fresh Potatoes
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs font-semibold"
                  onClick={() => onNavigate('register')}
                >
                  List Your Harvest (Farmers)
                </Button>
              </div>

              {/* Trust Metric Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-800/60 max-w-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-300">100%</div>
                  <div className="text-xs text-emerald-200/80">Direct Farm Gate</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-300">₦0</div>
                  <div className="text-xs text-emerald-200/80">Commission Fee</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-300">5+</div>
                  <div className="text-xs text-emerald-200/80">Bokkos Wards Covered</div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Banner */}
            <div className="lg:col-span-5">
              <div className="bg-stone-900/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-700/50 shadow-2xl text-left space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Live Market Highlight
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Bokkos Main Market</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-400 font-medium block">Current Benchmark</span>
                      <span className="text-base font-bold text-white">Caruso (Grade A) - 100kg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-400">Farm Gate</span>
                      <span className="text-base font-bold text-emerald-400 block">₦48,000</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-400 font-medium block">Seed Tubers</span>
                      <span className="text-base font-bold text-white">Marabel Seed - 50kg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-stone-400">Certified Seed</span>
                      <span className="text-base font-bold text-emerald-400 block">₦32,000</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3.5 text-xs text-emerald-200/90 flex items-start gap-2.5">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Academic Project:</strong> Designed specifically for Bokkos local LGA
                    conditions—supports low data usage and direct farmer mobile contact for pickup coordination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Why Bokkos AgroLink?
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            Addressing key systemic bottlenecks in the Plateau potato value chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-sm transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">
              Fair & Transparent Pricing
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Farmers determine their own farm-gate prices based on actual bag sizes and variety
              grades, preventing middlemen from suppressing farm revenues.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-sm transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">
              Reduced Post-Harvest Loss
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              List harvests before or right as they come out of the ground. Coordinate direct pickups
              in Bokkos so produce reaches processing centers in Abuja, Jos, or Lagos promptly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-sm transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">
              Verified Bokkos Farmers & Buyers
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every farmer profile features their Bokkos LGA ward location and primary farm size.
              Buyers can inspect listings by variety, harvest date, and quality grade.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Fresh Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              Fresh Potato Batches Available
            </h2>
            <p className="text-sm text-stone-500">
              Directly from farms in Butura, Daffo, Manguna, and Bokkos Central
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('marketplace')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All in Marketplace
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3">
                <div className="h-32 bg-stone-100 rounded-xl"></div>
                <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                <div className="h-8 bg-stone-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500">No active potato batches right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden text-left"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={item.grade} />
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.bagType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-lg leading-snug">
                      {item.variety} Potato
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.farmerWard}, Bokkos LGA</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block">Unit Price</span>
                      <span className="text-lg font-black text-stone-900">
                        ₦{item.pricePerBag.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-500 block">Stock Left</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {item.quantityBags} bags
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 italic">
                    "{item.description}"
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (onSelectListing) onSelectListing(item);
                      onNavigate('marketplace');
                    }}
                  >
                    View Details & Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Phase 4 Value Chain Infrastructure Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100/80 rounded-3xl p-6 sm:p-10 border border-stone-200/80 space-y-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Integrated Value Chain Modules
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
                Data-Driven Agricultural Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                Advanced spatial mapping, price intelligence benchmarks, rural haulage freight, and post-harvest loss prevention tools for Bokkos LGA.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('marketplace')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Full Platform
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Price Monitor */}
            <div 
              onClick={() => onNavigate('prices')}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition">
                  Price Benchmark Index
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Real-time price discovery comparing Bokkos farm-gate with wholesale markets in Abuja, Lagos, Jos, and Kano.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-emerald-800">
                <span>View Price Trends</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 2: Spatial Ward Map */}
            <div 
              onClick={() => onNavigate('bokkos-map')}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-sky-800 transition">
                  Bokkos Ward GIS Map
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Interactive cartography of 11 wards (Butura, Daffo, Manguna, etc.) with soil, elevation, and harvest stock.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-sky-800">
                <span>Explore Wards</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 3: Logistics & Haulage */}
            <div 
              onClick={() => onNavigate('logistics')}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-800 transition">
                  Haulage & Freight Hub
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Directory of verified rural truck haulers, pickup dispatchers, and direct per-bag freight calculators.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-800">
                <span>Find Transporters</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 4: Post-Harvest Advisory */}
            <div 
              onClick={() => onNavigate('advisory')}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-purple-800 transition">
                  Post-Harvest Advisory
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Diffused Light Storage (DLS) construction, skin-set testing, disease triage, and seasonal cropping calendar.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-purple-800">
                <span>Storage Protocols</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 5: Institutional Aggregation & Settlement Suite */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-left space-y-8 relative overflow-hidden border border-emerald-900">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Phase 5 Institutional Aggregation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Institutional Trade & Cooperative Settlement Hub
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Equipping Bokkos smallholder farming clusters to aggregate bulk trailer-loads (600 bags), obtain certified laboratory quality passports, secure bank-backed escrow payments, and trade via low-bandwidth offline USSD.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {/* Box 1 */}
            <div 
              onClick={() => onNavigate('cooperative-pools')}
              className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/80 text-emerald-300 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition">
                  Co-op Aggregation Pools
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Smallholders pool 20–50 bags into unified 600-bag consignments with locked corporate offtake prices.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 pt-2 border-t border-stone-700">
                <span>Pledge Harvest</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Box 2 */}
            <div 
              onClick={() => onNavigate('quality-passport')}
              className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-900/80 text-purple-300 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition">
                  Quality Passports & Lab
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Laboratory assay certification (dry matter %, skin-set, caliber) with PADP stamps & verifiable QR codes.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-300 pt-2 border-t border-stone-700">
                <span>Verify Passport</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Box 3 */}
            <div 
              onClick={() => onNavigate('escrow-vault')}
              className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-900/80 text-sky-300 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition">
                  Smart Escrow Vault
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Buyer locks funds prior to trailer dispatch. Zero payment defaults with automated NIBSS bank payouts upon arrival.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-sky-300 pt-2 border-t border-stone-700">
                <span>View Escrow</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Box 4 */}
            <div 
              onClick={() => onNavigate('ussd-gateway')}
              className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-900/80 text-amber-300 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition">
                  Rural USSD *384*24#
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Interactive GSM feature phone simulator with Hausa and English SMS intelligence for off-grid rural wards.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300 pt-2 border-t border-stone-700">
                <span>Launch USSD</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Step-by-Step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 text-left">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-white">
              How Bokkos AgroLink Connects the Chain
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Farmers List Harvest</h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Farmers input their potato variety (Caruso, Marabel, Nicola), bag quantity, harvest
                date, and farm location in Bokkos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Buyers Place Requests</h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Commercial buyers, wholesalers, and caterers browse available stock and submit purchase
                requests with intended collection dates and notes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Direct Handover & Payment</h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Farmer accepts the request. Both parties connect directly via phone for physical
                inspection, farm-gate collection, and direct settlement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
