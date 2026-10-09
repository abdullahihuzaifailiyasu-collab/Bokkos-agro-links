import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Building2, 
  Award,
  Filter,
  DollarSign,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '../components/common/Button.tsx';
import { 
  CooperativePool, 
  PoolContribution, 
  OfftakeAgreement,
  BokkosWard, 
  BOKKOS_WARDS, 
  PotatoVariety 
} from '../types/index.ts';
import { INITIAL_COOPERATIVE_POOLS, INITIAL_OFFTAKE_AGREEMENTS } from '../services/phase5Data.ts';
import { firestoreService } from '../services/firestoreService.ts';

interface CooperativePoolsViewProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const CooperativePoolsView: React.FC<CooperativePoolsViewProps> = ({ onNavigate }) => {
  const [pools, setPools] = useState<CooperativePool[]>(INITIAL_COOPERATIVE_POOLS);
  const [offtakeAgreements] = useState<OfftakeAgreement[]>(INITIAL_OFFTAKE_AGREEMENTS);
  const [activeTab, setActiveTab] = useState<'pools' | 'offtake' | 'my-pledges'>('pools');

  React.useEffect(() => {
    // Sync with Firestore
    firestoreService.getCooperativePools().then((cloudPools) => {
      if (cloudPools && cloudPools.length > 0) {
        setPools(cloudPools);
      }
    }).catch(console.warn);
  }, []);
  
