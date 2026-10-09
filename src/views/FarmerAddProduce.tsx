import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { PotatoVariety, QualityGrade, QuantityUnit, ProduceListing } from '../types/index.ts';
import { Sprout, ArrowLeft, CheckCircle2, Sparkles, MapPin, Info } from 'lucide-react';

interface FarmerAddProduceProps {
  onNavigate: (view: string) => void;
  editingProduce?: ProduceListing | null;
}

export const FarmerAddProduce: React.FC<FarmerAddProduceProps> = ({ onNavigate, editingProduce }) => {
  const { user } = useAuth();

  const [variety, setVariety] = useState<PotatoVariety>(editingProduce?.variety || 'Caruso');
  const [quantityBags, setQuantityBags] = useState<number>(editingProduce?.quantityBags || 40);
  const [pricePerBag, setPricePerBag] = useState<number>(editingProduce?.pricePerBag || 45000);
  const [grade, setGrade] = useState<QualityGrade>(editingProduce?.grade || 'GRADE_A');
  const [bagType, setBagType] = useState<QuantityUnit>(
    (editingProduce?.bagType as QuantityUnit) || '100kg Bag'
  );
  const [harvestDate, setHarvestDate] = useState<string>(
    editingProduce?.harvestDate
      ? editingProduce.harvestDate.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>(
    editingProduce?.description || 'Fresh harvest from Bokkos farm gate, sorted and bagged in clean jute sacks.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const varieties: { name: PotatoVariety; category: string; description: string }[] = [
    { name: 'Caruso', category: 'Commercial / Crisps', description: 'High dry-matter, smooth oval skin, favored by processors' },
    { name: 'Nicola', category: 'Table / Boiling', description: 'Firm yellow flesh, premium salad and boiling potato' },
    { name: 'Marabel', category: 'Table / Mashing', description: 'Very popular in Jos/Plateau, tender golden skin' },
    { name: 'Lady Rosetta', category: 'Chips & Crisps', description: 'Round red-skinned tuber with high dry matter for industrial frying' },
    { name: 'Bertita', category: 'Storage / Dual-Use', description: 'Blight-resistant, long shelf-life in ambient storage' },
    { name: 'Connect', category: 'Late-Blight Hardy', description: 'Robust yield, oval tubers with shallow eyes' },
    { name: 'Markies', category: 'French Fries', description: 'Long oval tubers, low sugar content, golden fry color' },
    { name: 'Other', category: 'Local Cultivar', description: 'Traditional Bokkos local landrace variety' },
  ];

  const selectedVarietyInfo = varieties.find((v) => v.name === variety) || varieties[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      if (editingProduce) {
        await api.updateProduce(editingProduce.id, {
          variety,
          quantityBags: Number(quantityBags),
          pricePerBag: Number(pricePerBag),
          grade,
          bagType,
          harvestDate,
          description,
        });
      } else {
        await api.createProduceListing({
          variety,
          quantityBags: Number(quantityBags),
          pricePerBag: Number(pricePerBag),
          grade,
          bagType,
          harvestDate,
          description,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onNavigate('farmer-dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save potato listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-left space-y-6">
      <button
        onClick={() => onNavigate('farmer-dashboard')}
        className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Farmer Portal
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex p-2.5 rounded-xl bg-emerald-50 text-emerald-800 mb-2">
            <Sprout className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {editingProduce ? 'Edit Potato Batch' : 'List New Potato Harvest'}
          </h1>
          <p className="text-xs text-stone-500">
            Publish your harvested tubers from Bokkos LGA ({user?.farmerProfile?.wardLocation || 'Butura'} Ward) directly to wholesale buyers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Potato harvest saved successfully! Redirecting to your dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
                Potato Variety
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value as PotatoVariety)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 min-h-[44px]"
              >
                {varieties.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
                Quality Grade
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as QualityGrade)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 min-h-[44px]"
              >
                <option value="GRADE_A">Grade A (Premium Large Table)</option>
                <option value="GRADE_B">Grade B (Medium Table)</option>
                <option value="SEED_POTATO">Certified Seed Tuber</option>
                <option value="COMMERCIAL">Commercial / Bulk Processing</option>
              </select>
            </div>
          </div>

          {/* Variety Advisory Callout */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-950">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900">{selectedVarietyInfo.name}</span>: {selectedVarietyInfo.description}.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
                Bag Standard / Packaging
              </label>
              <select
                value={bagType}
                onChange={(e) => setBagType(e.target.value as QuantityUnit)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 min-h-[44px]"
              >
                <option value="100kg Bag">100kg Jute Bag (Standard Bokkos Measure)</option>
                <option value="50kg Bag">50kg Mesh Bag</option>
                <option value="Tonne">1 Metric Ton (Bulk)</option>
                <option value="Pickup Load">Pickup Load (~15-20 Bags)</option>
              </select>
            </div>

            <div>
              <Input
                label="Harvest / Ready Date"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity Available"
              type="number"
              min={1}
              value={quantityBags}
              onChange={(e) => setQuantityBags(Number(e.target.value))}
              required
              helperText={`Total batch size in ${bagType}`}
            />

            <Input
              label={`Farm Gate Price per ${bagType} (₦)`}
              type="number"
              min={1000}
              step={500}
              value={pricePerBag}
              onChange={(e) => setPricePerBag(Number(e.target.value))}
              required
              helperText={`Total Batch Value: ₦${(
                (Number(quantityBags) || 0) * (Number(pricePerBag) || 0)
              ).toLocaleString()}`}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
              Harvest Notes & Quality Highlights
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Freshly harvested from Butura irrigated farmland. Tubers are firm, free from bacterial wilt or hollow hearts. Packed in breathable jute bags ready for loading."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-stone-900"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Collection Point: <strong>{user?.farmerProfile?.wardLocation || 'Butura'} Ward</strong>, Bokkos LGA, Plateau State.
            </span>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onNavigate('farmer-dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
            >
              {editingProduce ? 'Save Changes' : 'Publish Batch to Marketplace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
