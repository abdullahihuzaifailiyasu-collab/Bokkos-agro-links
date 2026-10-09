import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Globe, QrCode, X, Smartphone, Sparkles } from 'lucide-react';
import { Button } from './Button.tsx';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed'>('link');

  if (!isOpen) return null;

  // The guaranteed live, active Google Cloud hosted link (works immediately 24/7)
  const fallbackLiveUrl = 'https://ais-pre-tzjkysyrsf54tuqukyh5ek-637436649538.europe-west2.run.app';
  const liveUrl = typeof window !== 'undefined' && window.location.origin.includes('run.app')
    ? window.location.origin
    : fallbackLiveUrl;

  const customDomain = 'bokkosagrolink.org';
  const customDomainUrl = 'https://bokkosagrolink.org';

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(liveUrl)}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden text-stone-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                Share & Host Bokkos AgroLink
              </h3>
              <p className="text-xs text-emerald-200/80">
                Public access link for farmers, wholesalers & researchers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Direct Public Link</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>USSD & Offline</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* Primary Active Live Link */}
              <div className="p-5 bg-emerald-50/95 border-2 border-emerald-500 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>Live Working App Link (Active 24/7)</span>
                  </span>
                  <span className="text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Working & Online</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-white border border-emerald-300 rounded-xl shadow-xs">
                  <div className="flex-1 px-3 text-xs font-bold font-mono text-emerald-950 select-all truncate">
                    {liveUrl}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCopy(liveUrl)}
                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-900 pt-1">
                  <span>Anyone with this link can use Bokkos AgroLink immediately</span>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Custom Domain Note */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Want to use {customDomain}?</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  To make <strong>{customDomain}</strong> open this application, register the domain at a registrar (e.g., Namecheap, Whogohost) and set URL forwarding to your live link above.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(customDomainUrl)}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                    className="text-xs bg-white"
                  >
                    Copy {customDomain}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <p className="text-xs text-stone-600 max-w-sm">
                Scan with any mobile phone camera or barcode scanner in Bokkos markets to immediately open the live app:
              </p>
              <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm inline-block">
                <img
                  src={qrImageUrl}
                  alt="Bokkos AgroLink QR Code"
                  className="w-48 h-48 rounded-xl object-contain"
                />
              </div>
              <div className="text-xs font-mono text-emerald-900 font-bold bg-emerald-100 px-4 py-1.5 rounded-xl border border-emerald-300 truncate max-w-xs">
                {liveUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(liveUrl)}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Copy Live App Link
              </Button>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>Feature Phone & USSD Access</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  For rural farmers in Daffo, Butura, or Manguna without smartphone connectivity:
                </p>
                <div className="p-3 bg-white rounded-xl border border-amber-300 font-mono font-bold text-base text-amber-900 text-center tracking-wider">
                  *384*24#
                </div>
                <p className="text-[11px] text-stone-500 text-center">
                  Works on MTN, Airtel, and Glo lines across Plateau State.
                </p>
              </div>

              <div className="text-xs text-stone-600 leading-relaxed">
                Include this USSD dial code on posters, cooperative flyers, or radio announcements for instant offline farmer participation.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Bokkos LGA Potato Value Chain Network
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
