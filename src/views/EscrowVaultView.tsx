import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Download, 
  CreditCard, 
  RefreshCw, 
  FileText, 
  UserCheck, 
  DollarSign, 
  KeyRound,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '../components/common/Button.tsx';
import { EscrowTransaction, EscrowMilestone } from '../types/index.ts';
import { INITIAL_ESCROW_TRANSACTIONS } from '../services/phase5Data.ts';
import { firestoreService } from '../services/firestoreService.ts';
import { PaystackGatewayModal } from '../components/payment/PaystackGatewayModal.tsx';
import { WaybillInvoiceModal } from '../components/common/WaybillInvoiceModal.tsx';

interface EscrowVaultViewProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const EscrowVaultView: React.FC<EscrowVaultViewProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(INITIAL_ESCROW_TRANSACTIONS);
  const [selectedTxn, setSelectedTxn] = useState<EscrowTransaction>(INITIAL_ESCROW_TRANSACTIONS[0]);

  // Real-time Firestore sync for Escrow Vault
  React.useEffect(() => {
    const unsubscribe = firestoreService.subscribeToEscrow((cloudTxns) => {
      if (cloudTxns && cloudTxns.length > 0) {
        setTransactions(cloudTxns);
        setSelectedTxn((prev) => cloudTxns.find((t) => t.id === prev.id) || cloudTxns[0]);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Action modals / state
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showGatewayModal, setShowGatewayModal] = useState<boolean>(false);
  const [showWaybillModal, setShowWaybillModal] = useState<boolean>(false);
  const [pendingEscrowCode, setPendingEscrowCode] = useState<string>('ESC-BKK-2026-0841');
  const [depositAmount, setDepositAmount] = useState<number>(3500000);
  const [depositBuyer, setDepositBuyer] = useState<string>('Grand Cereals Ltd (Procurement)');
  const [depositCity, setDepositCity] = useState<string>('Jos / Bukuru');
  const [depositEntity, setDepositEntity] = useState<string>('Consortium: Daffo Valley Caruso (100 Bags)');

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Advance milestone
  const handleAdvanceMilestone = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txnId) {
          const nextIncompleteIdx = t.milestones.findIndex((m) => !m.completed);
          if (nextIncompleteIdx === -1) return t;

          const updatedMilestones = [...t.milestones];
          updatedMilestones[nextIncompleteIdx] = {
            ...updatedMilestones[nextIncompleteIdx],
            completed: true,
            completedAt: new Date().toLocaleString(),
            referenceCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          };

          let newStatus = t.status;
          if (nextIncompleteIdx === 1) newStatus = 'LOADING_WAYBILL_ISSUED';
          if (nextIncompleteIdx === 2) newStatus = 'IN_TRANSIT';
          if (nextIncompleteIdx === 3) newStatus = 'FUNDS_RELEASED';

          const updatedTxn = {
            ...t,
            status: newStatus,
            milestones: updatedMilestones,
          };

          firestoreService.saveEscrowTransaction(updatedTxn).catch(console.warn);

          // Dispatch live SMS to farmer phone on milestone change
          fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: t.farmerPhone || '08031234567',
              message: `AgroLink Escrow: Mataki ${nextIncompleteIdx + 1} an tabbatar domin ${t.escrowCode}. Sabon matsayi: ${newStatus}. Kudi N${t.totalAmountNaira.toLocaleString()} suna cikin aminci.`,
              senderId: 'AgroLink',
              language: 'Hausa',
            }),
          }).catch(console.warn);

          if (selectedTxn.id === txnId) {
            setSelectedTxn(updatedTxn);
          }

          return updatedTxn;
        }
        return t;
      })
    );

    setNotificationMsg(`Milestone successfully verified! Escrow state updated.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Deposit simulation: step 1 opens payment gateway
  const handleCreateEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `ESC-BKK-2026-0${Math.floor(8000 + Math.random() * 1000)}`;
    setPendingEscrowCode(code);
    setShowDepositModal(false);
    setShowGatewayModal(true);
  };

  const handlePaymentSuccess = (paymentDetails: {
    reference: string;
    channel: string;
    amount: number;
    paidAt: string;
    bankName?: string;
  }) => {
    const newTxn: EscrowTransaction = {
      id: `esc_${Date.now()}`,
      escrowCode: pendingEscrowCode,
      relatedEntity: depositEntity,
      buyerName: depositBuyer,
      buyerPhone: '08039871122',
      buyerCity: depositCity,
      farmerOrPoolName: 'Butura Potato Growers Multipurpose Coop',
      farmerPhone: '08023456789',
      farmerBank: {
        bankName: 'Zenith Bank PLC',
        accountNumber: '1014889201',
        accountName: 'Butura Potato Farmers Multipurpose Coop',
      },
      transporterName: 'Mallam Haruna Yakubu (Mercedes 7-Ton Truck)',
      transporterPhone: '08039871122',
      waybillNumber: `WAYBILL-BKK-LG-0${Math.floor(100 + Math.random() * 900)}`,
      totalAmountNaira: Number(depositAmount),
      bagCount: Math.round(Number(depositAmount) / 35000),
      variety: 'Nicola',
      status: 'FUNDS_LOCKED',
      createdAt: new Date().toISOString(),
      autoReleaseHoursRemaining: 48,
      milestones: [
        {
          stage: 1,
          title: 'Escrow Funds Deposited & Secured',
          description: `₦${Number(depositAmount).toLocaleString()} cleared via ${paymentDetails.channel}. Locked into Bokkos AgroLink Escrow Vault from ${depositBuyer}.`,
          completed: true,
          completedAt: paymentDetails.paidAt || new Date().toLocaleTimeString(),
          referenceCode: paymentDetails.reference,
        },
        {
          stage: 2,
          title: 'Depot Waybill & Security Seal Issued',
          description: 'Depot loading verification, inspection check & electronic waybill creation.',
          completed: false,
        },
        {
          stage: 3,
          title: 'Highway Haulage & Transit Tracking',
          description: 'Interstate transit tracking with route security checkpoints.',
          completed: false,
        },
        {
          stage: 4,
          title: 'Warehouse Delivery & Bank Payout',
          description: 'Buyer delivery verification & instant release to farmer bank account.',
          completed: false,
        },
      ],
    };

    setTransactions([newTxn, ...transactions]);
    setSelectedTxn(newTxn);
    firestoreService.saveEscrowTransaction(newTxn).catch(console.warn);

    // Send instant SMS confirmation to farmer and buyer
    fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: newTxn.farmerPhone,
        message: `AgroLink: Mai saye ya biya N${newTxn.totalAmountNaira.toLocaleString()} a asusun Escrow don kwangilar ${newTxn.escrowCode}. Shirya buhuna don lodi.`,
        senderId: 'AgroLink',
        language: 'Hausa',
      }),
    }).catch(console.warn);

    setNotificationMsg(`Escrow contract ${newTxn.escrowCode} activated! ₦${newTxn.totalAmountNaira.toLocaleString()} secured in vault via ${paymentDetails.channel}. SMS alert dispatched.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const totalVaultSecured = transactions.reduce((acc, curr) => acc + curr.totalAmountNaira, 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-left relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Default Agricultural Trade Settlement</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Smart Escrow & Milestone Settlement Vault
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Eliminating inter-state payment risks between Bokkos smallholders and distant buyers in Lagos, Abuja, and Kano. Buyer deposits funds before loading; farmer receives guaranteed instant bank release upon verified arrival.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setShowDepositModal(true)}
                leftIcon={<Lock className="w-4 h-4" />}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold"
              >
                Initiate Escrow Deposit
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('cooperative-pools')}
                leftIcon={<Building2 className="w-4 h-4 text-emerald-300" />}
                className="border-emerald-800 text-white hover:bg-emerald-900"
              >
                View Cooperative Pools
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('quality-passport')}
                leftIcon={<FileText className="w-4 h-4 text-emerald-300" />}
                className="border-emerald-800 text-white hover:bg-emerald-900"
              >
                Verify Quality Passports
              </Button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <Lock className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Total Volume in Escrow</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  ₦{(totalVaultSecured / 1000000).toFixed(2)} Million
                </p>
              </div>
            </div>
            <p className="text-2xs text-stone-400 mt-2">Zero payment defaults recorded</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Active Transit Convoys</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {transactions.filter((t) => t.status === 'IN_TRANSIT').length} Shipments
                </p>
              </div>
            </div>
            <p className="text-2xs text-stone-400 mt-2">On Akwanga & Ore corridors</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Completed Settlements</p>
                <p className="text-xl sm:text-2xl font-black text-stone-900">
                  {transactions.filter((t) => t.status === 'FUNDS_RELEASED').length} Settlements
                </p>
              </div>
            </div>
            <p className="text-2xs text-stone-400 mt-2">Instant NIBSS NIP bank payout</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {notificationMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Main Vault Work area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Column 1: Escrow Contracts List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Active Escrow Contracts ({transactions.length})
              </h3>
              <span className="text-2xs text-stone-400">Auto-refresh active</span>
            </div>

            <div className="space-y-3">
              {transactions.map((txn) => {
                const isSelected = txn.id === selectedTxn.id;
                const completedStages = txn.milestones.filter((m) => m.completed).length;

                return (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {txn.escrowCode}
                      </span>
                      <span className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                        txn.status === 'FUNDS_RELEASED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : txn.status === 'IN_TRANSIT'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {txn.status === 'FUNDS_RELEASED' ? '✅ Disbursed to Bank' : txn.status === 'IN_TRANSIT' ? '🚚 In Transit' : '🔒 Funds Locked'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-stone-900 text-base">{txn.relatedEntity}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Buyer: <strong>{txn.buyerName}</strong> ({txn.buyerCity})
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div>
                        <span className="text-2xs text-stone-400 block">Secured Value</span>
                        <span className="text-sm font-black text-emerald-900">
                          ₦{txn.totalAmountNaira.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-2xs text-stone-400 block">Milestones</span>
                        <span className="text-xs font-bold text-stone-700">
                          {completedStages} / 4 Verified
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Escrow Stepper & Interactive Operations (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Stepper Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-5">
                <div>
                  <span className="text-2xs font-mono font-bold text-stone-500 block">
                    CONTRACT REF: {selectedTxn.escrowCode}
                  </span>
                  <h3 className="text-xl font-black text-stone-900">{selectedTxn.relatedEntity}</h3>
                  <p className="text-xs text-stone-500">
                    Waybill: <strong>{selectedTxn.waybillNumber}</strong> • Transporter: {selectedTxn.transporterName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xs text-stone-500 uppercase block font-bold">Locked Vault Value</span>
                  <span className="text-xl font-black text-emerald-800">
                    ₦{selectedTxn.totalAmountNaira.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 4-Stage Milestone Stepper */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Verification Milestones
                </h4>

                <div className="space-y-4">
                  {selectedTxn.milestones.map((milestone, idx) => {
                    const isNextToVerify = !milestone.completed && (idx === 0 || selectedTxn.milestones[idx - 1].completed);

                    return (
                      <div 
                        key={milestone.stage}
                        className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                          milestone.completed
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : isNextToVerify
                            ? 'bg-stone-50 border-stone-300 ring-1 ring-emerald-500'
                            : 'bg-stone-50/40 border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            milestone.completed
                              ? 'bg-emerald-600 text-white'
                              : isNextToVerify
                              ? 'bg-emerald-800 text-white animate-pulse'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {milestone.completed ? <CheckCircle2 className="w-4 h-4" /> : milestone.stage}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-stone-900 text-sm">{milestone.title}</h5>
                              {milestone.completed && (
                                <span className="text-2xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600">{milestone.description}</p>
                            {milestone.completedAt && (
                              <p className="text-2xs text-stone-400 pt-1 font-mono">
                                Timestamp: {milestone.completedAt} • Ref: {milestone.referenceCode}
                              </p>
                            )}
                          </div>
                        </div>

                        {isNextToVerify && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAdvanceMilestone(selectedTxn.id)}
                            className="shrink-0 text-xs font-bold"
                          >
                            Verify Stage
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Farmer Bank Account Card */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    Beneficiary Farmer Account Details
                  </span>
                  <span className="text-2xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    NIBSS Validated
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-2xs text-stone-400 block">Bank Name</span>
                    <span className="font-bold text-stone-800">{selectedTxn.farmerBank.bankName}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-stone-400 block">Account Number</span>
                    <span className="font-mono font-bold text-stone-900">{selectedTxn.farmerBank.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-stone-400 block">Account Name</span>
                    <span className="font-bold text-stone-800">{selectedTxn.farmerBank.accountName}</span>
                  </div>
                </div>
              </div>

              {/* Operational Buttons */}
              <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-2xs text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>48-Hour Inspection Escrow Protection</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWaybillModal(true)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    className="text-xs font-bold text-emerald-950 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100"
                  >
                    View & Print Waybill
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('ussd-gateway')}
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    USSD Simulator
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* INITIATE ESCROW DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl text-left">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">Escrow Settlement</span>
              <h3 className="text-xl font-black text-stone-900 mt-0.5">
                Lock Purchase Funds in Neutral Vault
              </h3>
              <p className="text-xs text-stone-500">
                Guaranteed deposit held securely until verified potato delivery.
              </p>
            </div>

            <form onSubmit={handleCreateEscrow} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Contract / Lot Description</label>
                <input
                  type="text"
                  required
                  value={depositEntity}
                  onChange={(e) => setDepositEntity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Buyer Business Name</label>
                  <input
                    type="text"
                    required
                    value={depositBuyer}
                    onChange={(e) => setDepositBuyer(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={depositCity}
                    onChange={(e) => setDepositCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Deposit Amount (₦)</label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-base text-stone-900"
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-2xs space-y-1 text-emerald-950">
                <span className="font-bold block uppercase text-emerald-800">Escrow Guarantee</span>
                <p>• Funds remain locked until destination warehouse signs physical arrival.</p>
                <p>• Transporter will not be dispatched until this deposit clears.</p>
                <p>• 48-hour inspection dispute arbitration if transit rot occurs.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Proceed to Payment Gateway
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NIGERIAN PAYMENT GATEWAY (PAYSTACK / NIBSS SANDBOX) */}
      <PaystackGatewayModal
        isOpen={showGatewayModal}
        onClose={() => setShowGatewayModal(false)}
        amount={depositAmount}
        escrowCode={pendingEscrowCode}
        buyerName={depositBuyer}
        itemDescription={depositEntity}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* PRINTABLE WAYBILL & ESCROW INVOICE MODAL */}
      <WaybillInvoiceModal
        isOpen={showWaybillModal}
        onClose={() => setShowWaybillModal(false)}
        transaction={selectedTxn}
      />

    </div>
  );
};