  // Filters
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedVariety, setSelectedVariety] = useState<string>('ALL');

  // Modal states
  const [pledgeModalPool, setPledgeModalPool] = useState<CooperativePool | null>(null);
  const [pledgeBags, setPledgeBags] = useState<number>(30);
  const [pledgeFarmerName, setPledgeFarmerName] = useState<string>('Baba Danladi Mutfwang');
  const [pledgePhone, setPledgePhone] = useState<string>('08023456789');
  const [pledgeWard, setPledgeWard] = useState<BokkosWard>('Butura');
  const [pledgeSuccessMsg, setPledgeSuccessMsg] = useState<string | null>(null);

  // Create Pool Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPoolTitle, setNewPoolTitle] = useState<string>('');
  const [newPoolCoop, setNewPoolCoop] = useState<string>('Daffo Highland Farmers Cooperative Society');
  const [newPoolWard, setNewPoolWard] = useState<BokkosWard>('Daffo');
  const [newPoolVariety, setNewPoolVariety] = useState<PotatoVariety>('Nicola');
  const [newPoolTargetBags, setNewPoolTargetBags] = useState<number>(500);
  const [newPoolPrice, setNewPoolPrice] = useState<number>(36000);
  const [newPoolDepot, setNewPoolDepot] = useState<string>('Bokkos Central Agro-Depot');
  const [newPoolDeadline, setNewPoolDeadline] = useState<string>('2026-09-30');

  // Offtake Contract Modal
  const [selectedOfftake, setSelectedOfftake] = useState<OfftakeAgreement | null>(null);
  const [offtakePledgePool, setOfftakePledgePool] = useState<string>(pools[0]?.id || '');
  const [offtakeSuccessMsg, setOfftakeSuccessMsg] = useState<string | null>(null);

  // Filter pools
  const filteredPools = pools.filter((p) => {
    if (selectedWard !== 'ALL' && p.ward !== selectedWard) return false;
    if (selectedVariety !== 'ALL' && p.variety !== selectedVariety) return false;
    return true;
  });

  // Calculate high-level stats
  const totalTargetBags = pools.reduce((acc, curr) => acc + curr.targetBags, 0);
  const totalPledgedBags = pools.reduce((acc, curr) => acc + curr.pledgedBags, 0);
  const totalValueLocked = pools.reduce((acc, curr) => acc + (curr.pledgedBags * curr.targetPricePerBag), 0);
  const totalFarmersParticipating = pools.reduce((acc, curr) => acc + curr.contributions.length, 0);

  // Handle bag pledge
  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeModalPool) return;

    const newContribution: PoolContribution = {
      id: `cnt_${Date.now()}`,
      farmerId: 'usr_farmer_current',
      farmerName: pledgeFarmerName,
      farmerPhone: pledgePhone,
      farmerWard: pledgeWard,
      bagsContributed: Number(pledgeBags),
      pledgedAt: new Date().toISOString().split('T')[0],
      inspectionStatus: 'PASSED',
      payoutAmount: Number(pledgeBags) * pledgeModalPool.targetPricePerBag,
      payoutStatus: 'PENDING',
    };

    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id === pledgeModalPool.id) {
          const updatedPledged = pool.pledgedBags + Number(pledgeBags);
          const updatedPool: CooperativePool = {
            ...pool,
            pledgedBags: updatedPledged,
            status: updatedPledged >= pool.targetBags ? 'INSPECTION' : pool.status,
            contributions: [newContribution, ...pool.contributions],
          };
          firestoreService.updateCooperativePool(updatedPool).catch(console.warn);
          return updatedPool;
        }
        return pool;
      })
    );

    setPledgeSuccessMsg(
      `Successfully pledged ${pledgeBags} bags of ${pledgeModalPool.variety} to ${pledgeModalPool.poolTitle}! Estimated payout: ₦${(
        Number(pledgeBags) * pledgeModalPool.targetPricePerBag
      ).toLocaleString()}`
    );

    setTimeout(() => {
      setPledgeModalPool(null);
      setPledgeSuccessMsg(null);
    }, 2200);
  };

  // Handle create new pool
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolTitle) return;

    const newPool: CooperativePool = {
      id: `pool_${Date.now()}`,
      poolCode: `BKK-POOL-2026-${Math.floor(10 + Math.random() * 90)}`,
      poolTitle: newPoolTitle,
      leadCooperative: newPoolCoop,
      ward: newPoolWard,
      variety: newPoolVariety,
      grade: 'GRADE_A',
      targetBags: Number(newPoolTargetBags),
      pledgedBags: 0,
      minContributionBags: 15,
      targetPricePerBag: Number(newPoolPrice),
      collectionDepot: newPoolDepot,
      deadlineDate: newPoolDeadline,
      status: 'OPEN',
      description: `Cooperative bulk aggregation for ${newPoolVariety} tubers at ${newPoolDepot}.`,
      contributions: [],
    };

    setPools([newPool, ...pools]);
    setShowCreateModal(false);
    setNewPoolTitle('');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden text-left">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/80 text-emerald-200 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Phase 5: Cooperative Aggregation & Bulk Offtake Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Bokkos Harvest Pooling & Bulk Lots
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Smallholders unite to fulfill multi-tonne commercial contracts. Pool small farm harvests into certified 30-tonne trailer lots for direct sale to processors and terminal markets with escrow protection.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold"
              >
                Create Aggregation Pool
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('quality-passport')}
                leftIcon={<Award className="w-4 h-4 text-emerald-300" />}
                className="border-emerald-700 text-white hover:bg-emerald-800"
              >
                Digital Quality Passports
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('escrow-vault')}
                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
                className="border-emerald-700 text-white hover:bg-emerald-800"
              >
                Escrow Settlement Vault
              </Button>
            </div>
          </div>
          
          {/* Subtle decorative background watermark */}
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
            <Package className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Aggregation Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Total Pledged Bags</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {totalPledgedBags.toLocaleString()} <span className="text-xs font-normal text-stone-500">/ {totalTargetBags.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((totalPledgedBags / totalTargetBags) * 100))}%` }}
              />
            </div>
            <p className="text-2xs text-stone-400 mt-1">
              {Math.round((totalPledgedBags / totalTargetBags) * 100)}% overall aggregation target
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Pooled Value in Escrow</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  ₦{(totalValueLocked / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
            <p className="text-2xs text-stone-400 mt-3">Protected by Bokkos AgroLink Vault</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Contributing Farmers</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {totalFarmersParticipating} Farmers
                </p>
              </div>
            </div>
            <p className="text-2xs text-stone-400 mt-3">Across 6 Bokkos Wards</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Corporate Forward Offtakes</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {offtakeAgreements.length} Contracts
                </p>
              </div>
            </div>
            <p className="text-2xs text-stone-400 mt-3">Grand Cereals, Tomato Jos & Eko</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 gap-6">
          <button
            onClick={() => setActiveTab('pools')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'pools'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Active Aggregation Pools ({pools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offtake')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'offtake'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Institutional Offtake Contracts ({offtakeAgreements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-pledges')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'my-pledges'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>My Pledged Harvests</span>
          </button>
        </div>

        {/* Tab 1: Aggregation Pools List */}
        {activeTab === 'pools' && (
          <div className="space-y-6 text-left">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter by:
                </span>
                
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                >
                  <option value="ALL">All Wards</option>
                  {BOKKOS_WARDS.map((w) => (
                    <option key={w} value={w}>{w} Ward</option>
                  ))}
                </select>

                <select
                  value={selectedVariety}
                  onChange={(e) => setSelectedVariety(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                >
                  <option value="ALL">All Varieties</option>
                  <option value="Nicola">Nicola (Table/Export)</option>
                  <option value="Caruso">Caruso (Industrial Crisping)</option>
                  <option value="Marabel">Marabel (Fast Harvest)</option>
                  <option value="Lady Rosetta">Lady Rosetta</option>
                  <option value="Bertita">Bertita</option>
                </select>
              </div>

              <div className="text-xs text-stone-500 font-medium">
                Showing {filteredPools.length} cooperative pools
              </div>
            </div>

            {/* Pools Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPools.map((pool) => {
                const percent = Math.min(100, Math.round((pool.pledgedBags / pool.targetBags) * 100));
                const isFullySubscribed = pool.pledgedBags >= pool.targetBags;

                return (
                  <div 
                    key={pool.id}
                    className="bg-white rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition p-6 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xs font-mono font-bold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                            {pool.poolCode}
                          </span>
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200/60">
                            {pool.variety} • {pool.grade.replace('_', ' ')}
                          </span>
                        </div>

                        <span className={`text-2xs font-bold px-2.5 py-1 rounded-full ${
                          pool.status === 'OPEN'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : pool.status === 'INSPECTION'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {pool.status === 'OPEN' ? '🟢 Open for Pledges' : pool.status === 'INSPECTION' ? '🔍 Inspection Phase' : '🔒 Contract Locked'}
                        </span>
                      </div>

                      {/* Pool Title & Lead */}
                      <div>
                        <h3 className="text-lg font-black text-stone-900">{pool.poolTitle}</h3>
                        <p className="text-xs font-medium text-stone-500 flex items-center gap-1.5 mt-1">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>Lead: {pool.leadCooperative}</span>
                        </p>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {pool.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-700">
                            Volume: {pool.pledgedBags} / {pool.targetBags} Bags
                          </span>
                          <span className="font-black text-emerald-800">{percent}% Complete</span>
                        </div>
                        <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFullySubscribed ? 'bg-emerald-600' : 'bg-emerald-700'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-2xs text-stone-500 pt-1">
                          <span>Min pledge: {pool.minContributionBags} bags</span>
                          <span>Remaining: {Math.max(0, pool.targetBags - pool.pledgedBags)} bags</span>
                        </div>
                      </div>

                      {/* Key Specifics */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                          <span className="text-stone-500 text-2xs block">Guaranteed Target Price</span>
                          <span className="font-black text-emerald-900 text-sm">
                            ₦{pool.targetPricePerBag.toLocaleString()} <span className="text-2xs font-normal">/ 50kg bag</span>
                          </span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                          <span className="text-stone-500 text-2xs block">Total Pool Value</span>
                          <span className="font-black text-stone-900 text-sm">
                            ₦{((pool.targetBags * pool.targetPricePerBag) / 1000000).toFixed(2)} Million
                          </span>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span><strong>Depot:</strong> {pool.collectionDepot}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span><strong>Aggregation Deadline:</strong> {pool.deadlineDate}</span>
                        </div>
                      </div>

                      {/* Locked Offtake Badge if present */}
                      {pool.offtakeContract && (
                        <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-2xs font-bold text-sky-800 uppercase block">Committed Offtake Buyer</span>
                            <span className="font-bold text-sky-950">{pool.offtakeContract.buyerName}</span>
                            <span className="text-2xs text-sky-700 block">{pool.offtakeContract.buyerCity}</span>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-200/70 text-sky-900 text-2xs font-bold">
                              <ShieldCheck className="w-3 h-3" /> Escrow Backed
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div className="text-2xs text-stone-500">
                        <strong>{pool.contributions.length}</strong> farmers contributing
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPledgeModalPool(pool);
                            setPledgeBags(pool.minContributionBags);
                          }}
                          disabled={pool.status !== 'OPEN'}
                          className="text-xs"
                        >
                          {pool.status === 'OPEN' ? 'Pledge Bags' : 'Pool Filled'}
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onNavigate('escrow-vault')}
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Escrow Vault
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Institutional Forward Offtake Agreements */}
        {activeTab === 'offtake' && (
          <div className="space-y-6 text-left">
            <div className="bg-sky-900 text-white rounded-3xl p-6 sm:p-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-800 text-sky-200 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Pre-Harvest Forward Supply Contracts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Institutional Offtake Agreements
              </h2>
              <p className="text-sky-200 text-xs sm:text-sm max-w-2xl">
                Commercial food processing giants and supermarket groups guarantee floor prices and bulk purchase for Bokkos cooperatives, insulating smallholders from harvest price collapse.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offtakeAgreements.map((agreement) => (
                <div 
                  key={agreement.id}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-mono font-bold bg-sky-50 text-sky-800 px-2.5 py-1 rounded-md border border-sky-100">
                        {agreement.agreementCode}
                      </span>
                      <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {agreement.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-stone-900">{agreement.institutionalBuyer}</h3>
                      <p className="text-xs text-stone-500 font-medium">{agreement.buyerType} • {agreement.buyerCity}</p>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {agreement.termsSummary}
                    </p>

                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Variety Required:</span>
                        <span className="font-bold text-stone-900">{agreement.varietyRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Target Volume:</span>
                        <span className="font-bold text-stone-900">{agreement.totalTargetBags.toLocaleString()} Bags</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Guaranteed Floor Price:</span>
                        <span className="font-bold text-emerald-800">₦{agreement.floorPricePerBag.toLocaleString()} / bag</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Contract Window:</span>
                        <span className="font-semibold text-stone-700">{agreement.contractWindow}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Seed/Input Subsidy:</span>
                        <span className="font-bold text-purple-700">+{agreement.advanceInputSubsidyPercent}% Advance</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      fullWidth
                      size="sm"
                      onClick={() => {
                        setSelectedOfftake(agreement);
                      }}
                      leftIcon={<FileCheck2 className="w-4 h-4" />}
                      className="text-xs"
                    >
                      Allocate Cooperative Lot
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: My Pledged Harvests */}
        {activeTab === 'my-pledges' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 text-left">
            <div>
              <h2 className="text-xl font-black text-stone-900">Farmer Harvest Commitments</h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Live list of bags pledged into Bokkos aggregation pools and their escrow release statuses.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase text-2xs font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Pool & Variety</th>
                    <th className="py-3 px-4">Farmer</th>
                    <th className="py-3 px-4">Ward</th>
                    <th className="py-3 px-4 text-center">Bags Pledged</th>
                    <th className="py-3 px-4">Est. Payout (₦)</th>
                    <th className="py-3 px-4">Lab Inspection</th>
                    <th className="py-3 px-4">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {pools.flatMap((pool) =>
                    pool.contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-900 block">{pool.poolTitle}</span>
                          <span className="text-2xs text-stone-500">{pool.variety} • ₦{pool.targetPricePerBag.toLocaleString()}/bag</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-800">{c.farmerName}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-semibold text-2xs">
                            {c.farmerWard}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-stone-900">
                          {c.bagsContributed} Bags
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-800">
                          ₦{(c.bagsContributed * pool.targetPricePerBag).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> PADP Passed
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-2xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                            Escrow Pending Delivery
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* PLEDGE BAGS MODAL */}
      {pledgeModalPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl text-left">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">Pledge Farm Harvest</span>
              <h3 className="text-xl font-black text-stone-900 mt-0.5">
                {pledgeModalPool.poolTitle}
              </h3>
              <p className="text-xs text-stone-500">
                Guaranteed Price: <strong>₦{pledgeModalPool.targetPricePerBag.toLocaleString()} / 50kg bag</strong>
              </p>
            </div>

            {pledgeSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{pledgeSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Farmer Full Name</label>
                  <input
                    type="text"
                    required
                    value={pledgeFarmerName}
                    onChange={(e) => setPledgeFarmerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={pledgePhone}
                      onChange={(e) => setPledgePhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Farm Ward</label>
                    <select
                      value={pledgeWard}
                      onChange={(e) => setPledgeWard(e.target.value as BokkosWard)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                    >
                      {BOKKOS_WARDS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-stone-700">Bags to Pledge (50kg)</label>
                    <span className="text-2xs text-stone-500">Min: {pledgeModalPool.minContributionBags} bags</span>
                  </div>
                  <input
                    type="number"
                    min={pledgeModalPool.minContributionBags}
                    max={pledgeModalPool.targetBags - pledgeModalPool.pledgedBags}
                    required
                    value={pledgeBags}
                    onChange={(e) => setPledgeBags(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-base text-stone-900"
                  />
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Rate per bag:</span>
                    <span className="font-bold">₦{pledgeModalPool.targetPricePerBag.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Estimated Payout:</span>
                    <span className="font-black text-emerald-800 text-sm">
                      ₦{(Number(pledgeBags) * pledgeModalPool.targetPricePerBag).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xs text-stone-400 pt-1">
                    <span>Depot Location:</span>
                    <span>{pledgeModalPool.collectionDepot}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPledgeModalPool(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold"
                  >
                    Confirm Harvest Pledge
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE POOL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl text-left">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">Cooperative Leadership</span>
              <h3 className="text-xl font-black text-stone-900 mt-0.5">
                Launch Harvest Aggregation Pool
              </h3>
              <p className="text-xs text-stone-500">
                Organize a collective multi-tonne shipment for Bokkos smallholders.
              </p>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Pool Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sha & Kunet Caruso Processing Lot"
                  value={newPoolTitle}
                  onChange={(e) => setNewPoolTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Lead Cooperative</label>
                  <input
                    type="text"
                    required
                    value={newPoolCoop}
                    onChange={(e) => setNewPoolCoop(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Primary Ward</label>
                  <select
                    value={newPoolWard}
                    onChange={(e) => setNewPoolWard(e.target.value as BokkosWard)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  >
                    {BOKKOS_WARDS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Variety</label>
                  <select
                    value={newPoolVariety}
                    onChange={(e) => setNewPoolVariety(e.target.value as PotatoVariety)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  >
                    <option value="Nicola">Nicola</option>
                    <option value="Caruso">Caruso</option>
                    <option value="Marabel">Marabel</option>
                    <option value="Lady Rosetta">Lady Rosetta</option>
                    <option value="Bertita">Bertita</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Bags</label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={newPoolTargetBags}
                    onChange={(e) => setNewPoolTargetBags(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target ₦ / Bag</label>
                  <input
                    type="number"
                    min={20000}
                    required
                    value={newPoolPrice}
                    onChange={(e) => setNewPoolPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Collection Depot</label>
                  <input
                    type="text"
                    required
                    value={newPoolDepot}
                    onChange={(e) => setNewPoolDepot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={newPoolDeadline}
                    onChange={(e) => setNewPoolDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 font-bold"
                >
                  Launch Pool
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFTAKE ALLOCATION MODAL */}
      {selectedOfftake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl text-left">
            <div>
              <span className="text-xs font-bold text-sky-800 uppercase">Institutional Offtake</span>
              <h3 className="text-xl font-black text-stone-900 mt-0.5">
                Contract with {selectedOfftake.institutionalBuyer}
              </h3>
              <p className="text-xs text-stone-500">
                Floor Price: <strong>₦{selectedOfftake.floorPricePerBag.toLocaleString()} / bag</strong> • Variety: <strong>{selectedOfftake.varietyRequired}</strong>
              </p>
            </div>

            {offtakeSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{offtakeSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Select Cooperative Pool to Link</label>
                  <select
                    value={offtakePledgePool}
                    onChange={(e) => setOfftakePledgePool(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  >
                    {pools.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.poolTitle} ({p.variety} - {p.pledgedBags} bags pledged)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-1.5">
                  <span className="text-2xs font-bold text-sky-800 uppercase block">Contract Benefits</span>
                  <p className="text-xs text-sky-950">
                    • 100% Escrow deposit locked upfront prior to warehouse loading.
                  </p>
                  <p className="text-xs text-sky-950">
                    • {selectedOfftake.advanceInputSubsidyPercent}% advance input credit for fertilizers & certified seed.
                  </p>
                  <p className="text-xs text-sky-950">
                    • Guaranteed collection at Bokkos depot with certified weighing bridge.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedOfftake(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setOfftakeSuccessMsg(`Successfully bound pool to ${selectedOfftake.institutionalBuyer} offtake agreement! Escrow initialization request sent to buyer portal.`);
                      setTimeout(() => {
                        setSelectedOfftake(null);
                        setOfftakeSuccessMsg(null);
                      }, 2500);
                    }}
                    className="flex-1 font-bold"
                  >
                    Sign & Bind Offtake
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
