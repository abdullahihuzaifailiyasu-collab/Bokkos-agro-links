/**
 * API Client for Bokkos AgroLink
 * Provides type-safe communication with the backend Express API
 */

import {
  User,
  ProduceListing,
  PurchaseRequest,
  ProduceRequest,
  Transaction,
  Notification,
  AdminStats,
  ActivityLog,
  UserRole,
} from '../types/index.ts';

const TOKEN_KEY = 'bokkos_agrolink_token';

// Standalone request helper to guarantee proper generic type inference across TypeScript configurations
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Base HTTP Request
  request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(endpoint, options);
  },

  // --- Auth Endpoints ---
  async register(payload: {
    phoneNumber?: string;
    phone?: string;
    email?: string;
    password: string;
    fullName: string;
    avatarUrl?: string;
    role: UserRole;
    wardLocation?: string;
    specificLocation?: string;
    farmSizeHectares?: number;
    cooperativeName?: string;
    businessName?: string;
    businessType?: string;
    buyerType?: string;
    operatingCity?: string;
    deliveryAddress?: string;
  }): Promise<{ success: boolean; token: string; user: User; message: string }> {
    const body: any = {
      ...payload,
      phoneNumber: payload.phoneNumber || payload.phone || '',
      businessType: payload.businessType || payload.buyerType,
      operatingCity: payload.operatingCity || payload.deliveryAddress || 'Bokkos',
    };
    const res = await apiRequest<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    if (res.token) this.setToken(res.token);
    return res;
  },

  async login(payload: {
    identifier: string;
    password: string;
  }): Promise<{ success: boolean; token: string; user: User; message: string }> {
    const res = await apiRequest<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    if (res.token) this.setToken(res.token);
    return res;
  },

  async demoLogin(demoType: 'farmer1' | 'farmer2' | 'buyer1' | 'buyer2' | 'admin'): Promise<{
    success: boolean;
    token: string;
    user: User;
    message: string;
  }> {
    const res = await apiRequest<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/demo-login',
      {
        method: 'POST',
        body: JSON.stringify({ demoType }),
      }
    );
    if (res.token) this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return apiRequest<{ success: boolean; user: User }>('/api/auth/me');
  },

  async updateProfile(payload: {
    fullName?: string;
    email?: string;
    farmerProfile?: any;
    buyerProfile?: any;
  }): Promise<{ success: boolean; user: User; message: string }> {
    return apiRequest<{ success: boolean; user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  logout(): void {
    this.clearToken();
  },

  // --- Produce Endpoints ---
  async getProduceListings(params?: {
    q?: string;
    variety?: string;
    grade?: string;
    ward?: string;
    farmerWard?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    sortBy?: string;
    farmerId?: string;
    limit?: number;
  }): Promise<{ success: boolean; count: number; listings: ProduceListing[]; produce: ProduceListing[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (key === 'farmerWard' && val) {
          query.append('ward', String(val));
        } else if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{ success: boolean; count: number; listings: ProduceListing[] }>(
      `/api/produce${qs}`
    );
    const normalizedListings = (res.listings || []).map((l: any) => ({
      ...l,
      quantityBags: l.availableQuantity ?? l.quantityBags ?? 0,
      pricePerBag: l.pricePerUnit ?? l.pricePerBag ?? 0,
      bagType: l.unit ?? l.bagType ?? '100kg Bag',
    }));
    return {
      success: res.success,
      count: res.count,
      listings: normalizedListings,
      produce: normalizedListings,
    };
  },

  async getMyProduce(): Promise<{ success: boolean; count: number; listings: ProduceListing[]; produce: ProduceListing[] }> {
    return this.getProduceListings();
  },

  async getProduceById(id: string): Promise<{ success: boolean; listing: ProduceListing }> {
    return apiRequest<{ success: boolean; listing: ProduceListing }>(`/api/produce/${id}`);
  },

  async createProduceListing(payload: any): Promise<{
    success: boolean;
    listing: ProduceListing;
    message: string;
  }> {
    const formattedPayload = {
      variety: payload.variety,
      grade: payload.grade,
      availableQuantity: Number(payload.quantityBags ?? payload.availableQuantity ?? 10),
      minimumOrderQuantity: Number(payload.minimumOrderQuantity ?? 1),
      unit: payload.bagType ?? payload.unit ?? '100kg Bag',
      pricePerUnit: Number(payload.pricePerBag ?? payload.pricePerUnit ?? 40000),
      farmLocation: payload.farmLocation ?? 'Bokkos',
      harvestDate: payload.harvestDate ?? new Date().toISOString().split('T')[0],
      availabilityPeriod: payload.availabilityPeriod ?? 'Immediate pickup',
      description: payload.description ?? '',
    };
    return apiRequest<{ success: boolean; listing: ProduceListing; message: string }>(
      '/api/produce',
      {
        method: 'POST',
        body: JSON.stringify(formattedPayload),
      }
    );
  },

  async updateProduce(id: string, payload: any): Promise<{ success: boolean; listing: ProduceListing; message: string }> {
    return this.updateProduceListing(id, payload);
  },

  async updateProduceListing(
    id: string,
    payload: any
  ): Promise<{ success: boolean; listing: ProduceListing; message: string }> {
    const formattedPayload: any = { ...payload };
    if (payload.quantityBags !== undefined) formattedPayload.availableQuantity = Number(payload.quantityBags);
    if (payload.pricePerBag !== undefined) formattedPayload.pricePerUnit = Number(payload.pricePerBag);
    if (payload.bagType !== undefined) formattedPayload.unit = payload.bagType;
    return apiRequest<{ success: boolean; listing: ProduceListing; message: string }>(
      `/api/produce/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(formattedPayload),
      }
    );
  },

  async deleteProduceListing(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/api/produce/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Purchase Requests ---
  async createPurchaseRequest(payload: {
    listingId?: string;
    produceId?: string;
    requestedQuantity?: number;
    quantityBags?: number;
    note?: string;
    notes?: string;
    proposedPickupDate?: string;
  }): Promise<{ success: boolean; request: PurchaseRequest; message: string }> {
    const formattedPayload = {
      listingId: payload.listingId || payload.produceId || '',
      requestedQuantity: Number(payload.requestedQuantity ?? payload.quantityBags ?? 1),
      note: payload.note || payload.notes || '',
    };
    return apiRequest<{ success: boolean; request: PurchaseRequest; message: string }>(
      '/api/requests',
      {
        method: 'POST',
        body: JSON.stringify(formattedPayload),
      }
    );
  },

  async createProduceRequest(payload: any): Promise<{ success: boolean; request: PurchaseRequest; message: string }> {
    return this.createPurchaseRequest(payload);
  },

  async getPurchaseRequests(params?: {
    status?: string;
  }): Promise<{ success: boolean; count: number; requests: PurchaseRequest[] }> {
    const qs = params?.status ? `?status=${params.status}` : '';
    const res = await apiRequest<{ success: boolean; count: number; requests: PurchaseRequest[] }>(
      `/api/requests${qs}`
    );
    const normalized = (res.requests || []).map((r: any) => ({
      ...r,
      produceVariety: r.listingVariety ?? r.produceVariety ?? 'Potato',
      quantityBags: r.requestedQuantity ?? r.quantityBags ?? 0,
      totalPrice: r.totalEstimatedAmount ?? r.totalPrice ?? 0,
      notes: r.note ?? r.notes ?? '',
    }));
    return {
      success: res.success,
      count: res.count,
      requests: normalized,
    };
  },

  async getFarmerRequests(): Promise<{ success: boolean; count: number; requests: PurchaseRequest[] }> {
    return this.getPurchaseRequests();
  },

  async getBuyerRequests(): Promise<{ success: boolean; count: number; requests: PurchaseRequest[] }> {
    return this.getPurchaseRequests();
  },

  async acceptProduceRequest(id: string): Promise<any> {
    return this.updateRequestStatus(id, { status: 'ACCEPTED' });
  },

  async rejectProduceRequest(id: string, reason?: string): Promise<any> {
    return this.updateRequestStatus(id, { status: 'REJECTED', rejectionReason: reason });
  },

  async cancelProduceRequest(id: string): Promise<any> {
    return this.updateRequestStatus(id, { status: 'CANCELLED' });
  },

  async updateRequestStatus(
    id: string,
    payload: {
      status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
      rejectionReason?: string;
      pickupLocationNotes?: string;
    }
  ): Promise<{
    success: boolean;
    request: PurchaseRequest;
    transaction?: Transaction;
    message: string;
  }> {
    return apiRequest<{
      success: boolean;
      request: PurchaseRequest;
      transaction?: Transaction;
      message: string;
    }>(`/api/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // --- Transactions ---
  async getTransactions(params?: {
    status?: string;
  }): Promise<{ success: boolean; count: number; transactions: Transaction[] }> {
    const qs = params?.status ? `?status=${params.status}` : '';
    const res = await apiRequest<{ success: boolean; count: number; transactions: Transaction[] }>(
      `/api/transactions${qs}`
    );
    const normalized = (res.transactions || []).map((t: any) => ({
      ...t,
      produceVariety: t.variety ?? t.produceVariety ?? 'Potato',
      quantityBags: t.quantity ?? t.quantityBags ?? 0,
    }));
    return {
      success: res.success,
      count: res.count,
      transactions: normalized,
    };
  },

  async getBuyerTransactions(): Promise<{ success: boolean; count: number; transactions: Transaction[] }> {
    return this.getTransactions();
  },

  async getTransactionById(id: string): Promise<{ success: boolean; transaction: Transaction }> {
    return apiRequest<{ success: boolean; transaction: Transaction }>(`/api/transactions/${id}`);
  },

  async completeTransaction(
    id: string,
    payload?: { completionNotes?: string }
  ): Promise<{ success: boolean; transaction: Transaction; message: string }> {
    return apiRequest<{ success: boolean; transaction: Transaction; message: string }>(
      `/api/transactions/${id}/complete`,
      {
        method: 'PUT',
        body: JSON.stringify(payload || {}),
      }
    );
  },

  // --- Notifications ---
  async getNotifications(): Promise<{
    success: boolean;
    unreadCount: number;
    notifications: Notification[];
  }> {
    return apiRequest<{
      success: boolean;
      unreadCount: number;
      notifications: Notification[];
    }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean; notification: Notification }> {
    return apiRequest<{ success: boolean; notification: Notification }>(
      `/api/notifications/${id}/read`,
      {
        method: 'PUT',
      }
    );
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  // --- Admin ---
  async getAdminStats(): Promise<{ success: boolean; stats: AdminStats }> {
    const res = await apiRequest<{ success: boolean; stats: AdminStats }>('/api/admin/stats');
    if (res.success && res.stats) {
      res.stats.totalProduceListings = res.stats.activeListingsCount;
      res.stats.activeProduceListings = res.stats.activeListingsCount;
      res.stats.totalVolumeNaira = res.stats.totalTransactionValue;
      res.stats.totalTransactionsCount = res.stats.completedTransactionsCount;
    }
    return res;
  },

  async getAdminUsers(params?: {
    role?: string;
    status?: string;
    q?: string;
  }): Promise<{ success: boolean; count: number; users: User[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, String(val));
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{ success: boolean; count: number; users: User[] }>(
      `/api/admin/users${qs}`
    );
    const normalized = (res.users || []).map((u: any) => ({
      ...u,
      phone: u.phoneNumber ?? u.phone ?? '',
    }));
    return {
      success: res.success,
      count: res.count,
      users: normalized,
    };
  },

  async updateAdminUserStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Promise<{ success: boolean; user: User; message: string }> {
    return apiRequest<{ success: boolean; user: User; message: string }>(
      `/api/admin/users/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
  },

  async moderateListing(
    id: string,
    status: string,
    reason?: string
  ): Promise<{ success: boolean; listing: ProduceListing; message: string }> {
    return apiRequest<{ success: boolean; listing: ProduceListing; message: string }>(
      `/api/admin/listings/${id}/moderate`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      }
    );
  },

  async getAdminActivityLogs(): Promise<{
    success: boolean;
    count: number;
    logs: ActivityLog[];
  }> {
    return apiRequest<{ success: boolean; count: number; logs: ActivityLog[] }>(
      '/api/admin/activity-logs'
    );
  },
};
