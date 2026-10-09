import React, { useState } from 'react';
import { Button } from '../components/common/Button.tsx';
import { 
  Sprout, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sun, 
  Wind, 
  Thermometer, 
  Droplets, 
  Calendar, 
  BookOpen, 
  Calculator,
  ChevronRight,
  ArrowRight,
  Download
} from 'lucide-react';

interface PostHarvestAdvisoryViewProps {
  onNavigate: (view: string) => void;
}

export const PostHarvestAdvisoryView: React.FC<PostHarvestAdvisoryViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'curing' | 'diseases' | 'calendar' | 'calculator'>('storage');

  // Loss Calculator State
  const [farmBagsHarvested, setFarmBagsHarvested] = useState<number>(200);
  const [currentLossPercentage, setCurrentLossPercentage] = useState<number>(25);
  const [expectedBagPrice, setExpectedBagPrice] = useState<number>(34000);

  const estimatedLostBags = Math.round(farmBagsHarvested * (currentLossPercentage / 100));
  const estimatedMonetaryLoss = estimatedLostBags * expectedBagPrice;
  // With improved curing and DLS, loss drops to ~8%
  const improvedLossBags = Math.round(farmBagsHarvested * 0.08);
  const bagsSavedWithBestPractices = estimatedLostBags - improvedLossBags;
  const financialRevenueSaved = bagsSavedWithBestPractices * expectedBagPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Agronomic Knowledge Hub
            </span>
            <span className="text-xs text-stone-500">Plateau State Potato Extension Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Post-Harvest Loss Prevention & Storage Advisory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
            Empirical guidelines for Bokkos farmers and buyers to eliminate post-harvest tuber shrinkage, fungal rot, and transit bruising.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('marketplace')}
            leftIcon={<Sprout className="w-4 h-4 text-emerald-700" />}
          >
            Marketplace
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('prices')}
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Price Monitor
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'storage', label: 'Diffused Light Storage (DLS)' },
          { id: 'curing', label: 'Tuber Curing & Skin-Set' },
          { id: 'diseases', label: 'Disease Triage (Late Blight vs Wilt)' },
          { id: 'calendar', label: 'Seasonal Cropping Calendar' },
          { id: 'calculator', label: 'Loss & Revenue Calculator' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sun className="w-4 h-4" />
              Low-Cost Cold Chain Alternative
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Diffused Light Storage (DLS) for Bokkos Farmers
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              Diffused Light Storage (DLS) is a proven, inexpensive storage technology developed by CIP (International Potato Center) that leverages indirect, diffused natural light and continuous natural ventilation. In the temperate highland climate of Bokkos (elevation ~1,350m), DLS suppresses excessive apical dominance sprout growth and prevents greening of seed tubers for up to 6–8 months.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-bold text-stone-900">Indirect Diffused Light</h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Never expose tubers to direct scorching sunlight. Use translucent roofing sheets, wide eaves, or slatted timber walls that diffuse ambient daylight evenly onto shallow tuber trays.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-bold text-stone-900">Cross Ventilation</h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Incorporate wire mesh ventilation vents at the base and ridge of the store. Bokkos’s cool nighttime breeze dissipates respiratory heat and carbon dioxide naturally.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-bold text-stone-900">Shallow Layer Trays</h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Do not pile tubers higher than 2 to 3 layers (maximum 15cm depth) on raised wooden shelves. Overstacking suffocates lower tubers and initiates soft rot.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <span className="font-bold text-emerald-950 block">Plateau Cooperative Construction Cost:</span>
              <p className="text-emerald-800 leading-relaxed">
                A 5-tonne DLS unit can be constructed in Bokkos using local eucalyptus timber poles, wire chicken netting, and thatch/corrugated zinc for approximately ₦180,000 – ₦250,000, paying for itself in a single harvest cycle through zero seed spoilage.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'curing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Thermometer className="w-4 h-4" />
              Suberization & Harvest Hardening
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Tuber Curing Protocol & The "Thumb-Rub" Skin Test
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              Freshly dug potatoes have tender, "feathering" skins that peel easily upon contact. Transporting uncured tubers on long journeys to Abuja or Lagos results in severe surface abrasions, secondary bacterial infection, and shrinkage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Step 1: Dehaulming (Cutting Foliage)</span>
                <p className="text-stone-700 leading-relaxed">
                  Cut or slash potato vines 10 to 14 days prior to harvesting. This signals the tuber underground to cease vegetative growth and initiates natural periderm thickening ("skin set").
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Step 2: The Thumb-Rub Test</span>
                <p className="text-stone-700 leading-relaxed">
                  Before digging the whole field, sample 5 random tubers. Apply firm pressure with your thumb across the potato skin. If the skin slips or tears, the batch is not ready for mechanical handling. Wait 4–5 additional days.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Step 3: Farm Gate Ambient Curing</span>
                <p className="text-stone-700 leading-relaxed">
                  Stack harvested tubers under a shaded, well-ventilated barn at 15–20°C for 7–10 days with 85–90% humidity (achieved by sprinkling water on surrounding earth floors). Wounds suberize and seal shut against fungi.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Step 4: Bagging Standards</span>
                <p className="text-stone-700 leading-relaxed">
                  Always use open-mesh polypropylene or breathable jute bags. Never use sealed polythene bags or overfill sacks, which causes crush injury during truck stacking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'diseases' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Pathogen Triage & Quality Assurance
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Distinguishing Late Blight, Bacterial Wilt & Soft Rot
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              Quality grading on Bokkos AgroLink requires sorting out tubers carrying systemic latent pathogens. Use the diagnostic matrix below during farm gate inspections.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="p-5 rounded-2xl border border-stone-200 space-y-3 bg-stone-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Late Blight</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                    Phytophthora
                  </span>
                </div>
                <div className="space-y-1.5 text-stone-600">
                  <div className="font-semibold text-stone-800">External Signs:</div>
                  <p>Purplish-brown, dry sunken skin lesions on tuber surface.</p>
                  <div className="font-semibold text-stone-800 pt-1">Internal Cross-Section:</div>
                  <p>Granular, reddish-brown dry rot extending inward like fingers into the flesh.</p>
                  <div className="font-semibold text-stone-800 pt-1">Action:</div>
                  <p className="text-rose-700 font-semibold">Immediate rejection. Do not store; pathogen spreads rapidly in humid storage.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 space-y-3 bg-stone-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Bacterial Wilt</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Ralstonia
                  </span>
                </div>
                <div className="space-y-1.5 text-stone-600">
                  <div className="font-semibold text-stone-800">External Signs:</div>
                  <p>Soil adhering to tuber eyes due to bacterial slime discharge.</p>
                  <div className="font-semibold text-stone-800 pt-1">Internal Cross-Section:</div>
                  <p>Brown ring discoloration in the vascular ring; white bacterial ooze appears when gently squeezed.</p>
                  <div className="font-semibold text-stone-800 pt-1">Action:</div>
                  <p className="text-amber-800 font-semibold">Quarantine field. Never use tubers from infected field as seed stock.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 space-y-3 bg-stone-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Bacterial Soft Rot</span>
                  <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 text-[10px] font-bold">
                    Pectobacterium
                  </span>
                </div>
                <div className="space-y-1.5 text-stone-600">
                  <div className="font-semibold text-stone-800">External Signs:</div>
                  <p>Water-soaked lesions that rapidly soften into a foul-smelling slime.</p>
                  <div className="font-semibold text-stone-800 pt-1">Internal Cross-Section:</div>
                  <p>Complete liquefaction of the inner tuber tissue with black border margins.</p>
                  <div className="font-semibold text-stone-800 pt-1">Action:</div>
                  <p className="text-stone-800 font-semibold">Arises from transit crush injury and poor air flow. Discard infected bag contents.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              Agronomic Seasonality
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Bokkos LGA Annual Potato Cropping Calendar
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              Unlike lowland Nigerian agro-ecological zones, Bokkos enjoys high altitude allowing multiple cropping cycles every 12 months.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-stone-900">Cycle 1: Early Rainfed ("Damina Farko")</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">APRIL – JULY</span>
                  </div>
                  <p className="text-stone-600">
                    Planted with the first sustained rains in April. Harvested in July. High market prices due to nationwide lean supply.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 shrink-0">
                  Varieties: Nicola, Caruso
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-stone-900">Cycle 2: Late Rainfed ("Damina Karshe")</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">AUGUST – OCTOBER</span>
                  </div>
                  <p className="text-stone-600">
                    Planted in late July/August. Highest volume harvest in Bokkos. Intense surveillance for Late Blight necessary during peak August rains.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 shrink-0">
                  Varieties: Marabel, Bertita, Lady Rosetta
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-stone-900">Cycle 3: Irrigated Dry Season ("Rani / Fadama")</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">DECEMBER – APRIL</span>
                  </div>
                  <p className="text-stone-600">
                    Cultivated along Butura, Daffo, and Richa stream corridors using furrow and motorized pumps. Superior tuber dry matter and zero late blight.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100 shrink-0">
                  Varieties: Nicola, Caruso, Seed Tuber Multiples
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
          <div className="border-b border-emerald-800/60 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              Economic Impact Simulator
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Post-Harvest Loss & Revenue Recovery Calculator
            </h3>
            <p className="text-xs text-stone-300">
              Calculate the direct revenue recovered by adopting proper curing, breathable bagging, and Diffused Light Storage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                  Total Bags Harvested
                </label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={farmBagsHarvested}
                  onChange={(e) => setFarmBagsHarvested(Number(e.target.value))}
                  className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                  Current Loss Rate (Roadside/Uncured)
                </label>
                <select
                  value={currentLossPercentage}
                  onChange={(e) => setCurrentLossPercentage(Number(e.target.value))}
                  className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value={15}>15% (Mild transit bruising)</option>
                  <option value={25}>25% (Typical Plateau average)</option>
                  <option value={35}>35% (Severe rot during wet season)</option>
                  <option value={40}>40% (Extreme unventilated spoilage)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                  Average Price per Bag (NGN)
                </label>
                <input
                  type="number"
                  value={expectedBagPrice}
                  onChange={(e) => setExpectedBagPrice(Number(e.target.value))}
                  className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4 text-xs">
              <div className="space-y-2 text-stone-200 divide-y divide-white/10">
                <div className="flex justify-between py-1">
                  <span>Current Volume Lost to Spoilage:</span>
                  <span className="font-bold text-rose-300">{estimatedLostBags} bags</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Current Financial Loss:</span>
                  <span className="font-bold text-rose-400">₦{estimatedMonetaryLoss.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Bags Saved with Bokkos AgroLink Best Practices:</span>
                  <span className="font-bold text-emerald-300">{bagsSavedWithBestPractices} bags</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-center">
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  Potential Recovered Revenue
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
                  +₦{financialRevenueSaved.toLocaleString()}
                </div>
                <span className="text-xs text-emerald-200/80">
                  Preserved capital through proper curing & storage
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
