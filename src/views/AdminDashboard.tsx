import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { StatusBadge, Badge } from '../components/common/Badge.tsx';
import { Button } from '../components/common/Button.tsx';
import { Modal } from '../components/common/Feedback.tsx';
import { ProduceListing, User, ActivityLog } from '../types/index.ts';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  Ban, 
  RotateCcw,
  Search,
  Filter,
  FileSpreadsheet,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);

  // User search & filters
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Moderation state
  const [moderateListingId, setModerateListingId] = useState<string | null>(null);
  const [moderateStatus, setModerateStatus] = useState<string>('AVAILABLE');
  const [moderateReason, setModerateReason] = useState<string>('');
  const [moderating, setModerating] = useState(false);

  // User action state
  const [statusUserModal, setStatusUserModal] = useState<User | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, listingsRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getProduceListings(),
        api.getAdminActivityLogs(),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (listingsRes.success) setListings(listingsRes.listings);
      if (logsRes.success) setActivityLogs(logsRes.logs);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userToUpdate: User) => {
    const nextStatus = userToUpdate.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setStatusUpdating(true);
      const res = await api.updateAdminUserStatus(userToUpdate.id, nextStatus);
      if (res.success) {
        setStatusUserModal(null);
        await loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveListingModeration = async () => {
    if (!moderateListingId) return;
    try {
      setModerating(true);
      const res = await api.moderateListing(moderateListingId, moderateStatus, moderateReason);
      if (res.success) {
        setModerateListingId(null);
        setModerateReason('');
        await loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to moderate listing');
    } finally {
      setModerating(false);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV string from listings and stats
    const headers = ['Listing ID', 'Farmer Name', 'Farmer Ward', 'Variety', 'Grade', 'Unit Standard', 'Available Bags', 'Price Per Bag (NGN)', 'Status', 'Harvest Date'];
    const rows = listings.map((l) => [
      l.id,
      `"${l.farmerName || 'Bokkos Farmer'}"`,
      `"${l.farmerWard || 'Butura'}"`,
      l.variety,
      l.grade,
      `"${l.unit || l.bagType || '100kg Bag'}"`,
      l.availableQuantity ?? l.quantityBags ?? 0,
      l.pricePerUnit ?? l.pricePerBag ?? 0,
      l.status,
      l.harvestDate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bokkos_agrolink_produce_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (!userQuery.trim()) return true;
    const q = userQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.phoneNumber?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.farmerProfile?.wardLocation?.toLowerCase().includes(q) ||
      u.buyerProfile?.operatingCity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase">
              Platform Administration
            </span>
            <span className="text-xs text-stone-500">
              Bokkos LGA Potato Value Chain Monitor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
            System Overview & Registry Governance
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Monitoring trade volume, farmer participation, produce moderation, and audit activities across Bokkos LGA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4 text-emerald-700" />}
          >
            Export Trade CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Marketplace Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Produce Moderation ({listings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Logs ({activityLogs.length})</span>
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block mb-1">
                Registered Bokkos Farmers
              </span>
              <div className="text-3xl font-black text-stone-900">
                {stats?.farmersCount || users.filter((u) => u.role === 'FARMER').length}
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                Verified growers across 6 wards
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block mb-1">
                Active Buyers Registered
              </span>
              <div className="text-3xl font-black text-stone-900">
                {stats?.buyersCount || users.filter((u) => u.role === 'BUYER').length}
              </div>
              <span className="text-xs text-amber-700 font-medium">
                Wholesalers & Processors
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block mb-1">
                Potato Batches Listed
              </span>
              <div className="text-3xl font-black text-stone-900">
                {stats?.totalProduceListings || listings.length}
              </div>
              <span className="text-xs text-stone-500">
                {listings.filter((l) => l.status === 'AVAILABLE').length} available for trade
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-semibold text-stone-500 block mb-1">
                Gross Trade Volume
              </span>
              <div className="text-3xl font-black text-emerald-700">
                ₦{(stats?.totalVolumeNaira || stats?.totalTransactionValue || 0).toLocaleString()}
              </div>
              <span className="text-xs text-stone-500">
                {stats?.totalTransactionsCount || stats?.completedTransactionsCount || 0} completed dispatches
              </span>
            </div>
          </div>

          {/* Research Context Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Academic Research Demonstration Context
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Bokkos Local Government Area Agricultural Market Linkage
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              This system serves as an applied Computer Science artifact addressing market fragmentation in
              Plateau State. By shifting from informal roadside bargaining to verifiable online listings,
              Bokkos farmers capture up to 30% higher farm-gate price realization.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-stone-200">
                Wards: Butura, Daffo, Manguna, Richa, Mushere, Bokkos Central
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">
                Major Varieties: Nicola, Marabel, Caruso, Lady Rosetta, Bertita
              </span>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* Users Table */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search user, phone, ward..."
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 outline-none focus:border-emerald-600 w-52 sm:w-64"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs rounded-xl border border-stone-200 px-3 py-1.5 outline-none text-stone-700 bg-stone-50"
              >
                <option value="ALL">All Roles</option>
                <option value="FARMER">Farmers</option>
                <option value="BUYER">Buyers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <span className="text-xs text-stone-500">{filteredUsers.length} accounts found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Location / Ward</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4 font-bold text-stone-900">
                      <div className="flex items-center gap-2.5">
                        {u.avatarUrl || u.farmerProfile?.avatarUrl || u.buyerProfile?.avatarUrl ? (
                          <img
                            src={u.avatarUrl || u.farmerProfile?.avatarUrl || u.buyerProfile?.avatarUrl}
                            alt={u.fullName}
                            className="w-7 h-7 rounded-full object-cover border border-stone-300 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-bold text-xs flex items-center justify-center border border-stone-200 shrink-0">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.role === 'FARMER'
                            ? 'green'
                            : u.role === 'BUYER'
                            ? 'amber'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{u.phoneNumber || (u as any).phone}</td>
                    <td className="py-3 px-4">
                      {u.farmerProfile?.wardLocation
                        ? `${u.farmerProfile.wardLocation} Ward`
                        : u.buyerProfile?.operatingCity
                        ? u.buyerProfile.operatingCity
                        : 'Plateau / HQ'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' ? (
                        <button
                          onClick={() => setStatusUserModal(u)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                            u.status === 'SUSPENDED'
                              ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                              : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'listings' ? (
        /* Produce Listings Moderation Table */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">All Registered Potato Batches</h3>
              <p className="text-xs text-stone-500">Audit listings, regulate stock validity, and address quality complaints</p>
            </div>
            <span className="text-xs text-stone-500">{listings.length} batches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Variety & Grade</th>
                  <th className="py-3 px-4">Farmer / Producer</th>
                  <th className="py-3 px-4">Ward Location</th>
                  <th className="py-3 px-4">Available Bags</th>
                  <th className="py-3 px-4">Farm Gate Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{l.variety}</div>
                      <div className="text-[11px] text-stone-500">{l.grade.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{l.farmerName || 'Registered Farmer'}</td>
                    <td className="py-3 px-4">{l.farmerWard || 'Butura'} Ward</td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {l.availableQuantity ?? l.quantityBags ?? 0} bags
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-bold">
                      ₦{(l.pricePerUnit ?? l.pricePerBag ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setModerateListingId(l.id);
                          setModerateStatus(l.status);
                        }}
                        className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline"
                      >
                        Edit Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Activity Audit Logs */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">System Activity Audit Trail</h3>
              <p className="text-xs text-stone-500">Immutable log of orders placed, acceptances, and account actions</p>
            </div>
            <span className="text-xs text-stone-500">{activityLogs.length} events</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-stone-500">No activity logged yet.</div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{log.action.replace('_', ' ')}</span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600 font-mono">
                        {log.actorRole}
                      </span>
                    </div>
                    <p className="text-stone-600 text-xs">{log.details}</p>
                  </div>
                  <div className="text-[11px] text-stone-400 sm:text-right shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Status Modal */}
      <Modal
        isOpen={statusUserModal !== null}
        onClose={() => setStatusUserModal(null)}
        size="sm"
      >
        <div className="text-left space-y-4">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 w-fit">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            {statusUserModal?.status === 'ACTIVE' ? 'Suspend User Account?' : 'Activate User Account?'}
          </h3>
          <p className="text-xs text-stone-600">
            Are you sure you want to {statusUserModal?.status === 'ACTIVE' ? 'suspend' : 'activate'}{' '}
            <strong>{statusUserModal?.fullName}</strong> ({statusUserModal?.role})?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusUserModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => statusUserModal && handleToggleUserStatus(statusUserModal)}
              isLoading={statusUpdating}
              className={statusUserModal?.status === 'ACTIVE' ? 'bg-rose-600 hover:bg-rose-700 border-rose-600' : ''}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Moderate Listing Modal */}
      <Modal
        isOpen={moderateListingId !== null}
        onClose={() => setModerateListingId(null)}
        size="md"
      >
        <div className="text-left space-y-4">
          <h3 className="text-lg font-bold text-stone-900">
            Moderate Potato Produce Listing
          </h3>
          <p className="text-xs text-stone-500">
            Change the visibility and commercial status of this batch in the marketplace.
          </p>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
              Select New Status
            </label>
            <select
              value={moderateStatus}
              onChange={(e) => setModerateStatus(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-600"
            >
              <option value="AVAILABLE">AVAILABLE (Active in Market)</option>
              <option value="RESERVED">RESERVED (Temporarily on hold)</option>
              <option value="SOLD_OUT">SOLD_OUT (No longer available)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-stone-700 block mb-1">
              Administrative Reason / Note
            </label>
            <textarea
              rows={2}
              value={moderateReason}
              onChange={(e) => setModerateReason(e.target.value)}
              placeholder="e.g. Batch quantity verified or inspected for compliance."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModerateListingId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveListingModeration}
              isLoading={moderating}
            >
              Save Moderation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
