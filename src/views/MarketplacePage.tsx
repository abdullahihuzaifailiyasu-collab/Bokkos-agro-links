import React, { useState, useEffect } from 'react';
import { ProduceListing, PotatoVariety, QualityGrade } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { StatusBadge, Badge } from '../components/common/Badge.tsx';
import { Modal, EmptyState } from '../components/common/Feedback.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag,
  SlidersHorizontal,
  X,
  BookOpen,
  Truck,
  ShieldCheck,
  Info
} from 'lucide-react';

interface MarketplacePageProps {
  onNavigate: (view: string) => void;
  selectedListing?: ProduceListing | null;
  initialWard?: string;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate, selectedListing, initialWard }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>(initialWard || '');

  useEffect(() => {
    if (initialWard) {
      setSelectedWard(initialWard);
    }
  }, [initialWard]);

  // Guide Modal
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Active Detail / Request Modal
  const [activeListing, setActiveListing] = useState<ProduceListing | null>(selectedListing || null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState<number>(10);
  const [proposedPickupDate, setProposedPickupDate] = useState<string>('');
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [destinationCity, setDestinationCity] = useState<'JOS' | 'ABUJA' | 'KADUNA' | 'LAGOS' | 'LOCAL'>('JOS');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const bokkosWards = [
    'All Bokkos',
    'Butura',
    'Daffo',
    'Manguna',
    'Richa',
    'Mushere Central',
    'Bokkos Central',
  ];

  const varieties: PotatoVariety[] = [
    'Caruso',
    'Marabel',
    'Nicola',
    'Lady Rosetta',
    'Bertita',
    'Connect',
    'Markies',
    'Other',
  ];

  const grades: QualityGrade[] = [
    'GRADE_A',
    'GRADE_B',
    'SEED_POTATO',
    'COMMERCIAL',
  ];

  const varietyGuideData = [
    {
      name: 'Caruso',
      primaryUse: 'Commercial Crisps & Processing',
      dryMatter: 'High (22-24%)',
      features: 'Round oval shape, shallow eyes, uniform golden fry color with minimal sugar browning.',
      bestFor: 'Snack food companies, processing factories, commercial chip makers.',
    },
    {
      name: 'Nicola',
      primaryUse: 'Table / Boiling & Salad',
      dryMatter: 'Low-Medium (18%)',
      features: 'Waxy firm yellow flesh that holds shape after boiling. Exceptional culinary flavor.',
      bestFor: 'Hotels, restaurants, direct retail consumption, potato salads.',
    },
    {
      name: 'Marabel',
      primaryUse: 'General Table / Mashing & Boiling',
      dryMatter: 'Medium (19-20%)',
      features: 'Smooth attractive golden skin, tender texture, high consumer preference in Jos & Abuja.',
      bestFor: 'Wholesale open market, supermarkets, general household cuisine.',
    },
    {
      name: 'Lady Rosetta',
      primaryUse: 'Industrial Potato Chips',
      dryMatter: 'Very High (23-25%)',
      features: 'Red-skinned round tubers, high specific gravity, crisp texture without oil sogginess.',
      bestFor: 'Frito/crisp manufacturing plants and industrial fryers.',
    },
    {
      name: 'Bertita',
      primaryUse: 'Dual Purpose & Long Storage',
      dryMatter: 'Medium (20%)',
      features: 'High tolerance to late blight, long dormancy period allowing ambient farm storage.',
      bestFor: 'Off-season trading, seed multiplication, distant long-haul transportation.',
    },
    {
      name: 'Markies',
      primaryUse: 'French Fries',
      dryMatter: 'High (21-23%)',
      features: 'Long oval tuber, ideal length for cutting French fry batons.',
      bestFor: 'Fast food outlets, QSR chains, commercial caterers.',
    },
  ];

  const freightAdvisory = {
    LOCAL: { label: 'Local Bokkos / Farm Gate', estimatePerBag: 0, days: 'Same day' },
    JOS: { label: 'Jos Metropolitan Depot (~75 km)', estimatePerBag: 1500, days: '2-3 hours' },
    ABUJA: { label: 'Abuja FCT Wholesale (~240 km)', estimatePerBag: 3500, days: '5-6 hours' },
    KADUNA: { label: 'Kaduna Central (~280 km)', estimatePerBag: 4000, days: '6-7 hours' },
    LAGOS: { label: 'Mile 12 Lagos (~950 km)', estimatePerBag: 6500, days: '24-36 hours' },
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.getProduceListings({
        variety: selectedVariety || undefined,
        grade: selectedGrade || undefined,
        farmerWard: selectedWard && selectedWard !== 'All Bokkos' ? selectedWard : undefined,
        status: 'AVAILABLE',
      });
      if (res.success) {
        setListings(res.produce);
      }
    } catch (err) {
      console.error('Failed to load marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedVariety, selectedGrade, selectedWard]);

  // Client-side search filtering
  const filteredListings = listings.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.variety.toLowerCase().includes(q) ||
      item.farmerWard.toLowerCase().includes(q) ||
      item.farmerName.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  const handleOpenRequest = (item: ProduceListing) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setActiveListing(item);
    setRequestQuantity(Math.min(10, item.quantityBags));
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    setProposedPickupDate(nextWeek.toISOString().split('T')[0]);
    setRequestNotes('');
    setRequestSuccessMessage(null);
    setRequestModalOpen(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;

    try {
      setSubmittingRequest(true);
      const freightNote = `Target Destination: ${freightAdvisory[destinationCity].label}.`;
      const combinedNotes = requestNotes.trim() ? `${requestNotes.trim()} (${freightNote})` : freightNote;

      const res = await api.createProduceRequest({
        produceId: activeListing.id,
        quantityBags: Number(requestQuantity),
        notes: combinedNotes,
        proposedPickupDate: proposedPickupDate,
      });

      if (res.success) {
        setRequestSuccessMessage('Your purchase request has been submitted to the farmer! Check your Buyer Dashboard to track status.');
        setTimeout(() => {
          setRequestModalOpen(false);
          setRequestSuccessMessage(null);
          onNavigate('buyer-dashboard');
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              Farm Gate Exchange
            </span>
            <span className="text-xs text-stone-500">Plateau State Certified Quality</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            Bokkos Potato Marketplace
          </h1>
          <p className="text-sm text-stone-500">
            Direct farmer listings across Bokkos LGA. Verify variety, grade, and pickup logistics with zero intermediary margin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prices')}
            leftIcon={<Info className="w-4 h-4 text-emerald-700" />}
          >
            Price Monitor
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('bokkos-map')}
            leftIcon={<MapPin className="w-4 h-4 text-emerald-700" />}
          >
            Ward Map
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('logistics')}
            leftIcon={<Truck className="w-4 h-4 text-emerald-700" />}
          >
            Haulage
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGuideModalOpen(true)}
            leftIcon={<BookOpen className="w-4 h-4 text-emerald-700" />}
          >
            Variety Guide
          </Button>

          {user?.role === 'FARMER' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('farmer-add-produce')}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Post Harvest
            </Button>
          )}
        </div>
      </div>

      {/* Ward Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Wards:
        </span>
        {bokkosWards.map((w) => {
          const isSelected = (!selectedWard && w === 'All Bokkos') || selectedWard === w;
          return (
            <button
              key={w}
              onClick={() => setSelectedWard(w === 'All Bokkos' ? '' : w)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by variety (Caruso, Marabel, Nicola), ward, or farmer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-stone-400" />}
            />
          </div>

          {(selectedVariety || selectedGrade || selectedWard || search) && (
            <button
              onClick={() => {
                setSelectedVariety('');
                setSelectedGrade('');
                setSelectedWard('');
                setSearch('');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0 px-2 py-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Potato Cultivar / Variety
            </label>
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-600 min-h-[40px]"
            >
              <option value="">All Potato Cultivars</option>
              {varieties.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Quality Grade Classification
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-600 min-h-[40px]"
            >
              <option value="">All Grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-stone-200 animate-pulse space-y-4">
              <div className="h-6 bg-stone-100 rounded w-1/3"></div>
              <div className="h-8 bg-stone-100 rounded w-2/3"></div>
              <div className="h-16 bg-stone-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title="No Potato Listings Match Filters"
          description="Try broadening your variety or ward selection, or clear active search filters to view all available Bokkos harvests."
          actionText="Reset All Filters"
          onAction={() => {
            setSelectedVariety('');
            setSelectedGrade('');
            setSelectedWard('');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={listing.grade} />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {listing.bagType || listing.unit}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                    {listing.variety} Potato
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {listing.farmerWard} Ward, Bokkos LGA
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-stone-500">Farm Gate Price:</span>
                    <span className="text-lg font-black text-emerald-900">
                      ₦{(listing.pricePerBag || listing.pricePerUnit || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-stone-500">Available Stock:</span>
                    <span className="text-sm font-bold text-stone-900">
                      {listing.quantityBags ?? listing.availableQuantity} bags
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {listing.description || 'Harvested under standard Bokkos cool plateau volcanic soil. Sorted and graded at farm gate.'}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Harvest: {new Date(listing.harvestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold text-stone-700">
                    {listing.farmerName}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenRequest(listing)}
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  Order This Batch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variety Guide Modal */}
      <Modal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        size="lg"
      >
        <div className="text-left space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Agronomic Reference</span>
          </div>
          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            Plateau Potato Variety & Processing Guide
          </h3>
          <p className="text-xs text-stone-500">
            Match your industrial or culinary specifications to the distinct potato cultivars grown in Bokkos LGA.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {varietyGuideData.map((vg) => (
              <div key={vg.name} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">{vg.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    DM: {vg.dryMatter}
                  </span>
                </div>
                <div className="text-emerald-900 font-semibold text-[11px]">{vg.primaryUse}</div>
                <p className="text-stone-600 leading-relaxed text-[11px]">{vg.features}</p>
                <div className="pt-1 text-[10px] text-stone-500">
                  <strong className="text-stone-700">Best for:</strong> {vg.bestFor}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setGuideModalOpen(false)}>
              Close Guide
            </Button>
          </div>
        </div>
      </Modal>

      {/* Place Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        size="md"
      >
        {requestSuccessMessage ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Purchase Request Dispatched!</h4>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              {requestSuccessMessage}
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequestModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setRequestModalOpen(false);
                  onNavigate('escrow');
                }}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Lock Escrow via Paystack / NIBSS
              </Button>
            </div>
          </div>
        ) : activeListing ? (
          <form onSubmit={handleSendRequest} className="text-left space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Direct Farm Gate Procurement
              </span>
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                Order {activeListing.variety} Potato Batch
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-900 font-medium">Farmer / Producer:</span>
                <span className="font-bold text-emerald-950">{activeListing.farmerName} ({activeListing.farmerWard} Ward)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-900 font-medium">Farm Gate Unit Price:</span>
                <span className="font-bold text-emerald-950">
                  ₦{(activeListing.pricePerBag || activeListing.pricePerUnit || 0).toLocaleString()} / {activeListing.bagType || activeListing.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-900 font-medium">Stock Available:</span>
                <span className="font-bold text-emerald-950">{activeListing.quantityBags ?? activeListing.availableQuantity} bags max</span>
              </div>
            </div>

            <div>
              <Input
                label="Number of Bags to Order"
                type="number"
                min={1}
                max={activeListing.quantityBags ?? activeListing.availableQuantity}
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(Number(e.target.value))}
                required
                helperText={`Produce Cost: ₦${(
                  (Number(requestQuantity) || 0) * (activeListing.pricePerBag || activeListing.pricePerUnit || 0)
                ).toLocaleString()}`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
                Target Wholesale Destination (Logistics Advisory)
              </label>
              <select
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value as any)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-600 text-stone-900"
              >
                <option value="JOS">Jos Metropolitan Area (~₦1,500/bag freight)</option>
                <option value="ABUJA">Abuja FCT / Dei-Dei Depot (~₦3,500/bag freight)</option>
                <option value="KADUNA">Kaduna Central Wholesale (~₦4,000/bag freight)</option>
                <option value="LAGOS">Lagos Mile 12 / Ketu (~₦6,500/bag freight)</option>
                <option value="LOCAL">Local Bokkos Farm Pickup (Buyer provides transport)</option>
              </select>
            </div>

            <div>
              <Input
                label="Proposed Collection / Inspection Date"
                type="date"
                value={proposedPickupDate}
                onChange={(e) => setProposedPickupDate(e.target.value)}
                required
                helperText="Expected date your vehicle/driver will arrive at the Bokkos farm gate"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide block mb-1">
                Logistics & Quality Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="e.g. Arriving with a 7-ton truck, need assistance with bag loading..."
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs outline-none focus:border-emerald-600 text-stone-800"
              />
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={submittingRequest}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                Submit Purchase Request
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
};
