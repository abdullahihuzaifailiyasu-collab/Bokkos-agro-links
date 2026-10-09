import React, { useState } from 'react';
import { HAULAGE_TRANSPORTERS } from '../services/marketData.ts';
import { HaulageTransporter } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Feedback.tsx';
import { 
  Truck, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Calculator, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  Sparkles,
  Clock,
  Send
} from 'lucide-react';

interface LogisticsHubViewProps {
  onNavigate: (view: string) => void;
}

export const LogisticsHubView: React.FC<LogisticsHubViewProps> = ({ onNavigate }) => {
  const [transporters] = useState<HaulageTransporter[]>(HAULAGE_TRANSPORTERS);
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedDriver, setSelectedDriver] = useState<HaulageTransporter | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [pickupWard, setPickupWard] = useState('Butura');
  const [destinationCity, setDestinationCity] = useState<'jos' | 'abuja' | 'kaduna' | 'lagos'>('abuja');
  const [estimatedBags, setEstimatedBags] = useState<number>(100);
  const [pickupDate, setPickupDate] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredTransporters = transporters.filter((t) => {
    if (vehicleFilter !== 'ALL' && t.vehicleType !== vehicleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.driverName.toLowerCase().includes(q) ||
      t.transportCompany.toLowerCase().includes(q) ||
      t.baseLocation.toLowerCase().includes(q) ||
      t.vehicleModel.toLowerCase().includes(q)
    );
  });

  const handleOpenBooking = (driver: HaulageTransporter) => {
    setSelectedDriver(driver);
    setEstimatedBags(Math.min(driver.capacityBags50kg, 100));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    setPickupDate(nextDate.toISOString().split('T')[0]);
    setBookingSuccess(false);
    setBookingModalOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBooking(true);
    setTimeout(() => {
      setSubmittingBooking(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingModalOpen(false);
      }, 2500);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Rural Freight & Haulage
            </span>
            <span className="text-xs text-stone-500">Plateau Agricultural Transit Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Bokkos Haulage & Transporter Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
            Coordinate verified agricultural truck drivers and pickup haulers specializing in potato transport from Bokkos farms to Jos, Abuja, Kaduna, and Lagos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prices')}
            leftIcon={<Calculator className="w-4 h-4 text-emerald-700" />}
          >
            Price Benchmarks
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('marketplace')}
            leftIcon={<ArrowRight className="w-4 h-4" />}
          >
            Back to Marketplace
          </Button>
        </div>
      </div>

      {/* Freight Advisory Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500">Route to Jos Terminus</span>
          <div className="text-2xl font-black text-stone-900">~₦1,400 - ₦1,600</div>
          <span className="text-[11px] text-emerald-700 font-medium">75 km • 2-3 hrs transit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500">Route to Abuja Dei-Dei</span>
          <div className="text-2xl font-black text-stone-900">~₦3,000 - ₦3,500</div>
          <span className="text-[11px] text-emerald-700 font-medium">240 km • 5-6 hrs via Akwanga</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500">Route to Kaduna Central</span>
          <div className="text-2xl font-black text-stone-900">~₦3,500 - ₦4,000</div>
          <span className="text-[11px] text-emerald-700 font-medium">280 km • 6-7 hrs transit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-stone-500">Route to Lagos Mile 12</span>
          <div className="text-2xl font-black text-stone-900">~₦5,800 - ₦6,500</div>
          <span className="text-[11px] text-emerald-700 font-medium">950 km • 24-36 hrs long-haul</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search transporter by driver name, company, base location, or truck type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-stone-400" />}
            />
          </div>

          {/* Vehicle Class Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Fleet' },
              { id: 'PICKUP_1TON', label: '1-Ton Pickup' },
              { id: 'CANTER_3TON', label: '3-Ton Canter' },
              { id: 'TRUCK_7TON', label: '7-Ton Truck' },
              { id: 'HEAVY_15TON', label: '15-Ton Heavy' },
              { id: 'TRAILER_30TON', label: '30-Ton Trailer' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVehicleFilter(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  vehicleFilter === v.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transporters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransporters.map((driver) => (
          <div
            key={driver.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-bold">
                  {driver.vehicleModel}
                </span>
                {driver.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Carrier
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  {driver.driverName}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {driver.transportCompany}
                </p>
                <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Base: {driver.baseLocation}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Max Bag Capacity:</span>
                  <span className="font-bold text-stone-900">{driver.capacityBags50kg} bags (50kg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Vehicle Reg:</span>
                  <span className="font-mono text-stone-700">{driver.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Service Record:</span>
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {driver.rating} • {driver.tripsCompleted} trips
                  </span>
                </div>
              </div>

              {/* Rate Card */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Indicative Freight Rates (Per 50kg Bag)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] text-stone-500 block">To Jos Depot:</span>
                    <span className="font-bold text-emerald-950">₦{driver.ratePerBag.jos.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] text-stone-500 block">To Abuja FCT:</span>
                    <span className="font-bold text-emerald-950">₦{driver.ratePerBag.abuja.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => handleOpenBooking(driver)}
                leftIcon={<Truck className="w-4 h-4" />}
              >
                Book Dispatch
              </Button>
              <a
                href={`tel:${driver.phoneNumber}`}
                className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 transition flex items-center justify-center"
                title={`Call ${driver.driverName}`}
              >
                <Phone className="w-4 h-4 text-emerald-700" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        size="md"
      >
        {bookingSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-stone-900">Haulage Request Sent!</h4>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              Your load dispatch booking has been transmitted to <strong>{selectedDriver?.driverName}</strong>. You will receive an SMS confirmation or phone call shortly.
            </p>
          </div>
        ) : selectedDriver ? (
          <form onSubmit={handleSubmitBooking} className="text-left space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Direct Haulage Booking
              </span>
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                Request Load Dispatch with {selectedDriver.driverName}
              </h3>
              <p className="text-xs text-stone-500">
                {selectedDriver.vehicleModel} ({selectedDriver.capacityBags50kg} bags capacity)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1 uppercase tracking-wider text-[10px]">
                  Pickup Ward in Bokkos
                </label>
                <select
                  value={pickupWard}
                  onChange={(e) => setPickupWard(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-emerald-600"
                >
                  <option value="Butura">Butura Ward</option>
                  <option value="Daffo">Daffo Ward</option>
                  <option value="Manguna">Manguna Ward</option>
                  <option value="Richa">Richa Ward</option>
                  <option value="Bokkos Central">Bokkos Central (Main Market)</option>
                  <option value="Mushere Central">Mushere Central</option>
                  <option value="Toff">Toff Ward</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 uppercase tracking-wider text-[10px]">
                  Destination City
                </label>
                <select
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-emerald-600"
                >
                  <option value="jos">Jos Metropolitan (₦{selectedDriver.ratePerBag.jos}/bag)</option>
                  <option value="abuja">Abuja Dei-Dei / Utako (₦{selectedDriver.ratePerBag.abuja}/bag)</option>
                  <option value="kaduna">Kaduna Central (₦{selectedDriver.ratePerBag.kaduna}/bag)</option>
                  <option value="lagos">Lagos Mile 12 (₦{selectedDriver.ratePerBag.lagos}/bag)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Estimated Bags to Transport"
                  type="number"
                  min={5}
                  max={selectedDriver.capacityBags50kg}
                  value={estimatedBags}
                  onChange={(e) => setEstimatedBags(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Preferred Loading Date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Total Estimated Freight Quote */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-emerald-900 font-semibold block">Estimated Haulage Quote:</span>
                <span className="text-[11px] text-emerald-700">
                  {estimatedBags} bags × ₦{selectedDriver.ratePerBag[destinationCity].toLocaleString()}
                </span>
              </div>
              <div className="text-lg font-black text-emerald-950">
                ₦{(estimatedBags * selectedDriver.ratePerBag[destinationCity]).toLocaleString()}
              </div>
            </div>

            <div>
              <Input
                label="Your Contact Phone Number"
                type="tel"
                placeholder="e.g. 08031234567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide block mb-1">
                Loading Landmark / Special Instructions
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g. Near Butura Gida Primary School, farm is 200m off the tarred road..."
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs outline-none focus:border-emerald-600 text-stone-800"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={submittingBooking}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send Booking Request
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
};
