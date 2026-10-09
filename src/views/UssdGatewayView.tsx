import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Radio, 
  Send, 
  CheckCircle2, 
  TrendingUp, 
  RotateCcw, 
  HelpCircle, 
  Info, 
  WifiOff, 
  ShieldCheck,
  Building2,
  Users,
  Smartphone,
  Loader2
} from 'lucide-react';
import { Button } from '../components/common/Button.tsx';

interface UssdGatewayViewProps {
  onNavigate: (view: string, filter?: string) => void;
}

interface SmsMessage {
  id: string;
  sender: string;
  time: string;
  language: 'Hausa' | 'English';
  body: string;
}

export const UssdGatewayView: React.FC<UssdGatewayViewProps> = ({ onNavigate }) => {
  // USSD Session State Machine
  const [dialInput, setDialInput] = useState<string>('*384*24#');
  const [sessionActive, setSessionActive] = useState<boolean>(true);
  const [currentMenuStep, setCurrentMenuStep] = useState<string>('MAIN');
  const [userResponseInput, setUserResponseInput] = useState<string>('');
  
  // Dynamic session message on feature phone display
  const [sessionOutput, setSessionOutput] = useState<string>(
    `BOKKOS AGROLINK USSD (*384*24#)\nWelcome Baba Danladi!\n1. Bokkos Potato Prices\n2. Quick List Harvest\n3. Cooperative Pools\n4. Escrow & Bank Balance\n5. Hausa SMS Alerts`
  );

  // Simulated SMS Log
  const [smsLog, setSmsLog] = useState<SmsMessage[]>([
    {
      id: 'sms_001',
      sender: 'AgroLink',
      time: '10:45 AM',
      language: 'Hausa',
      body: 'AgroLink: Alhaji Sanusi ya ajiye N21,300,000 a Escrow domin kudin dankalinku na Butura. Motar lodi (Mercedes 7-Ton) tana kan hanya.',
    },
    {
      id: 'sms_002',
      sender: 'AgroLink',
      time: '08:30 AM',
      language: 'English',
      body: 'Bokkos AgroLink: Today farmgate price for Nicola 50kg bag is N34,000. Lagos Mile 12 price is N56,000. Dial *384*24# to list bags.',
    },
    {
      id: 'sms_003',
      sender: 'AgroLink-PADP',
      time: 'Yesterday',
      language: 'Hausa',
      body: 'PADP Bokkos: A kula da cutar Late Blight (Bakin daji) a gonakin Daffo da Manguna. A fesa fungisayd kafin girbi.',
    },
  ]);

  // Handle USSD Send Response
  const handleUssdSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = userResponseInput.trim();
    setUserResponseInput('');

    if (!sessionActive) {
      if (input === '*384*24#' || dialInput === '*384*24#') {
        setSessionActive(true);
        setCurrentMenuStep('MAIN');
        setSessionOutput(
          `BOKKOS AGROLINK USSD (*384*24#)\nWelcome Baba Danladi!\n1. Bokkos Potato Prices\n2. Quick List Harvest\n3. Cooperative Pools\n4. Escrow & Bank Balance\n5. Hausa SMS Alerts`
        );
      } else {
        setSessionOutput('Invalid USSD code. Dial *384*24# for Bokkos AgroLink.');
      }
      return;
    }

    // Navigation Tree
    if (currentMenuStep === 'MAIN') {
      if (input === '1') {
        setCurrentMenuStep('PRICES');
        setSessionOutput(
          `TODAY'S BOKKOS PRICES (50kg):\n- Nicola: N34,000\n- Marabel: N32,000\n- Caruso: N38,000\n- Lady Rosetta: N39,000\nLagos Spread: +N22,000/bag\n0. Back to Main`
        );
      } else if (input === '2') {
        setCurrentMenuStep('QUICK_LIST');
        setSessionOutput(
          `QUICK LIST PRODUCE:\nEnter bags to sell & variety:\nExample: "50 Nicola 34000"\nOr enter 0 to return`
        );
      } else if (input === '3') {
        setCurrentMenuStep('POOLS');
        setSessionOutput(
          `ACTIVE COOP POOLS:\n1. Butura Nicola (460/600)\n2. Daffo Caruso (340/500)\n3. Mushere Seed (210/250)\nReply with 1, 2, or 3 to pledge 20 bags`
        );
      } else if (input === '4') {
        setCurrentMenuStep('ESCROW');
        setSessionOutput(
          `ESCROW & BANK VAULT:\n- Pending Payout: N2,840,000\n- Bank: Zenith Bank\n- Acc: 1014889201 (Danladi)\nStatus: Truck in transit\n0. Main Menu`
        );
      } else if (input === '5') {
        setCurrentMenuStep('HAUSA_ALERT');
        setSessionOutput(
          `SAKON KARIYA (HAUSA):\nKafin a cire dankali, a yanke ganyaye kwanaki 14 kafin girbi domin fatar dankalin ta yi kwari.\n0. Babban Menu`
        );
      } else {
        setSessionOutput('Invalid selection.\nReply 1-5 or 00 to exit.');
      }
    } else if (currentMenuStep === 'PRICES') {
      if (input === '0') {
        returnToMain();
      }
    } else if (currentMenuStep === 'QUICK_LIST') {
      if (input === '0') {
        returnToMain();
      } else {
        setSessionOutput(
          `SUCCESS: Listed for Bokkos Marketplace!\nBuyers notified via SMS.\nRef: LST-${Math.floor(1000 + Math.random() * 9000)}\n0. Main Menu`
        );
        setCurrentMenuStep('CONFIRM');
        addSmsMessage('AgroLink: An saka dankalinku a kasuwar Bokkos AgroLink. Idan mai saye ya nemi siye za a aiko muku da sakon SMS.');
      }
    } else if (currentMenuStep === 'POOLS') {
      if (input === '1' || input === '2' || input === '3') {
        setSessionOutput(
          `SUCCESS: Pledged 20 bags into Consortium Pool!\nEscrow payout will credit Zenith Bank upon delivery.\n0. Main Menu`
        );
        setCurrentMenuStep('CONFIRM');
        addSmsMessage('AgroLink: An karbi alkawarin buhuna 20 a rukunin Butura. PADP zai duba dankalin a dakin ajiya na Butura Gida.');
      } else if (input === '0') {
        returnToMain();
      }
    } else if (currentMenuStep === 'ESCROW' || currentMenuStep === 'HAUSA_ALERT' || currentMenuStep === 'CONFIRM') {
      returnToMain();
    }
  };

  const returnToMain = () => {
    setCurrentMenuStep('MAIN');
    setSessionOutput(
      `BOKKOS AGROLINK USSD (*384*24#)\nWelcome Baba Danladi!\n1. Bokkos Potato Prices\n2. Quick List Harvest\n3. Cooperative Pools\n4. Escrow & Bank Balance\n5. Hausa SMS Alerts`
    );
  };

  // SMS Dispatch State
  const [targetPhone, setTargetPhone] = useState<string>('08031234567');
  const [customSmsBody, setCustomSmsBody] = useState<string>('');
  const [smsSending, setSmsSending] = useState<boolean>(false);
  const [smsStatusBanner, setSmsStatusBanner] = useState<string | null>(null);

  const triggerLiveSms = async (bodyText: string, templateType?: string) => {
    setSmsSending(true);
    setSmsStatusBanner(null);

    try {
      const res = await fetch(templateType ? '/api/sms/template-alert' : '/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          templateType
            ? { templateType, phone: targetPhone }
            : { to: targetPhone, message: bodyText, senderId: 'AgroLink' }
        ),
      });
      const data = await res.json();
      
      const newMsg: SmsMessage = {
        id: `sms_${Date.now()}`,
        sender: 'AgroLink',
        time: 'Just now',
        language: bodyText.includes('dankali') || bodyText.includes('Kudi') ? 'Hausa' : 'English',
        body: data.data?.message || bodyText,
      };
      setSmsLog((prev) => [newMsg, ...prev]);
      setSmsStatusBanner(`SMS successfully routed to ${data.data?.normalizedTo || targetPhone} via ${data.data?.gateway || 'Telco Gateway'} (${data.data?.telcoDetected || 'Nigerian Telco'}).`);
      setTimeout(() => setSmsStatusBanner(null), 4500);
    } catch (err) {
      addSmsMessage(bodyText);
      setSmsStatusBanner(`SMS dispatched to ${targetPhone}.`);
      setTimeout(() => setSmsStatusBanner(null), 3000);
    } finally {
      setSmsSending(false);
    }
  };

  const addSmsMessage = (bodyText: string) => {
    const newMsg: SmsMessage = {
      id: `sms_${Date.now()}`,
      sender: 'AgroLink',
      time: 'Just now',
      language: 'Hausa',
      body: bodyText,
    };
    setSmsLog([newMsg, ...smsLog]);
  };

  const handleKeypadPress = (val: string) => {
    setUserResponseInput((prev) => prev + val);
  };

  const handleClear = () => {
    setUserResponseInput('');
  };

  const handleEndCall = () => {
    setSessionActive(false);
    setSessionOutput('USSD Session Terminated.\nDial *384*24# to reconnect.');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-left relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline-Ready Rural Smallholder Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Rural USSD (*384*24#) & SMS Gateway
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Designed for farmers in remote Bokkos wards (Sha, Richa, Kamwai, Kunet) who rely on basic feature phones (Nokia/itel) with zero internet data. Farmers dial *384*24# to trade, check daily farmgate prices, pledge to cooperative pools, and verify escrow bank payments.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setSessionActive(true);
                  returnToMain();
                }}
                leftIcon={<Phone className="w-4 h-4" />}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold"
              >
                Dial *384*24# (Start Session)
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('cooperative-pools')}
                leftIcon={<Users className="w-4 h-4 text-emerald-300" />}
                className="border-stone-700 text-white hover:bg-stone-800"
              >
                Cooperative Pools
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('escrow-vault')}
                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
                className="border-stone-700 text-white hover:bg-stone-800"
              >
                Escrow Vault
              </Button>
            </div>
          </div>
        </div>

        {/* Interactive Feature Phone + SMS Gateway Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Column 1: Nokia / itel Feature Phone Hardware Simulator (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-stone-800 p-5 rounded-[40px] shadow-2xl border-4 border-stone-700 flex flex-col items-center space-y-4">
              
              {/* Phone Speaker Grill */}
              <div className="w-16 h-1.5 bg-stone-600 rounded-full mt-1" />

              {/* Monochrome / Emerald Backlit Screen */}
              <div className="w-full bg-[#9bb084] border-4 border-stone-900 rounded-2xl p-4 font-mono shadow-inner min-h-[220px] flex flex-col justify-between text-[#1c2e17]">
                
                {/* Top Carrier Bar */}
                <div className="flex justify-between items-center text-3xs border-b border-[#7d9468] pb-1 font-bold">
                  <span>📶 MTN-NG (Bokkos)</span>
                  <span>10:45 AM 🔋</span>
                </div>

                {/* Main USSD Content */}
                <div className="my-auto py-2 text-2xs font-semibold whitespace-pre-line leading-relaxed">
                  {sessionOutput}
                </div>

                {/* Input Prompt */}
                <div className="border-t border-[#7d9468] pt-1 flex items-center justify-between text-2xs">
                  <span className="font-bold">Reply:</span>
                  <span className="font-black bg-[#8da376] px-2 py-0.5 rounded text-xs min-w-[30px] text-right">
                    {userResponseInput || '_'}
                  </span>
                </div>
              </div>

              {/* Physical Keypad */}
              <div className="w-full space-y-2 pt-2">
                {/* Action Buttons: Call & End */}
                <div className="grid grid-cols-2 gap-3 px-2">
                  <button
                    onClick={() => handleUssdSubmit()}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow transition flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>SEND</span>
                  </button>
                  <button
                    onClick={handleEndCall}
                    className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow transition flex items-center justify-center gap-1"
                  >
                    <span>END</span>
                  </button>
                </div>

                {/* Numeric Grid (3x4) */}
                <div className="grid grid-cols-3 gap-2 px-2 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      className="py-3 bg-stone-700 hover:bg-stone-600 active:bg-stone-900 text-stone-200 font-black text-sm rounded-xl border border-stone-600 shadow-sm transition flex flex-col items-center justify-center"
                    >
                      <span>{key}</span>
                    </button>
                  ))}
                </div>

                {/* Clear / Reset Helper */}
                <div className="px-2 pt-1 flex justify-between">
                  <button
                    onClick={handleClear}
                    className="text-2xs text-stone-400 hover:text-white py-1 px-3 bg-stone-700/50 rounded-lg"
                  >
                    Clear Input
                  </button>
                  <button
                    onClick={returnToMain}
                    className="text-2xs text-emerald-400 hover:text-emerald-300 py-1 px-3 bg-stone-700/50 rounded-lg"
                  >
                    Reset *384*24#
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Column 2: Simulated SMS Center & Rural Broadcast Log (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SMS Dispatch Trigger Controls */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    Automated SMS Notification Gateway
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Live dispatch channel delivering English and Hausa potato market intelligence to rural phones via Termii / Africa's Talking.
                  </p>
                </div>
                <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  GSM Active (MTN / Airtel / Glo)
                </span>
              </div>

              {smsStatusBanner && (
                <div className="p-3 bg-emerald-100/90 text-emerald-900 rounded-xl border border-emerald-300 text-xs font-semibold animate-in fade-in">
                  ✓ {smsStatusBanner}
                </div>
              )}

              {/* Live Dispatch Form */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-1/3">
                    <label className="text-2xs font-bold uppercase text-stone-600 block mb-1">
                      Recipient Nigerian Phone
                    </label>
                    <div className="relative">
                      <Smartphone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        placeholder="08031234567"
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 text-stone-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-2/3">
                    <label className="text-2xs font-bold uppercase text-stone-600 block mb-1">
                      Custom Dispatch Text (Hausa / English)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSmsBody}
                        onChange={(e) => setCustomSmsBody(e.target.value)}
                        placeholder="e.g. Farashin dankali yau ya tashi zuwa N36,000..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 bg-white"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={smsSending || !customSmsBody.trim()}
                        onClick={() => {
                          triggerLiveSms(customSmsBody);
                          setCustomSmsBody('');
                        }}
                        className="shrink-0 font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        {smsSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send SMS'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Template Alert Buttons */}
              <div className="space-y-1.5">
                <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider block">
                  Quick Broadcast Triggers
                </span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={smsSending}
                    onClick={() =>
                      triggerLiveSms(
                        'AgroLink: Farashin dankali yau a kasuwar Bokkos: Nicola N34,000, Caruso N38,000. Lagos Mile 12 N56,000. Danna *384*24# domin siyarwa.',
                        'PRICE_ALERT_HAUSA'
                      )
                    }
                    className="text-xs font-semibold"
                  >
                    Trigger Hausa Price SMS
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={smsSending}
                    onClick={() =>
                      triggerLiveSms(
                        'AgroLink Escrow: N3,500,000 locked into neutral vault for your Lady Rosetta harvest lot. Dispatch inspection scheduled.',
                        'ESCROW_FUNDED_ENGLISH'
                      )
                    }
                    className="text-xs font-semibold"
                  >
                    Trigger Escrow Funded SMS
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={smsSending}
                    onClick={() =>
                      triggerLiveSms(
                        'AgroLink: Motar lodi (Trailer 30-Ton) ta isa dakin ajiya na Butura Gida. An fara loda buhunan consortium.',
                        'DISPATCH_ARRIVED_HAUSA'
                      )
                    }
                    className="text-xs font-semibold"
                  >
                    Trigger Dispatch Arrival SMS
                  </Button>
                </div>
              </div>
            </div>

            {/* Received SMS Feed */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Farmer Received SMS Inbox ({smsLog.length})
              </h4>

              <div className="space-y-3">
                {smsLog.map((sms) => (
                  <div 
                    key={sms.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 hover:bg-stone-50 transition"
                  >
                    <div className="flex items-center justify-between text-2xs">
                      <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                        FROM: {sms.sender}
                      </span>
                      <div className="flex items-center gap-2 text-stone-400">
                        <span className="font-semibold text-stone-600">{sms.language}</span>
                        <span>•</span>
                        <span>{sms.time}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed font-medium">
                      "{sms.body}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Context Card */}
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2 text-emerald-950">
              <span className="font-bold block text-emerald-900 uppercase text-2xs">
                Agronomic Value of Low-Bandwidth Channels
              </span>
              <p className="text-emerald-900/90 leading-relaxed">
                In Bokkos LGA, more than 58% of potato farm families reside in mountainous or rural wards where 4G cellular broadband is intermittent. By marrying an interactive web application with a low-bandwidth USSD (*384*24#) protocol and bilingual SMS broadcast, Bokkos AgroLink provides universal value-chain inclusion without leaving behind non-smartphone producers.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
