import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Building2, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  X, 
  Loader2,
  Check,
  Smartphone
} from 'lucide-react';
import { Button } from '../common/Button.tsx';

interface PaystackGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  escrowCode: string;
  buyerName: string;
  itemDescription: string;
  onPaymentSuccess: (details: {
    reference: string;
    channel: string;
    amount: number;
    paidAt: string;
    bankName?: string;
  }) => void;
}

export const PaystackGatewayModal: React.FC<PaystackGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  escrowCode,
  buyerName,
  itemDescription,
  onPaymentSuccess,
}) => {
  const [activeChannel, setActiveChannel] = useState<'transfer' | 'card' | 'ussd'>('transfer');
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'otp' | 'success'>('select');
  const [copied, setCopied] = useState<string | null>(null);

  // Virtual Account Info
  const [virtualAccount, setVirtualAccount] = useState({
    bankName: 'Providus Bank',
    accountNumber: '9928471920',
    accountName: `Bokkos AgroLink Escrow - ${escrowCode}`,
    expiresInMinutes: 59,
  });

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4084 0840 1122 3344');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('182');
  const [cardPin, setCardPin] = useState('1234');
  const [cardOtp, setCardOtp] = useState('');

  // USSD Bank Selection
  const [selectedBank, setSelectedBank] = useState('GTBank');

  const USSD_CODES: Record<string, string> = {
    'GTBank': `*737*000*${Math.floor(1000 + Math.random() * 8999)}#`,
    'Zenith Bank': `*966*00*${Math.floor(1000 + Math.random() * 8999)}#`,
    'Access Bank': `*901*000*${Math.floor(1000 + Math.random() * 8999)}#`,
    'UBA': `*919*00*${Math.floor(1000 + Math.random() * 8999)}#`,
    'FirstBank': `*894*000*${Math.floor(1000 + Math.random() * 8999)}#`,
  };

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('select');
      setLoading(false);
      // Generate dynamic virtual account
      const randNum = `99${Math.floor(10000000 + Math.random() * 89999999)}`;
      setVirtualAccount({
        bankName: 'Providus Bank / Moniepoint MFB',
        accountNumber: randNum,
        accountName: `Bokkos AgroLink Escrow - ${escrowCode}`,
        expiresInMinutes: 59,
      });
    }
  }, [isOpen, escrowCode]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSimulateTransferSent = async () => {
    setLoading(true);
    setPaymentStep('processing');

    try {
      const res = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: `BKK-NIP-${Date.now()}`,
          channel: 'bank_transfer',
          amount,
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        setLoading(false);
        setPaymentStep('success');
        onPaymentSuccess({
          reference: data.data?.reference || `BKK-TRF-${Date.now()}`,
          channel: 'Bank Transfer (NIP Virtual Account)',
          amount,
          paidAt: new Date().toLocaleTimeString(),
          bankName: virtualAccount.bankName,
        });
      }, 1500);
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
        setPaymentStep('success');
        onPaymentSuccess({
          reference: `BKK-TRF-${Date.now()}`,
          channel: 'Bank Transfer (NIP Virtual Account)',
          amount,
          paidAt: new Date().toLocaleTimeString(),
          bankName: virtualAccount.bankName,
        });
      }, 1500);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaymentStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaymentStep('success');
      onPaymentSuccess({
        reference: `BKK-CRD-${Date.now()}`,
        channel: 'Debit Card (3D Secure Authenticated)',
        amount,
        paidAt: new Date().toLocaleTimeString(),
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-stone-200 shadow-2xl text-left">
        
        {/* Gateway Header */}
        <div className="bg-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-stone-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-700">
              Paystack / NIBSS Rail Sandbox
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-300">
              <ShieldCheck className="w-3 h-3" /> 256-Bit Escrow Vault
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight">Deposit Into Neutral Vault</h3>
          <p className="text-2xs text-stone-300 mt-0.5">
            {itemDescription} • {escrowCode}
          </p>

          <div className="mt-4 pt-3 border-t border-emerald-900 flex items-baseline justify-between">
            <span className="text-xs text-emerald-300 font-medium">Secured Amount:</span>
            <span className="text-2xl font-black text-white">₦{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {paymentStep === 'select' && (
            <>
              {/* Channel Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveChannel('transfer')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition ${
                    activeChannel === 'transfer'
                      ? 'bg-white text-emerald-900 shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-emerald-600" />
                  <span>Bank Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('card')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition ${
                    activeChannel === 'card'
                      ? 'bg-white text-emerald-900 shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
                  <span>Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChannel('ussd')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition ${
                    activeChannel === 'ussd'
                      ? 'bg-white text-emerald-900 shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 mb-1 text-amber-600" />
                  <span>USSD Rail</span>
                </button>
              </div>

              {/* 1. BANK TRANSFER VIEW */}
              {activeChannel === 'transfer' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-2xs text-emerald-900">
                      <span className="font-semibold uppercase tracking-wide">Dedicated Escrow Account</span>
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <Clock className="w-3 h-3" /> Expires in {virtualAccount.expiresInMinutes}m
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">Bank Name</div>
                          <div className="text-xs font-bold text-stone-900">{virtualAccount.bankName}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(virtualAccount.bankName, 'bank')}
                          className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1"
                        >
                          {copied === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied === 'bank' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">Account Number</div>
                          <div className="text-base font-black tracking-widest text-emerald-950">{virtualAccount.accountNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(virtualAccount.accountNumber, 'acc')}
                          className="bg-emerald-800 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-900 text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          {copied === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied === 'acc' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-[11px] text-stone-600">
                        <span className="font-semibold text-stone-900">Account Title: </span>
                        <span>{virtualAccount.accountName}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-2xs text-stone-500 leading-relaxed text-center">
                    Transfer exactly <strong>₦{amount.toLocaleString()}</strong> from any Nigerian bank mobile app or USSD. Funds are automatically detected and locked into escrow within seconds.
                  </p>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSimulateTransferSent}
                    disabled={loading}
                    className="w-full font-bold py-3 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                  >
                    I Have Transferred ₦{amount.toLocaleString()}
                  </Button>
                </div>
              )}

              {/* 2. DEBIT CARD VIEW */}
              {activeChannel === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-2xs text-stone-500 font-bold uppercase">Sandbox Test Cards</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4084 0840 1122 3344');
                        setCardExpiry('09/29');
                        setCardCvv('981');
                      }}
                      className="text-2xs text-blue-700 font-semibold hover:underline"
                    >
                      Fill Valid Visa Card
                    </button>
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-stone-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="5399 •••• •••• ••••"
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs font-bold text-stone-900 tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-2xs font-bold text-stone-700 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-bold text-stone-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-stone-700 block mb-1">4-Digit ATM PIN</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardPin}
                      onChange={(e) => setCardPin(e.target.value)}
                      placeholder="••••"
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs font-bold text-stone-900"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full font-bold py-3 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                  >
                    Pay ₦{amount.toLocaleString()} with Card
                  </Button>
                </form>
              )}

              {/* 3. USSD RAIL VIEW */}
              {activeChannel === 'ussd' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-2xs font-bold text-stone-700 block mb-1.5">Select Your Nigerian Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                    >
                      {Object.keys(USSD_CODES).map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-2">
                    <span className="text-2xs text-amber-900 font-bold uppercase tracking-wider block">
                      Dial on your registered SIM:
                    </span>
                    <div className="text-xl font-black font-mono tracking-wider text-stone-900 bg-white py-3 px-4 rounded-xl border border-amber-200 inline-block">
                      {USSD_CODES[selectedBank]}
                    </div>
                    <p className="text-2xs text-stone-600">
                      Authorize with your {selectedBank} USSD PIN to confirm the ₦{amount.toLocaleString()} escrow deposit.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSimulateTransferSent}
                    disabled={loading}
                    className="w-full font-bold py-3 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                  >
                    I Have Dialed & Authorized Payment
                  </Button>
                </div>
              )}
            </>
          )}

          {/* OTP STEP (FOR CARDS) */}
          {paymentStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Enter 3D-Secure Bank OTP</h4>
                <p className="text-2xs text-stone-500 mt-0.5">
                  A 6-digit one-time code was dispatched to your registered phone number.
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={cardOtp}
                  onChange={(e) => setCardOtp(e.target.value)}
                  placeholder="1 2 3 4 5 6"
                  className="w-full text-center text-xl font-mono font-black tracking-widest p-3 rounded-xl border border-stone-300 text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setCardOtp('123456')}
                  className="text-2xs text-blue-700 font-semibold hover:underline mt-2 inline-block"
                >
                  Click here to auto-fill test OTP (123456)
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full font-bold py-3 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Authorize ₦' + amount.toLocaleString()}
              </Button>
            </form>
          )}

          {/* PROCESSING STATE */}
          {paymentStep === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Verifying Settlement Switch...</h4>
                <p className="text-2xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Connecting to NIBSS Instant Payment clearinghouse to confirm credit to Bokkos AgroLink Escrow Vault.
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {paymentStep === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-700 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Transaction Cleared & Vault Locked
                </span>
                <h4 className="font-black text-stone-900 text-base mt-2">
                  ₦{amount.toLocaleString()} Locked in Escrow
                </h4>
                <p className="text-2xs text-stone-500 mt-1 max-w-xs mx-auto">
                  The funds are now safely held in neutral trust. The farmer will be notified to begin depot loading under contract {escrowCode}.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={onClose}
                className="w-full font-bold py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white"
              >
                View Active Milestone Tracker
              </Button>
            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-700" /> NDIC Protected Escrow
          </span>
          <span className="font-mono text-stone-400">Ref: BKK-GATEWAY-V2</span>
        </div>

      </div>
    </div>
  );
};
