import React, { useState } from 'react';
import { BOKKOS_WARDS_DATA } from '../services/marketData.ts';
import { WardProfile, BokkosWard } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { 
  MapPin, 
  Layers, 
  Mountain, 
  Sprout, 
  Truck, 
  Calendar, 
  Info, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface BokkosMapViewProps {
  onNavigate: (view: string, filterWard?: string) => void;
}

export const BokkosMapView: React.FC<BokkosMapViewProps> = ({ onNavigate }) => {
  const [selectedWardName, setSelectedWardName] = useState<BokkosWard>('Butura');

  const selectedWard = BOKKOS_WARDS_DATA.find((w) => w.ward === selectedWardName) || BOKKOS_WARDS_DATA[0];

  // Coordinates and positions for stylized interactive SVG polygon map of Bokkos LGA
  // Bokkos has 11 wards arranged in a plateau basin surrounded by hills
  const wardShapes: { 
    ward: BokkosWard; 
    d: string; 
    cx: number; 
    cy: number; 
    color: string; 
    shortLabel: string;
  }[] = [
    {
      ward: 'Butura',
      d: 'M 210,110 L 290,100 L 330,160 L 280,210 L 200,180 Z',
      cx: 260,
      cy: 150,
      color: '#059669', // Emerald
      shortLabel: 'Butura',
    },
    {
      ward: 'Bokkos Central',
      d: 'M 280,210 L 330,160 L 380,200 L 360,260 L 290,270 Z',
      cx: 330,
      cy: 220,
      color: '#0d9488', // Teal
      shortLabel: 'Bokkos Town',
    },
    {
      ward: 'Daffo',
      d: 'M 110,80 L 210,110 L 200,180 L 130,190 L 90,140 Z',
      cx: 150,
      cy: 140,
      color: '#0284c7', // Sky
      shortLabel: 'Daffo Highland',
    },
    {
      ward: 'Toff',
      d: 'M 70,170 L 130,190 L 120,260 L 60,240 Z',
      cx: 95,
      cy: 215,
      color: '#6366f1', // Indigo
      shortLabel: 'Toff',
    },
    {
      ward: 'Manguna',
      d: 'M 330,160 L 420,130 L 460,200 L 380,200 Z',
      cx: 400,
      cy: 170,
      color: '#16a34a', // Green
      shortLabel: 'Manguna',
    },
    {
      ward: 'Kunet',
      d: 'M 380,200 L 460,200 L 450,280 L 360,260 Z',
      cx: 410,
      cy: 240,
      color: '#d97706', // Amber
      shortLabel: 'Kunet',
    },
    {
      ward: 'Mushere Central',
      d: 'M 200,180 L 280,210 L 290,270 L 230,320 L 170,270 Z',
      cx: 235,
      cy: 250,
      color: '#84cc16', // Lime
      shortLabel: 'Mushere C.',
    },
    {
      ward: 'Mushere West',
      d: 'M 130,190 L 200,180 L 170,270 L 120,260 Z',
      cx: 155,
      cy: 225,
      color: '#10b981', // Emerald
      shortLabel: 'Mushere W.',
    },
    {
      ward: 'Kamwai',
      d: 'M 170,270 L 230,320 L 210,380 L 150,350 Z',
      cx: 190,
      cy: 330,
      color: '#eab308', // Yellow
      shortLabel: 'Kamwai',
    },
    {
      ward: 'Richa',
      d: 'M 230,320 L 290,270 L 340,320 L 310,400 L 240,390 Z',
      cx: 280,
      cy: 340,
      color: '#f97316', // Orange
      shortLabel: 'Richa Valley',
    },
    {
      ward: 'Sha',
      d: 'M 150,350 L 210,380 L 190,440 L 130,420 Z',
      cx: 170,
      cy: 400,
      color: '#8b5cf6', // Purple
      shortLabel: 'Sha Highland',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Spatial Value Chain
            </span>
            <span className="text-xs text-stone-500">Plateau State Agro-Ecological GIS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            Bokkos LGA Potato Production & Ward Map
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
            Explore agricultural zoning, soil classification, elevation gradients, and active harvest stock across all 11 wards of Bokkos Local Government Area.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prices')}
            leftIcon={<Mountain className="w-4 h-4 text-emerald-700" />}
          >
            Price Benchmarks
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('marketplace')}
            leftIcon={<Sprout className="w-4 h-4" />}
          >
            All Harvest Listings
          </Button>
        </div>
      </div>

      {/* Ward Quick Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-emerald-700" /> Select Ward:
        </span>
        {BOKKOS_WARDS_DATA.map((w) => {
          const isSelected = selectedWardName === w.ward;
          return (
            <button
              key={w.ward}
              onClick={() => setSelectedWardName(w.ward)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {w.ward}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Map & Ward Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive SVG Schematic Map */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Bokkos LGA Cartographic Schematic</h3>
              <p className="text-xs text-stone-500">Click any ward polygon to inspect soil, altitude, and current potato harvest</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
              11 Agricultural Wards
            </span>
          </div>

          <div className="relative w-full aspect-4/3 bg-stone-50 rounded-2xl border border-stone-200/80 p-2 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 520 480" className="w-full h-full drop-shadow-sm select-none">
              {/* Outer boundary ambient contour */}
              <path
                d="M 110,80 L 290,100 L 420,130 L 460,200 L 450,280 L 340,320 L 310,400 L 190,440 L 130,420 L 60,240 L 90,140 Z"
                fill="none"
                stroke="#e7e5e4"
                strokeWidth="6"
                strokeLinejoin="round"
              />

              {/* Ward Polygons */}
              {wardShapes.map((shape) => {
                const isSelected = selectedWardName === shape.ward;
                return (
                  <g key={shape.ward} className="cursor-pointer group" onClick={() => setSelectedWardName(shape.ward)}>
                    <path
                      d={shape.d}
                      fill={isSelected ? '#064e3b' : shape.color}
                      fillOpacity={isSelected ? 0.95 : 0.22}
                      stroke={isSelected ? '#047857' : shape.color}
                      strokeWidth={isSelected ? 3.5 : 1.5}
                      className="transition-all duration-200 group-hover:fill-opacity-50"
                    />
                    {/* Ward label */}
                    <text
                      x={shape.cx}
                      y={shape.cy}
                      textAnchor="middle"
                      fontSize={isSelected ? "11" : "10"}
                      fontWeight={isSelected ? "800" : "600"}
                      fill={isSelected ? "#ffffff" : "#1c1917"}
                      className="pointer-events-none tracking-tight select-none"
                    >
                      {shape.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600 space-y-2">
            <div className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider">
              Ecological Elevation Zones:
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500/40 border border-sky-600"></span>
                <span>High Plateau (&gt;1,400m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-600"></span>
                <span>Mid-Elevation Fadama</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500/40 border border-orange-600"></span>
                <span>Southern Valley Basin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Ward Comprehensive Dossier */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Ward Agro-Profile
                </span>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                  {selectedWard.ward} Ward
                </h2>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                  <Mountain className="w-3.5 h-3.5 text-stone-400" />
                  <span>Altitude: {selectedWard.elevationMeters}m ASL</span>
                  <span>•</span>
                  <span>Bokkos LGA, Plateau State</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {selectedWard.availableStockBags} Bags Available
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {selectedWard.description}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl space-y-0.5 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Registered Farmers</span>
                <span className="text-lg font-black text-stone-900">{selectedWard.activeFarmersCount}</span>
                <span className="text-[10px] text-emerald-700 block font-medium">Verified Growers</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-0.5 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Road Accessibility</span>
                <span className="text-xs font-bold text-stone-900 block mt-1">
                  {selectedWard.roadAccessibility === 'PAVED_HIGHWAY'
                    ? 'Paved Highway'
                    : selectedWard.roadAccessibility === 'GRADED_FEEDER'
                    ? 'Graded Feeder'
                    : 'Difficult in Rain'}
                </span>
                <span className="text-[10px] text-stone-500 block">Haulage Trucks</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-0.5 border border-stone-100 sm:col-span-1 col-span-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Stock Ready for Trade</span>
                <span className="text-lg font-black text-emerald-900">{selectedWard.availableStockBags}</span>
                <span className="text-[10px] text-stone-500 block">50kg standard sacks</span>
              </div>
            </div>

            {/* Detailed Parameters */}
            <div className="space-y-3 pt-2 text-xs divide-y divide-stone-100">
              <div className="flex justify-between items-start py-2">
                <span className="font-semibold text-stone-500">Soil Profile:</span>
                <span className="font-bold text-stone-900 text-right max-w-xs">{selectedWard.soilType}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-stone-500">Primary Cultivars:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {selectedWard.primaryVarieties.map((v) => (
                    <span key={v} className="px-2 py-0.5 bg-stone-100 rounded-md text-stone-800 font-semibold text-[11px]">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-start py-2">
                <span className="font-semibold text-stone-500">Primary Collection Depot:</span>
                <span className="font-bold text-stone-900 text-right max-w-xs">{selectedWard.mainCollectionHub}</span>
              </div>

              <div className="flex justify-between items-start py-2">
                <span className="font-semibold text-stone-500">Harvest Cycles:</span>
                <span className="font-semibold text-emerald-800 text-right max-w-xs">{selectedWard.harvestWindow}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => onNavigate('marketplace', selectedWard.ward)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Harvest in {selectedWard.ward}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('logistics')}
                leftIcon={<Truck className="w-4 h-4 text-emerald-700" />}
              >
                Book Transporter to {selectedWard.ward}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
