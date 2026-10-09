import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Search, 
  FileText, 
  Printer, 
  Sliders, 
  Sprout, 
  ChevronRight, 
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Sparkles,
  Download,
  Camera,
  Upload
} from 'lucide-react';
import { Button } from '../components/common/Button.tsx';
import { QualityPassport, PotatoVariety, BokkosWard, BOKKOS_WARDS } from '../types/index.ts';
import { INITIAL_QUALITY_PASSPORTS } from '../services/phase5Data.ts';
import { firestoreService } from '../services/firestoreService.ts';

interface QualityPassportViewProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const QualityPassportView: React.FC<QualityPassportViewProps> = ({ onNavigate }) => {
  const [passports, setPassports] = useState<QualityPassport[]>(INITIAL_QUALITY_PASSPORTS);
  const [selectedPassport, setSelectedPassport] = useState<QualityPassport>(INITIAL_QUALITY_PASSPORTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'passports' | 'lab-calculator'>('passports');

  // Load from Firestore
  React.useEffect(() => {
    firestoreService.getQualityPassports().then((cloudPassports) => {
      if (cloudPassports && cloudPassports.length > 0) {
        setPassports(cloudPassports);
        setSelectedPassport(cloudPassports[0]);
      }
    }).catch(console.warn);
  }, []);

  // Interactive Diagnostic Simulator State
  const [calcVariety, setCalcVariety] = useState<PotatoVariety>('Nicola');
  const [calcDryMatter, setCalcDryMatter] = useState<number>(22.1);
  const [calcCaliber, setCalcCaliber] = useState<number>(62);
  const [calcSkinSet, setCalcSkinSet] = useState<number>(94);
  const [calcDefectRate, setCalcDefectRate] = useState<number>(1.2);
  const [calcHollowHeart, setCalcHollowHeart] = useState<boolean>(false);
  const [calcBlightFree, setCalcBlightFree] = useState<boolean>(true);

  // AI Vision Agronomist State
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const handleImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedPreview(base64);
      setAiAnalyzing(true);
      setAiReport(null);

      try {
        const res = await fetch('/api/ai/inspect-potato', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            variety: calcVariety,
            mimeType: file.type || 'image/jpeg',
          }),
        });
        const data = await res.json();
        if (data.success && data.analysis) {
          setAiReport(data.analysis);
          // Automatically adjust diagnostic sliders based on AI vision findings
          if (data.analysis.skinSetScore) setCalcSkinSet(data.analysis.skinSetScore);
          if (data.analysis.blightDetected !== undefined) setCalcBlightFree(!data.analysis.blightDetected);
          if (data.analysis.defects && data.analysis.defects.length > 2) {
            setCalcDefectRate(3.2);
          } else {
            setCalcDefectRate(1.1);
          }
        }
      } catch (err) {
        console.warn('AI analysis error:', err);
      } finally {
        setAiAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // New Passport Form Modal
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [issueProducer, setIssueProducer] = useState<string>('Daffo Highland Farmers Union');
  const [issueWard, setIssueWard] = useState<BokkosWard>('Daffo');
  const [issueVariety, setIssueVariety] = useState<PotatoVariety>('Caruso');
  const [issueInspector, setIssueInspector] = useState<string>('Engr. D. K. Mutfwang (Senior Agronomist)');
  const [issueSuccess, setIssueSuccess] = useState<boolean>(false);

  // Evaluation algorithm
  const evaluateBatchGrade = () => {
    if (!calcBlightFree || calcDefectRate > 4.0 || calcSkinSet < 70) {
      return {
        grade: 'REJECTED / BELOW_GRADE',
        label: 'Below Certified Grade',
        color: 'text-red-700 bg-red-50 border-red-200',
        badge: 'Disqualified for Long Haul',
        notes: 'Excessive defect rate or weak skin curing. Risk of transit rot is high. Must be sold immediately in local Bokkos market.',
      };
    }

    if (calcVariety === 'Caruso' || calcVariety === 'Lady Rosetta') {
      if (calcDryMatter >= 21.5 && !calcHollowHeart && calcDefectRate <= 2.0) {
        return {
          grade: 'INDUSTRIAL_PROCESSING',
          label: 'Certified Industrial Crisp & Fry Grade',
          color: 'text-purple-800 bg-purple-50 border-purple-200',
          badge: 'Premium Crisp Grade (21.5%+ DM)',
          notes: 'High dry matter guarantees low oil absorption and golden color frying test without browning. Qualified for food processing factories.',
        };
      }
    }

    if (calcCaliber >= 50 && calcSkinSet >= 90 && calcDefectRate <= 1.5 && !calcHollowHeart) {
      return {
        grade: 'EXPORT_GRADE_A',
        label: 'Certified Export Grade A',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        badge: 'Top Commercial Export (50mm+)',
        notes: 'Uniform caliber, pristine skin-set curing with thumb-rub test passed. Approved for long-distance haulage to Lagos / export terminals.',
      };
    }

    if (calcCaliber >= 28 && calcCaliber <= 48 && calcBlightFree && calcDefectRate < 1.0) {
      return {
        grade: 'CERTIFIED_SEED_G3',
        label: 'Certified Generation-3 Seed (G3)',
        color: 'text-sky-800 bg-sky-50 border-sky-200',
        badge: 'Certified Seed Tuber (28-45mm)',
        notes: 'Ideal tuber size with strong apical bud formation. Zero bacterial wilt or viral degeneration. Qualified for multiplication.',
      };
    }

    return {
      grade: 'TABLE_GRADE_1',
      label: 'Standard Table Potato Grade 1',
      color: 'text-stone-800 bg-stone-100 border-stone-200',
      badge: 'Fresh Table Consumption',
      notes: 'Suitable for wholesale and retail consumption. Clean tubers with standard shelf-life profile.',
    };
  };

  const currentEvaluation = evaluateBatchGrade();

  // Filter passports
  const filteredPassports = passports.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.passportNumber.toLowerCase().includes(q) ||
      p.producerOrPool.toLowerCase().includes(q) ||
      p.ward.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q)
    );
  });

  const handleCreatePassport = (e: React.FormEvent) => {
    e.preventDefault();
    const newPassport: QualityPassport = {
      id: `qp_${Date.now()}`,
      passportNumber: `PADP-BKK-QC-2026-0${Math.floor(920 + Math.random() * 80)}`,
      batchReference: `BATCH-BKK-${issueVariety.substring(0, 3).toUpperCase()}-${Math.floor(200 + Math.random() * 500)}`,
      producerOrPool: issueProducer,
      ward: issueWard,
      variety: issueVariety,
      harvestDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectorName: issueInspector,
      inspectorBadge: 'PADP-PLATEAU-QC-078',
      accreditationBody: 'Plateau Agricultural Development Programme (PADP)',
      certifiedGrade: currentEvaluation.grade as any,
      metrics: {
        dryMatterPercent: Number(calcDryMatter),
        specificGravity: Number((1 + calcDryMatter / 250).toFixed(3)),
        sizeCaliberMm: `${calcCaliber}mm Average Caliber`,
        skinSetScore: Number(calcSkinSet),
        defectRatePercent: Number(calcDefectRate),
        internalDefects: calcHollowHeart ? 'Trace Hollow Heart' : 'Zero Internal Defects',
        moisturePercent: Number((100 - calcDryMatter).toFixed(1)),
        fungalScore: calcBlightFree ? 'Late Blight Free (Negative)' : 'Trace Blight Detected',
      },
      qrCodeData: `https://bokkosagrolink.ng/verify/PADP-BKK-QC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      verifiedStatus: 'VALID_CERTIFIED',
      officialNotes: currentEvaluation.notes,
    };

    setPassports([newPassport, ...passports]);
    setSelectedPassport(newPassport);
    firestoreService.saveQualityPassport(newPassport).catch(console.warn);
    setIssueSuccess(true);
    setTimeout(() => {
      setShowIssueModal(false);
      setIssueSuccess(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-left relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>PADP Certified Quality Grading Standard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Digital Quality Passports & Lab Certifications
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Every bulk potato lot in Bokkos is tested for dry matter content, size caliber, skin-set maturity, and pathogen index. Certified by the Plateau Agricultural Development Programme (PADP) to assure interstate buyers of zero transport rot.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setActiveTab('lab-calculator');
                }}
                leftIcon={<Sliders className="w-4 h-4" />}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold"
              >
                Interactive Quality Diagnostic Lab
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowIssueModal(true)}
                leftIcon={<Award className="w-4 h-4 text-emerald-300" />}
                className="border-stone-700 text-white hover:bg-stone-800"
              >
                Issue Certified Batch Passport
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('escrow-vault')}
                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
                className="border-stone-700 text-white hover:bg-stone-800"
              >
                Link to Escrow Vault
              </Button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-stone-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('passports')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'passports'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Certified Passports Registry ({passports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lab-calculator')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'lab-calculator'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interactive Quality Grading Simulator</span>
          </button>
        </div>

        {/* TAB 1: PASSENGERS & CERTIFICATES */}
        {activeTab === 'passports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Left Column: List & Search (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search passport ID, variety, ward..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              <div className="space-y-3">
                {filteredPassports.map((passport) => {
                  const isSelected = passport.id === selectedPassport.id;
                  return (
                    <div
                      key={passport.id}
                      onClick={() => setSelectedPassport(passport)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xs font-bold text-stone-500">
                          {passport.passportNumber}
                        </span>
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {passport.certifiedGrade.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{passport.producerOrPool}</h4>
                        <p className="text-xs text-stone-500">
                          {passport.variety} • {passport.ward} Ward • Dry Matter {passport.metrics.dryMatterPercent}%
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-2xs text-stone-400 pt-1 border-t border-stone-100">
                        <span>Inspected: {passport.inspectionDate}</span>
                        <span className="text-emerald-800 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> PADP Verified
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Full Certificate Dossier (7 cols) */}
            <div className="lg:col-span-7">
              <div id="printable-certificate" className="bg-white rounded-3xl border-2 border-stone-300 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                
                {/* Official Certificate Header */}
                <div className="border-b-2 border-stone-200 pb-5 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-800">
                    <Award className="w-6 h-6" />
                    <span className="font-black tracking-widest text-xs uppercase">
                      Plateau Agricultural Development Programme (PADP)
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                    Official Potato Quality & Phytosanitary Passport
                  </h2>
                  <p className="text-2xs text-stone-500 max-w-md mx-auto">
                    Conforms to Nigerian National Industrial Standards (NIS 482) for Solanum tuberosum commercial classification & export haulage.
                  </p>
                </div>

                {/* Passport Code & Status */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-2xs font-bold text-stone-500 uppercase block">Passport Serial Number</span>
                    <span className="text-base font-black font-mono text-emerald-900">
                      {selectedPassport.passportNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xs font-bold text-stone-500 uppercase block">Certified Classification</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      {selectedPassport.certifiedGrade.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-2xs font-bold text-stone-500 uppercase block">Verification Seal</span>
                    <span className="text-2xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                      PADP STAMP #8842
                    </span>
                  </div>
                </div>

                {/* Batch Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-2xs text-stone-400 block font-medium">Producer / Pool</span>
                    <span className="font-bold text-stone-900">{selectedPassport.producerOrPool}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-2xs text-stone-400 block font-medium">Origin Ward</span>
                    <span className="font-bold text-stone-900">{selectedPassport.ward} Ward</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-2xs text-stone-400 block font-medium">Cultivar / Variety</span>
                    <span className="font-bold text-emerald-800">{selectedPassport.variety}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-2xs text-stone-400 block font-medium">Inspection Date</span>
                    <span className="font-bold text-stone-900">{selectedPassport.inspectionDate}</span>
                  </div>
                </div>

                {/* Laboratory Metric Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-700" />
                    Laboratory Diagnostic Assay Metrics
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Dry Matter Content:</span>
                        <span className="font-black text-emerald-800">{selectedPassport.metrics.dryMatterPercent}%</span>
                      </div>
                      <div className="flex justify-between text-2xs text-stone-400">
                        <span>Specific Gravity:</span>
                        <span>{selectedPassport.metrics.specificGravity}</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-emerald-600 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (selectedPassport.metrics.dryMatterPercent / 25) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Skin-Set Curing Score:</span>
                        <span className="font-black text-emerald-800">{selectedPassport.metrics.skinSetScore} / 100</span>
                      </div>
                      <div className="flex justify-between text-2xs text-stone-400">
                        <span>Thumb-rub friction test:</span>
                        <span>PASSED (Zero Peeling)</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-emerald-600 h-full rounded-full" 
                          style={{ width: `${selectedPassport.metrics.skinSetScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Caliber Distribution:</span>
                        <span className="font-bold text-stone-900">{selectedPassport.metrics.sizeCaliberMm}</span>
                      </div>
                      <span className="text-2xs text-stone-400 block">Mechanical riddle sizing verified</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Defect Tolerance:</span>
                        <span className="font-bold text-stone-900">{selectedPassport.metrics.defectRatePercent}% (&lt; 2.0% std)</span>
                      </div>
                      <span className="text-2xs text-stone-400 block">{selectedPassport.metrics.internalDefects}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-2xs font-bold text-emerald-900 uppercase block">Phytosanitary Pathogen Assay</span>
                      <span className="font-semibold text-emerald-800">{selectedPassport.metrics.fungalScore}</span>
                    </div>
                    <span className="text-2xs font-black px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                      CLEAN
                    </span>
                  </div>
                </div>

                {/* Official Notes & Inspector Sign-off */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <span className="text-2xs font-bold uppercase text-stone-500 block">Agronomist Inspection Remarks</span>
                  <p className="text-stone-700 italic">"{selectedPassport.officialNotes}"</p>
                  
                  <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-2xs text-stone-500">
                    <div>
                      <span className="block font-bold text-stone-800">{selectedPassport.inspectorName}</span>
                      <span>Badge: {selectedPassport.inspectorBadge}</span>
                    </div>
                    <div>
                      <span className="block font-semibold">{selectedPassport.accreditationBody}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom QR & Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                  <div className="flex items-center gap-2 text-stone-600 text-2xs">
                    <QrCode className="w-8 h-8 text-stone-800" />
                    <div>
                      <span className="font-bold block text-stone-900">Digital QR Verification</span>
                      <span>Scan on arrival at Terminal Market</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Print Certificate
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate('escrow-vault')}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Attach to Escrow
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE LAB DIAGNOSTIC CALCULATOR */}
        {activeTab === 'lab-calculator' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 text-left">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Laboratory Simulation Suite
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                Batch Quality Grading Diagnostic Engine
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
                Simulate laboratory quality testing parameters before loading transport trailers to verify whether a batch meets standards for export, industrial processing, or certified seed.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* AI Potato Vision Diagnostic Scanner */}
                <div className="bg-emerald-950 text-white p-5 rounded-3xl border border-emerald-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>AI Agronomist Photo Inspection</span>
                          <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full text-emerald-200 font-normal">Gemini Vision</span>
                        </h4>
                        <p className="text-2xs text-stone-300">
                          Upload or snap a photo of tubers or foliage to automatically test for skin curing and blight
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white cursor-pointer transition shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{aiAnalyzing ? 'Analyzing with Gemini...' : 'Upload Potato Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageAnalysis} 
                        disabled={aiAnalyzing}
                        className="hidden" 
                      />
                    </label>

                    {uploadedPreview && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={uploadedPreview} 
                          alt="Tuber Sample" 
                          className="w-12 h-12 object-cover rounded-xl border border-emerald-700" 
                        />
                        <span className="text-2xs text-stone-300">Sample loaded</span>
                      </div>
                    )}
                  </div>

                  {aiReport && (
                    <div className="p-3.5 bg-emerald-900/90 rounded-2xl border border-emerald-700/80 text-xs space-y-2 text-stone-200">
                      <div className="flex items-center justify-between text-2xs font-bold text-emerald-300">
                        <span>AI ASSESSMENT RESULT</span>
                        <span className="bg-emerald-800 px-2 py-0.5 rounded-md">{aiReport.healthStatus}</span>
                      </div>
                      <p className="font-medium text-white text-xs">{aiReport.commercialVerdict}</p>
                      <div className="grid grid-cols-2 gap-2 text-2xs text-stone-300 pt-1">
                        <div>Skin-Set: <strong className="text-emerald-300">{aiReport.skinSetScore}%</strong></div>
                        <div>Blight Free: <strong className="text-emerald-300">{aiReport.blightDetected ? 'No (Warning)' : 'Yes (Clean)'}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Cultivar Selection */}
                <div>
                  <label className="font-bold text-xs text-stone-700 block mb-2">
                    Potato Cultivar / Variety
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(['Nicola', 'Caruso', 'Marabel', 'Lady Rosetta', 'Bertita'] as PotatoVariety[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setCalcVariety(v)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                          calcVariety === v
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 1: Dry Matter % */}
                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Dry Matter Content (%)</span>
                    <span className="font-black text-emerald-800 text-sm">{calcDryMatter}%</span>
                  </div>
                  <input
                    type="range"
                    min="17.0"
                    max="25.0"
                    step="0.1"
                    value={calcDryMatter}
                    onChange={(e) => setCalcDryMatter(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-stone-400">
                    <span>17.0% (Soft/Boiling)</span>
                    <span>21.5%+ (Commercial Crisping Threshold)</span>
                    <span>25.0% (Starch Heavy)</span>
                  </div>
                </div>

                {/* Slider 2: Size Caliber (mm) */}
                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Average Tuber Caliber (mm)</span>
                    <span className="font-black text-emerald-800 text-sm">{calcCaliber} mm</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="85"
                    step="1"
                    value={calcCaliber}
                    onChange={(e) => setCalcCaliber(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-stone-400">
                    <span>25-45mm (Seed Tubers)</span>
                    <span>50-70mm (Grade A Table)</span>
                    <span>70mm+ (Jumbo Processing)</span>
                  </div>
                </div>

                {/* Slider 3: Skin-Set Maturity Score */}
                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Skin-Set Maturity Index (Thumb-Rub Friction)</span>
                    <span className="font-black text-emerald-800 text-sm">{calcSkinSet} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    step="1"
                    value={calcSkinSet}
                    onChange={(e) => setCalcSkinSet(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-stone-400">
                    <span>&lt;80 (Immature - High transit friction rot)</span>
                    <span>90+ (Dehaulmed 14+ days - Haulage Safe)</span>
                  </div>
                </div>

                {/* Slider 4: Defect Rate */}
                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Batch Defect Rate (%)</span>
                    <span className="font-black text-emerald-800 text-sm">{calcDefectRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="6.0"
                    step="0.1"
                    value={calcDefectRate}
                    onChange={(e) => setCalcDefectRate(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-stone-400">
                    <span>&lt;1.5% (Premium Grade)</span>
                    <span>2.5% (Max acceptable commercial tolerance)</span>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcBlightFree}
                      onChange={(e) => setCalcBlightFree(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Phytosanitary: Late Blight Negative</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcHollowHeart}
                      onChange={(e) => setCalcHollowHeart(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>Has Trace Hollow Heart</span>
                  </label>
                </div>
              </div>

              {/* Diagnostic Result Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-2xs font-bold tracking-wider text-emerald-400 uppercase">
                      Automated Certification Output
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${currentEvaluation.color}`}>
                    <span className="text-2xs font-bold uppercase block tracking-wider opacity-80">
                      Evaluated Quality Grade
                    </span>
                    <h3 className="text-xl font-black mt-0.5">{currentEvaluation.label}</h3>
                    <p className="text-2xs mt-2 font-medium leading-relaxed">{currentEvaluation.notes}</p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-stone-800 pt-4 text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Cultivar:</span>
                      <span className="font-bold text-white">{calcVariety}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Dry Matter:</span>
                      <span className="font-bold text-white">{calcDryMatter}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Tuber Caliber:</span>
                      <span className="font-bold text-white">{calcCaliber} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Skin Set Score:</span>
                      <span className="font-bold text-white">{calcSkinSet} / 100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Defect Level:</span>
                      <span className="font-bold text-white">{calcDefectRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-800">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setShowIssueModal(true);
                    }}
                    leftIcon={<Award className="w-4 h-4" />}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold"
                  >
                    Generate Official Passport for this Batch
                  </Button>
                  <p className="text-2xs text-stone-400 text-center">
                    Creates verifiable tamper-proof QR passport record in PADP Registry
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ISSUE PASSPORT MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl text-left">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">PADP Accreditation</span>
              <h3 className="text-xl font-black text-stone-900 mt-0.5">
                Issue Certified Batch Passport
              </h3>
              <p className="text-xs text-stone-500">
                Grade: <strong>{currentEvaluation.label}</strong> ({calcVariety})
              </p>
            </div>

            {issueSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>Successfully generated official PADP Digital Quality Passport! Certified record saved.</span>
              </div>
            ) : (
              <form onSubmit={handleCreatePassport} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Producer or Cooperative Name</label>
                  <input
                    type="text"
                    required
                    value={issueProducer}
                    onChange={(e) => setIssueProducer(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Bokkos Ward</label>
                    <select
                      value={issueWard}
                      onChange={(e) => setIssueWard(e.target.value as BokkosWard)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                    >
                      {BOKKOS_WARDS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Variety</label>
                    <select
                      value={issueVariety}
                      onChange={(e) => setIssueVariety(e.target.value as PotatoVariety)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                    >
                      <option value="Nicola">Nicola</option>
                      <option value="Caruso">Caruso</option>
                      <option value="Marabel">Marabel</option>
                      <option value="Lady Rosetta">Lady Rosetta</option>
                      <option value="Bertita">Bertita</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Assigned PADP Inspector</label>
                  <input
                    type="text"
                    required
                    value={issueInspector}
                    onChange={(e) => setIssueInspector(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-2xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dry matter:</span>
                    <span className="font-bold">{calcDryMatter}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Skin-set curing:</span>
                    <span className="font-bold">{calcSkinSet}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Caliber size:</span>
                    <span className="font-bold">{calcCaliber}mm</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold"
                  >
                    Sign & Seal Passport
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
