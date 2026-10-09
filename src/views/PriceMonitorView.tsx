import React, { useState } from 'react';
import { MARKET_PRICE_BENCHMARKS, WEEKLY_PRICE_TRENDS } from '../services/marketData.ts';
import { MarketPriceBenchmark } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  Calculator, 
  MapPin, 
  Sparkles, 
  Info, 
  DollarSign, 
  Truck, 
  BarChart3, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface PriceMonitorViewProps {
  onNavigate: (view: string) => void;
}

export const PriceMonitorView: React.FC<PriceMonitorViewProps> = ({ onNavigate }) => {
  const [benchmarks, setBenchmarks] = useState<MarketPriceBenchmark[]>(MARKET_PRICE_BENCHMARKS);
  const [selectedTerminal, setSelectedTerminal] = useState<'josTerminus' | 'abujaDeiDei' | 'lagosMile12' | 'kadunaCentral' | 'kanoDawanau'>('abujaDeiDei');
  
  // Arbitrage / Profit Margin Calculator State
  const [calcVariety, setCalcVariety] = useState<string>('Nicola');
  const [calcQuantity, setCalcQuantity] = useState<number>(100);
  const [calcDestination, setCalcDestination] = useState<'JOS' | 'ABUJA' | 'KADUNA' | 'LAGOS' | 'KANO'>('ABUJA');
  const [calcFreightPerBag, setCalcFreightPerBag] = useState<number>(3500);
  const [calcHandlingPerBag, setCalcHandlingPerBag] = useState<number>(500);

  const terminalLabels = {
    josTerminus: 'Jos Terminus / Farin Gada',
    abujaDeiDei: 'Abuja Dei-Dei / Utako FCT',
    lagosMile12: 'Lagos Mile 12 / Ketu',
    kadunaCentral: 'Kaduna Central Wholesale',
    kanoDawanau: 'Kano Dawanau International',
  };

  const selectedBenchmark = benchmarks.find((b) => b.variety === calcVariety) || benchmarks[0];
  const farmGatePrice = selectedBenchmark.farmGateBokkos;

  const terminalPriceMap = {
    JOS: selectedBenchmark.josTerminus,
    ABUJA: selectedBenchmark.abujaDeiDei,
    KADUNA: selectedBenchmark.kadunaCentral,
    LAGOS: selectedBenchmark.lagosMile12,
    KANO: selectedBenchmark.kanoDawanau,
  };

  const expectedWholesalePrice = terminalPriceMap[calcDestination];
  const totalProduceCost = farmGatePrice * calcQuantity;
  const totalLogisticsCost = (calcFreightPerBag + calcHandlingPerBag) * calcQuantity;
  const totalLandedCost = totalProduceCost + totalLogisticsCost;
  const totalGrossRevenue = expectedWholesalePrice * calcQuantity;
  const netEstimatedMargin = totalGrossRevenue - totalLandedCost;
  const marginPercentage = ((netEstimatedMargin / totalLandedCost) * 100).toFixed(1);

  // Maximum value for SVG chart scaling
  const maxTrendPrice = 60000;
  const minTrendPrice = 25000;
  const chartHeight = 160;
  const chartWidth = 500;

  const getY = (val: number) => {
    return chartHeight - ((val - minTrendPrice) / (maxTrendPrice - minTrendPrice)) * (chartHeight - 30) - 15;
  };

  const bokkosPoints = WEEKLY_PRICE_TRENDS.map((t, idx) => {
    const x = 40 + idx * 85;
    const y = getY(t.bokkosFarmGate);
    return `${x},${y}`;
  }).join(' ');

  const abujaPoints = WEEKLY_PRICE_TRENDS.map((t, idx) => {
    const x = 40 + idx * 85;
    const y = getY(t.abujaWholesale);
    return `${x},${y}`;
  }).join(' ');

  const lagosPoints = WEEKLY_PRICE_TRENDS.map((t, idx) => {
    const x = 40 + idx * 85;
    const y = getY(t.lagosWholesale);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              Market Intelligence
            </span>
            <span className="text-xs text-stone-500">Bokkos Farm Gate vs. National Terminal Hubs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Potato Benchmark Index & Price Monitor
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
            Real-time farm-gate price discovery across Bokkos LGA wards alongside terminal market prices in Jos, Abuja, Lagos, Kaduna, and Kano.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('marketplace')}
            leftIcon={<ShoppingBag className="w-4 h-4 text-emerald-700" />}
          >
            Browse Available Stock
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('logistics')}
            leftIcon={<Truck className="w-4 h-4" />}
          >
            Logistics & Freight
          </Button>
        </div>
      </div>

      {/* Terminal Comparison Selector */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">Current Potato Price Benchmarks by Cultivar</h2>
            <p className="text-xs text-stone-500">Standard 50kg Aerated Bag standard at Bokkos farm gate compared to destination wholesale markets</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wide shrink-0">
              Terminal City:
            </label>
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value as any)}
              className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-600 text-stone-800"
            >
              <option value="abujaDeiDei">Abuja (Dei-Dei / Utako)</option>
              <option value="josTerminus">Jos (Terminus / Farin Gada)</option>
              <option value="lagosMile12">Lagos (Mile 12 / Ketu)</option>
              <option value="kadunaCentral">Kaduna Central Wholesale</option>
              <option value="kanoDawanau">Kano (Dawanau Grains)</option>
            </select>
          </div>
        </div>

        {/* Benchmarks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Potato Variety & Grade</th>
                <th className="py-3 px-4">Bokkos Farm Gate</th>
                <th className="py-3 px-4">{terminalLabels[selectedTerminal]}</th>
                <th className="py-3 px-4">Spread / Price Gap</th>
                <th className="py-3 px-4">Market Trend</th>
                <th className="py-3 px-4">Demand Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {benchmarks.map((item) => {
                const terminalPrice = item[selectedTerminal];
                const spread = terminalPrice - item.farmGateBokkos;
                const spreadPercent = ((spread / item.farmGateBokkos) * 100).toFixed(0);

                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      <div>{item.variety}</div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        {item.grade.replace('_', ' ')} • {item.unit}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-emerald-900">
                        ₦{item.farmGateBokkos.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ₦{terminalPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        +₦{spread.toLocaleString()} <span className="text-[10px] text-emerald-600">({spreadPercent}%)</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.trend === 'UP'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.trend === 'DOWN'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.trend === 'UP' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : item.trend === 'DOWN' ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={item.demandIntensity === 'HIGH' ? 'green' : 'amber'}
                        size="sm"
                      >
                        {item.demandIntensity} DEMAND
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setCalcVariety(item.variety);
                          window.scrollTo({ top: 700, behavior: 'smooth' });
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                      >
                        Calculate Margin
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Prices reflect verified transactions at Bokkos farm gate and weekly terminal wholesale market surveys.</span>
          </div>
          <span>Updated twice weekly in collaboration with Bokkos Potato Marketers Syndicate.</span>
        </div>
      </div>

      {/* Historical Trend Chart & Seasonality Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Price Movement Graph */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Weekly Price Trajectory (Jan - Feb 2025)</h3>
              <p className="text-xs text-stone-500">Tracking Nicola 50kg bag prices from Bokkos harvest through transit</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Bokkos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Abuja
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Lagos
              </span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 sm:h-56">
              {/* Grid horizontal lines */}
              {[30000, 40000, 50000, 60000].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line x1="30" y1={y} x2={chartWidth - 10} y2={y} stroke="#e7e5e4" strokeDasharray="3 3" />
                    <text x="5" y={y + 3} fontSize="9" fill="#a8a29e" textAnchor="start">
                      ₦{val / 1000}k
                    </text>
                  </g>
                );
              })}

              {/* Lagos Line */}
              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                points={lagosPoints}
              />

              {/* Abuja Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points={abujaPoints}
              />

              {/* Bokkos Line */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                points={bokkosPoints}
              />

              {/* Data points for Bokkos */}
              {WEEKLY_PRICE_TRENDS.map((t, idx) => {
                const x = 40 + idx * 85;
                const y = getY(t.bokkosFarmGate);
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x} y={chartHeight - 2} fontSize="9" fill="#78716c" textAnchor="middle">
                      {t.week}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 space-y-1">
            <div className="font-bold text-stone-800">Key Economic Takeaway:</div>
            <p className="leading-relaxed">
              Wholesale terminal markets maintain a ₦12,000 – ₦22,000 premium over Bokkos farm-gate prices.
              Buyers procuring directly through Bokkos AgroLink capture significant margin arbitrage by coordinating freight directly.
            </p>
          </div>
        </div>

        {/* Seasonality & Plateau Harvest Calendar */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Bokkos Harvest Seasonality & Price Cycles</h3>
            <p className="text-xs text-stone-500">Plan procurement timing to avoid seasonal price spikes</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>1. Dry Season Fadama Harvest ("Rani")</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">JAN – APRIL</span>
              </div>
              <p className="text-emerald-800 text-[11px] mt-1 leading-relaxed">
                Irrigated riverbeds in Butura, Daffo, and Richa. Tubers have low moisture, crisp skins, and high dry matter. Lowest disease incidence; ideal for chips processing.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60">
              <div className="flex items-center justify-between font-bold text-blue-950">
                <span>2. Main Wet Season Harvest ("Damina")</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-200 text-blue-900">JULY – OCTOBER</span>
              </div>
              <p className="text-blue-800 text-[11px] mt-1 leading-relaxed">
                Peak volume season across all Bokkos wards. Ample market supply results in competitive pricing. Tubers require adequate curing before long-haul transit to avoid rotting.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>3. Off-Season Storage Window</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900">MAY – JUNE / NOV</span>
              </div>
              <p className="text-amber-800 text-[11px] mt-1 leading-relaxed">
                Supply tightens; stored tubers command 20-30% price premiums. Seed potato multiplication active in Daffo and Toff highlands.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wholesale Margin & Arbitrage Calculator */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-700 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              Commercial Decision Support
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Direct Procurement Margin & Arbitrage Calculator
            </h3>
            <p className="text-xs text-stone-300">
              Model your gross revenue, freight expense, handling charges, and expected margin when shipping Bokkos potatoes to terminal markets.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Inputs */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                Select Potato Cultivar
              </label>
              <select
                value={calcVariety}
                onChange={(e) => setCalcVariety(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                {benchmarks.map((b) => (
                  <option key={b.variety} value={b.variety}>
                    {b.variety} (Farm Gate: ₦{b.farmGateBokkos.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                Order Volume (50kg Bags)
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(Number(e.target.value))}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                Destination Wholesale Market
              </label>
              <select
                value={calcDestination}
                onChange={(e) => {
                  const dest = e.target.value as any;
                  setCalcDestination(dest);
                  if (dest === 'JOS') setCalcFreightPerBag(1500);
                  else if (dest === 'ABUJA') setCalcFreightPerBag(3500);
                  else if (dest === 'KADUNA') setCalcFreightPerBag(4000);
                  else if (dest === 'LAGOS') setCalcFreightPerBag(6500);
                  else if (dest === 'KANO') setCalcFreightPerBag(4500);
                }}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="ABUJA">Abuja Dei-Dei / Utako (Wholesale: ₦{terminalPriceMap.ABUJA.toLocaleString()})</option>
                <option value="JOS">Jos Metropolitan Depot (Wholesale: ₦{terminalPriceMap.JOS.toLocaleString()})</option>
                <option value="KADUNA">Kaduna Central Wholesale (Wholesale: ₦{terminalPriceMap.KADUNA.toLocaleString()})</option>
                <option value="LAGOS">Lagos Mile 12 / Ketu (Wholesale: ₦{terminalPriceMap.LAGOS.toLocaleString()})</option>
                <option value="KANO">Kano Dawanau Market (Wholesale: ₦{terminalPriceMap.KANO.toLocaleString()})</option>
              </select>
            </div>

            <div>
              <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                Haulage Freight / Bag (NGN)
              </label>
              <input
                type="number"
                value={calcFreightPerBag}
                onChange={(e) => setCalcFreightPerBag(Number(e.target.value))}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-stone-300 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">
                Handling & Loading Fee / Bag (NGN)
              </label>
              <input
                type="number"
                value={calcHandlingPerBag}
                onChange={(e) => setCalcHandlingPerBag(Number(e.target.value))}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Output Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4 text-xs">
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Projected Commercial Breakdown
            </div>

            <div className="space-y-2 divide-y divide-white/10 text-stone-200">
              <div className="flex justify-between py-1">
                <span>Produce Purchase (Farm Gate):</span>
                <span className="font-bold text-white">₦{totalProduceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Haulage & Handling:</span>
                <span className="font-bold text-white">₦{totalLogisticsCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Landed Cost:</span>
                <span className="font-bold text-stone-300">₦{totalLandedCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Estimated Gross Resale:</span>
                <span className="font-bold text-white">₦{totalGrossRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-center">
              <span className="text-[11px] text-emerald-300 font-semibold block">
                Estimated Net Margin Arbitrage
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
                ₦{netEstimatedMargin.toLocaleString()}
              </div>
              <span className="text-xs text-emerald-200/80">
                +{marginPercentage}% return on invested capital
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold"
              onClick={() => onNavigate('marketplace')}
            >
              Procure {calcQuantity} Bags on Marketplace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
