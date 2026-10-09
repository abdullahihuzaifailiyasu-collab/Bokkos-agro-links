import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/common/Button.tsx';
import { Input } from '../components/common/Input.tsx';
import { Sprout, ShoppingBag, ShieldCheck, ArrowRight, Camera, Upload, Trash2, User } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onNavigate: (view: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onNavigate }) => {
  const { login, register, error } = useAuth();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('FARMER');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Farmer specific fields
  const [wardLocation, setWardLocation] = useState('Butura');
  const [cooperativeName, setCooperativeName] = useState('');
  const [farmSizeHectares, setFarmSizeHectares] = useState<number>(2);

  // Buyer specific fields
  const [buyerType, setBuyerType] = useState<'WHOLESALER' | 'PROCESSOR' | 'RETAILER' | 'CATERER'>('WHOLESALER');
  const [companyName, setCompanyName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const bokkosWards = [
    'Bokkos Central',
    'Butura',
    'Daffo',
    'Manguna',
    'Richa',
    'Mushere Central',
    'Mushere West',
    'Kwatas',
    'Kamwai',
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setIsLoading(true);
      await login(identifier, password);
      onNavigate('home');
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 3MB for responsive base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      setFormError('Photo must be smaller than 3MB. Please select a lighter image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setIsLoading(true);
      const payload: any = {
        fullName,
        phone,
        email: email || undefined,
        password: regPassword,
        avatarUrl: avatarUrl || undefined,
        role,
      };

      if (role === 'FARMER') {
        payload.wardLocation = wardLocation;
        payload.cooperativeName = cooperativeName || undefined;
        payload.farmSizeHectares = Number(farmSizeHectares) || 1;
      } else {
        payload.buyerType = buyerType;
        payload.companyName = companyName || undefined;
        payload.deliveryAddress = deliveryAddress || undefined;
      }

      await register(payload);
      onNavigate('home');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-left">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-800 mb-2">
            <Sprout className="w-8 h-8 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {mode === 'login' ? 'Sign In to Bokkos AgroLink' : 'Create an Account'}
          </h2>
          <p className="text-xs text-stone-500">
            {mode === 'login'
              ? 'Access farmer listings, market requests, and transactions'
              : 'Join as a Bokkos potato farmer or verified commercial buyer'}
          </p>
        </div>

        {(formError || error) && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
            {formError || error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Phone Number or Email"
              placeholder="08031234567 or baba@bokkos.ng"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-stone-500">Or continue with Cloud Identity</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await (useAuth as any)().signInWithGoogle?.();
                  onNavigate('home');
                } catch (e: any) {
                  setFormError(e.message || 'Google sign-in error');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Account</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Don't have an account? Register here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-stone-700">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                    role === 'FARMER'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm">Potato Farmer</span>
                  <span className="text-[10px] text-stone-500 font-normal">Grow & sell harvest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                    role === 'BUYER'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <span className="text-sm">Produce Buyer</span>
                  <span className="text-[10px] text-stone-500 font-normal">Wholesaler/Caterer</span>
                </button>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-stone-700 block">
                Profile Picture / Farmer Photo
              </label>
              <div className="flex items-center gap-4 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Uploaded profile preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-stone-200 border-2 border-stone-300 flex items-center justify-center text-stone-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition"
                    title="Choose photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 text-xs font-semibold text-stone-700 hover:text-emerald-900 shadow-2xs transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{avatarUrl ? 'Change Picture' : 'Upload Photo'}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="p-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    JPG, PNG, or WEBP (Max 3MB). Builds trust with trading partners.
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Bitrus Mahanan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              placeholder="08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {role === 'FARMER' && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
                    Bokkos LGA Ward
                  </label>
                  <select
                    value={wardLocation}
                    onChange={(e) => setWardLocation(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 min-h-[44px]"
                  >
                    {bokkosWards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Cooperative / Farmer Association (Optional)"
                  placeholder="e.g. Butura Potato Growers Coop"
                  value={cooperativeName}
                  onChange={(e) => setCooperativeName(e.target.value)}
                />

                <Input
                  label="Approximate Farm Size (Hectares)"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={farmSizeHectares}
                  onChange={(e) => setFarmSizeHectares(Number(e.target.value))}
                />
              </>
            )}

            {role === 'BUYER' && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
                    Buyer Category
                  </label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 min-h-[44px]"
                  >
                    <option value="WHOLESALER">Bulk Wholesaler</option>
                    <option value="PROCESSOR">Food / Chips Processor</option>
                    <option value="RETAILER">Market Retailer</option>
                    <option value="CATERER">Catering / Hotel</option>
                  </select>
                </div>

                <Input
                  label="Business / Enterprise Name (Optional)"
                  placeholder="e.g. Plateau Fresh Foods Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />

                <Input
                  label="Destination Delivery City / Address"
                  placeholder="e.g. Terminus Market, Jos or Utako Market, Abuja"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </>
            )}

            <Input
              label="Create Password"
              type="password"
              placeholder="At least 6 characters"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Already registered? Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
