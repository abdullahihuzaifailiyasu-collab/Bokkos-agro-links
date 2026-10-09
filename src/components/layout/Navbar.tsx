import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Button } from '../common/Button.tsx';
import { 
  Sprout, 
  ShoppingBag, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  UserCircle2,
  TrendingUp,
  MapPin,
  Truck,
  BookOpen,
  Users,
  Award,
  Lock,
  Phone,
  Share2
} from 'lucide-react';
import { ShareAppModal } from '../common/ShareAppModal.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => handleNav('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl text-stone-900 tracking-tight flex items-center gap-1.5">
                Bokkos <span className="text-emerald-700">AgroLink</span>
              </span>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">
                Plateau State Potato Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                currentView === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('marketplace')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>Marketplace</span>
            </button>

            <button
              onClick={() => handleNav('prices')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'prices'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>Prices</span>
            </button>

            <button
              onClick={() => handleNav('bokkos-map')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'bokkos-map'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ward Map</span>
            </button>

            <button
              onClick={() => handleNav('logistics')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'logistics'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Logistics</span>
            </button>

            <button
              onClick={() => handleNav('advisory')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'advisory'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Post-Harvest</span>
            </button>

            <button
              onClick={() => handleNav('cooperative-pools')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'cooperative-pools'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Co-op Pools</span>
            </button>

            <button
              onClick={() => handleNav('quality-passport')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'quality-passport'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>Passports</span>
            </button>

            <button
              onClick={() => handleNav('escrow-vault')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'escrow-vault'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Escrow</span>
            </button>

            <button
              onClick={() => handleNav('ussd-gateway')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                currentView === 'ussd-gateway'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>*384*24#</span>
            </button>

            {user && (
              <button
                onClick={() => {
                  if (user.role === 'FARMER') handleNav('farmer-dashboard');
                  else if (user.role === 'BUYER') handleNav('buyer-dashboard');
                  else if (user.role === 'ADMIN') handleNav('admin-overview');
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                  currentView.includes('dashboard') || currentView.includes('admin')
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/80'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>
                  {user.role === 'FARMER'
                    ? 'Farmer Portal'
                    : user.role === 'BUYER'
                    ? 'Buyer Hub'
                    : 'Admin'}
                </span>
              </button>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Share & Host Public Link Button */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition flex items-center gap-1.5 shadow-2xs"
              title="Share / Host Public Link"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Share Link</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <button
                  onClick={() => handleNav('notifications')}
                  className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown / Profile pill */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
                  {user.avatarUrl || user.farmerProfile?.avatarUrl || user.buyerProfile?.avatarUrl ? (
                    <img
                      src={user.avatarUrl || user.farmerProfile?.avatarUrl || user.buyerProfile?.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-600 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900 leading-tight">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase">
                      {user.role} {user.farmerProfile ? `• ${user.farmerProfile.wardLocation}` : ''}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="p-2 text-stone-500 hover:text-rose-600"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNav('register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => handleNav('notifications')}
                className="relative p-2 rounded-xl text-stone-600"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              setShareModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold bg-emerald-100/70 text-emerald-900 flex items-center gap-2 border border-emerald-200"
          >
            <Share2 className="w-4 h-4 text-emerald-800" />
            <span>Share & Host Public Link</span>
          </button>

          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
              currentView === 'home' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('marketplace')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'marketplace' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => handleNav('prices')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'prices' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Price Monitor</span>
          </button>

          <button
            onClick={() => handleNav('bokkos-map')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'bokkos-map' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Ward Spatial Map</span>
          </button>

          <button
            onClick={() => handleNav('logistics')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'logistics' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Haulage & Freight</span>
          </button>

          <button
            onClick={() => handleNav('advisory')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'advisory' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Post-Harvest Advisory</span>
          </button>

          <button
            onClick={() => handleNav('cooperative-pools')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'cooperative-pools' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Cooperative Aggregation Pools</span>
          </button>

          <button
            onClick={() => handleNav('quality-passport')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'quality-passport' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Quality Passports & Lab</span>
          </button>

          <button
            onClick={() => handleNav('escrow-vault')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'escrow-vault' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Smart Escrow Settlement Vault</span>
          </button>

          <button
            onClick={() => handleNav('ussd-gateway')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              currentView === 'ussd-gateway' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Rural USSD (*384*24#) & SMS</span>
          </button>

          <button
            onClick={() => handleNav('how-it-works')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
              currentView === 'how-it-works' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700'
            }`}
          >
            How It Works
          </button>

          {user ? (
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="px-3 py-1 flex items-center gap-3">
                {user.avatarUrl || user.farmerProfile?.avatarUrl || user.buyerProfile?.avatarUrl ? (
                  <img
                    src={user.avatarUrl || user.farmerProfile?.avatarUrl || user.buyerProfile?.avatarUrl}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-600 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-stone-500">Signed in as</p>
                  <p className="text-sm font-bold text-stone-900">{user.fullName}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">
                    Role: {user.role} {user.farmerProfile ? `• ${user.farmerProfile.wardLocation}` : ''}
                  </span>
                </div>
              </div>

              {user.role === 'FARMER' && (
                <>
                  <button
                    onClick={() => handleNav('farmer-dashboard')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-900 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                    <span>Farmer Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleNav('farmer-add-produce')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    <span>Add New Produce</span>
                  </button>
                  <button
                    onClick={() => handleNav('farmer-requests')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Incoming Buyer Requests</span>
                  </button>
                </>
              )}

              {user.role === 'BUYER' && (
                <>
                  <button
                    onClick={() => handleNav('buyer-dashboard')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-900 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                    <span>Buyer Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleNav('buyer-requests')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>My Purchase Requests</span>
                  </button>
                  <button
                    onClick={() => handleNav('buyer-purchases')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Completed Purchases</span>
                  </button>
                </>
              )}

              {user.role === 'ADMIN' && (
                <button
                  onClick={() => handleNav('admin-overview')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-50 text-blue-900 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Admin Console</span>
                </button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full mt-2 text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => handleNav('login')}
                className="w-full"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleNav('register')}
                className="w-full"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Share App Modal */}
      <ShareAppModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </header>
  );
};
