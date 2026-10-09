import { 
  User, 
  FarmerProfile, 
  BuyerProfile, 
  ProduceListing, 
  PurchaseRequest, 
  Transaction, 
  Notification, 
  ActivityLog,
  AdminStats 
} from '../../src/types/index.ts';
import { hashPassword } from '../utils/crypto.ts';

// In-Memory Relational Store with referential integrity and persistence support
export class DatabaseStore {
  public users: Map<string, User & { passwordHash: string }> = new Map();
  public farmerProfiles: Map<string, FarmerProfile> = new Map();
  public buyerProfiles: Map<string, BuyerProfile> = new Map();
  public listings: Map<string, ProduceListing> = new Map();
  public purchaseRequests: Map<string, PurchaseRequest> = new Map();
  public transactions: Map<string, Transaction> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public activityLogs: ActivityLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const defaultPasswordHash = hashPassword('Password123!');

    // 1. Admin User
    const adminId = 'usr_admin_001';
    this.users.set(adminId, {
      id: adminId,
      phoneNumber: '08031234567',
      email: 'admin@bokkosagrolink.ng',
      fullName: 'Abdullahi Huzaifa Iliyas',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2025-01-10T08:00:00.000Z',
      updatedAt: '2025-01-10T08:00:00.000Z',
      passwordHash: defaultPasswordHash,
    });

    // 2. Farmer 1: Baba Danladi (Butura Ward)
    const farmer1Id = 'usr_farmer_001';
    this.users.set(farmer1Id, {
      id: farmer1Id,
      phoneNumber: '08023456789',
      email: 'danladi.butura@gmail.com',
      fullName: 'Baba Danladi Mutfwang',
      role: 'FARMER',
      status: 'ACTIVE',
      createdAt: '2025-01-15T09:30:00.000Z',
      updatedAt: '2025-01-15T09:30:00.000Z',
      passwordHash: defaultPasswordHash,
      farmerProfile: {
        id: 'fp_001',
        userId: farmer1Id,
        wardLocation: 'Butura',
        specificLocation: 'Near Butura Gida Primary School, Bokkos',
        farmSizeHectares: 4.5,
        cooperativeName: 'Butura Potato Growers Union',
        yearsOfFarming: 18,
        bio: 'Commercial Irish potato cultivator specializing in clean disease-free Nicola and Marabel varieties with two harvest cycles annually.',
      }
    });
    this.farmerProfiles.set('fp_001', this.users.get(farmer1Id)!.farmerProfile!);

    // 3. Farmer 2: Esther Mahanan (Daffo Ward)
    const farmer2Id = 'usr_farmer_002';
    this.users.set(farmer2Id, {
      id: farmer2Id,
      phoneNumber: '08134567890',
      email: 'esther.daffo@yahoo.com',
      fullName: 'Esther Mahanan',
      role: 'FARMER',
      status: 'ACTIVE',
      createdAt: '2025-01-18T11:00:00.000Z',
      updatedAt: '2025-01-18T11:00:00.000Z',
      passwordHash: defaultPasswordHash,
      farmerProfile: {
        id: 'fp_002',
        userId: farmer2Id,
        wardLocation: 'Daffo',
        specificLocation: 'Daffo Central Farm Settlement',
        farmSizeHectares: 2.8,
        cooperativeName: 'Daffo Women Agricultural Initiative',
        yearsOfFarming: 9,
        bio: 'Dedicated producer of premium Grade A table potatoes and vetted seed tubers using upland organic enrichment.',
      }
    });
    this.farmerProfiles.set('fp_002', this.users.get(farmer2Id)!.farmerProfile!);

    // 4. Buyer 1: Alhaji Musa (Jos Wholesale Distributor)
    const buyer1Id = 'usr_buyer_001';
    this.users.set(buyer1Id, {
      id: buyer1Id,
      phoneNumber: '08056789012',
      email: 'musa.wholesale@plateauagro.ng',
      fullName: 'Alhaji Musa Ibrahim',
      role: 'BUYER',
      status: 'ACTIVE',
      createdAt: '2025-01-20T14:15:00.000Z',
      updatedAt: '2025-01-20T14:15:00.000Z',
      passwordHash: defaultPasswordHash,
      buyerProfile: {
        id: 'bp_001',
        userId: buyer1Id,
        businessName: 'Musa & Sons Grain & Tuber Depot',
        businessType: 'Wholesaler',
        operatingCity: 'Jos / Terminus Market',
        deliveryPreference: 'Consolidated pickup by 10-tonne truck in Bokkos town',
      }
    });
    this.buyerProfiles.set('bp_001', this.users.get(buyer1Id)!.buyerProfile!);

    // 5. Buyer 2: Chinedu Okeke (Food Processor / Chips)
    const buyer2Id = 'usr_buyer_002';
    this.users.set(buyer2Id, {
      id: buyer2Id,
      phoneNumber: '07067890123',
      email: 'chinedu@plateauchips.com',
      fullName: 'Chinedu Okeke',
      role: 'BUYER',
      status: 'ACTIVE',
      createdAt: '2025-01-22T10:00:00.000Z',
      updatedAt: '2025-01-22T10:00:00.000Z',
      passwordHash: defaultPasswordHash,
      buyerProfile: {
        id: 'bp_002',
        userId: buyer2Id,
        businessName: 'Plateau Crisp Agro Processing Ltd',
        businessType: 'Processor',
        operatingCity: 'Jos / Rayfield Industrial Layout',
        deliveryPreference: 'Direct collection at farm gate or Bokkos Motor Park',
      }
    });
    this.buyerProfiles.set('bp_002', this.users.get(buyer2Id)!.buyerProfile!);

    // 6. Produce Listings
    const listing1: ProduceListing = {
      id: 'lst_001',
      farmerId: farmer1Id,
      farmerName: 'Baba Danladi Mutfwang',
      farmerPhone: '08023456789',
      farmerWard: 'Butura',
      cooperativeName: 'Butura Potato Growers Union',
      variety: 'Nicola',
      grade: 'GRADE_A',
      availableQuantity: 180,
      minimumOrderQuantity: 10,
      unit: '50kg Bag',
      pricePerUnit: 34000,
      farmLocation: 'Butura Gida, Bokkos LGA',
      harvestDate: '2025-02-10',
      availabilityPeriod: 'Freshly harvested, ready for immediate loading',
      description: 'Crisp, firm, and uniform Nicola variety table potatoes. Grown in loamy Bokkos soil, cleanly sorted, free from rot or blights. Packaged in standard 50kg aerated jute bags.',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      createdAt: '2025-02-01T09:00:00.000Z',
      updatedAt: '2025-02-01T09:00:00.000Z',
    };

    const listing2: ProduceListing = {
      id: 'lst_002',
      farmerId: farmer1Id,
      farmerName: 'Baba Danladi Mutfwang',
      farmerPhone: '08023456789',
      farmerWard: 'Butura',
      cooperativeName: 'Butura Potato Growers Union',
      variety: 'Marabel',
      grade: 'GRADE_B',
      availableQuantity: 95,
      minimumOrderQuantity: 5,
      unit: '50kg Bag',
      pricePerUnit: 29000,
      farmLocation: 'Butura Gida, Bokkos LGA',
      harvestDate: '2025-02-12',
      availabilityPeriod: 'Cured and bagged in storage',
      description: 'Golden skin Marabel potatoes, perfect for household boiling and catering supplies. Well graded, clean skin finish with excellent shelf life.',
      imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698980?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      createdAt: '2025-02-02T11:30:00.000Z',
      updatedAt: '2025-02-02T11:30:00.000Z',
    };

    const listing3: ProduceListing = {
      id: 'lst_003',
      farmerId: farmer2Id,
      farmerName: 'Esther Mahanan',
      farmerPhone: '08134567890',
      farmerWard: 'Daffo',
      cooperativeName: 'Daffo Women Agricultural Initiative',
      variety: 'Bertita',
      grade: 'GRADE_A',
      availableQuantity: 120,
      minimumOrderQuantity: 15,
      unit: '50kg Bag',
      pricePerUnit: 36000,
      farmLocation: 'Daffo Central, Bokkos LGA',
      harvestDate: '2025-02-15',
      availabilityPeriod: 'Field harvesting ongoing; ready for collection',
      description: 'High dry-matter Bertita potatoes suited for French fries and industrial chips slicing. Large tubers with low sugar content and zero discoloration.',
      imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      createdAt: '2025-02-03T15:00:00.000Z',
      updatedAt: '2025-02-03T15:00:00.000Z',
    };

    const listing4: ProduceListing = {
      id: 'lst_004',
      farmerId: farmer2Id,
      farmerName: 'Esther Mahanan',
      farmerPhone: '08134567890',
      farmerWard: 'Daffo',
      cooperativeName: 'Daffo Women Agricultural Initiative',
      variety: 'Nicola',
      grade: 'SEED_POTATO',
      availableQuantity: 60,
      minimumOrderQuantity: 5,
      unit: '50kg Bag',
      pricePerUnit: 42000,
      farmLocation: 'Daffo Highland Nursery, Bokkos LGA',
      harvestDate: '2025-01-28',
      availabilityPeriod: 'Dormancy broken; sprouted and ready for planting',
      description: 'Certified clean seed tubers derived from virus-tested foundation seed. Optimal eye sprout distribution guaranteed for early wet season planting.',
      imageUrl: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      createdAt: '2025-02-04T08:20:00.000Z',
      updatedAt: '2025-02-04T08:20:00.000Z',
    };

    this.listings.set(listing1.id, listing1);
    this.listings.set(listing2.id, listing2);
    this.listings.set(listing3.id, listing3);
    this.listings.set(listing4.id, listing4);

    // 7. Purchase Requests
    const req1: PurchaseRequest = {
      id: 'req_001',
      listingId: 'lst_001',
      listingVariety: 'Nicola',
      listingGrade: 'GRADE_A',
      listingUnit: '50kg Bag',
      unitPrice: 34000,
      buyerId: buyer1Id,
      buyerName: 'Alhaji Musa Ibrahim',
      buyerPhone: '08056789012',
      buyerBusinessName: 'Musa & Sons Grain & Tuber Depot',
      buyerCity: 'Jos / Terminus Market',
      farmerId: farmer1Id,
      farmerName: 'Baba Danladi Mutfwang',
      farmerPhone: '08023456789',
      farmerWard: 'Butura',
      requestedQuantity: 50,
      totalEstimatedAmount: 1700000,
      note: 'We have a truck scheduled to load in Bokkos this Thursday. Will inspect at loading bay.',
      status: 'ACCEPTED',
      createdAt: '2025-02-05T10:00:00.000Z',
      updatedAt: '2025-02-05T14:30:00.000Z',
    };

    const req2: PurchaseRequest = {
      id: 'req_002',
      listingId: 'lst_003',
      listingVariety: 'Bertita',
      listingGrade: 'GRADE_A',
      listingUnit: '50kg Bag',
      unitPrice: 36000,
      buyerId: buyer2Id,
      buyerName: 'Chinedu Okeke',
      buyerPhone: '07067890123',
      buyerBusinessName: 'Plateau Crisp Agro Processing Ltd',
      buyerCity: 'Jos / Rayfield Industrial Layout',
      farmerId: farmer2Id,
      farmerName: 'Esther Mahanan',
      farmerPhone: '08134567890',
      farmerWard: 'Daffo',
      requestedQuantity: 40,
      totalEstimatedAmount: 1440000,
      note: 'Seeking direct supply for our chips factory slicing run next week. Please confirm availability.',
      status: 'PENDING',
      createdAt: '2025-02-06T11:45:00.000Z',
      updatedAt: '2025-02-06T11:45:00.000Z',
    };

    this.purchaseRequests.set(req1.id, req1);
    this.purchaseRequests.set(req2.id, req2);

    // 8. Completed Transaction (from req1)
    const tx1: Transaction = {
      id: 'tx_001',
      requestId: req1.id,
      listingId: req1.listingId,
      buyerId: req1.buyerId,
      buyerName: req1.buyerName,
      buyerPhone: req1.buyerPhone,
      farmerId: req1.farmerId,
      farmerName: req1.farmerName,
      farmerPhone: req1.farmerPhone,
      farmerWard: req1.farmerWard,
      variety: req1.listingVariety,
      grade: req1.listingGrade,
      quantity: req1.requestedQuantity,
      unit: req1.listingUnit,
      unitPrice: req1.unitPrice,
      totalAmount: req1.totalEstimatedAmount,
      status: 'COMPLETED',
      pickupLocationNotes: 'Loaded at Bokkos Central Park transit depot',
      completionNotes: '50 bags inspected, weighed, and verified. Full cash-on-delivery settlement completed.',
      completedAt: '2025-02-07T16:00:00.000Z',
      createdAt: '2025-02-05T14:30:00.000Z',
    };
    this.transactions.set(tx1.id, tx1);

    // 9. Initial Notifications
    this.createNotification({
      userId: farmer1Id,
      title: 'Purchase Request Accepted',
      message: 'You accepted Alhaji Musa Ibrahim\'s request for 50 bags of Nicola Grade A potatoes.',
      type: 'REQUEST_ACCEPTED',
      linkUrl: '/farmer/requests',
    });

    this.createNotification({
      userId: buyer1Id,
      title: 'Request Approved by Farmer',
      message: 'Baba Danladi accepted your purchase request for 50 bags of Nicola Grade A potatoes.',
      type: 'REQUEST_ACCEPTED',
      linkUrl: '/buyer/requests',
    });

    this.createNotification({
      userId: farmer2Id,
      title: 'New Purchase Request',
      message: 'Plateau Crisp Agro Processing Ltd submitted a purchase request for 40 bags of Bertita potatoes.',
      type: 'REQUEST_RECEIVED',
      linkUrl: '/farmer/requests',
    });

    // 10. Initial Activity Logs
    this.logActivity({
      actorName: 'System',
      actorRole: 'SYSTEM',
      action: 'PLATFORM_INITIALIZED',
      targetEntity: 'SYSTEM',
      targetId: 'bokkos-agrolink',
      details: 'Bokkos AgroLink platform initialized with Bokkos LGA seed datasets.',
    });
  }

  // --- Helpers & Queries ---

  public createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const notif: Notification = {
      id,
      ...data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, notif);
    return notif;
  }

  public logActivity(data: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const log: ActivityLog = {
      id,
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.activityLogs.unshift(log);
    // Keep last 200 logs
    if (this.activityLogs.length > 200) {
      this.activityLogs.pop();
    }
    return log;
  }

  public getAdminStats(): AdminStats {
    let totalFarmers = 0;
    let totalBuyers = 0;
    for (const u of this.users.values()) {
      if (u.role === 'FARMER') totalFarmers++;
      if (u.role === 'BUYER') totalBuyers++;
    }

    let activeListingsCount = 0;
    let totalBagsListed = 0;
    for (const l of this.listings.values()) {
      if (l.status === 'AVAILABLE') {
        activeListingsCount++;
        totalBagsListed += l.availableQuantity;
      }
    }

    let pendingRequestsCount = 0;
    for (const r of this.purchaseRequests.values()) {
      if (r.status === 'PENDING') pendingRequestsCount++;
    }

    let completedTransactionsCount = 0;
    let totalTransactionValue = 0;
    for (const t of this.transactions.values()) {
      if (t.status === 'COMPLETED') {
        completedTransactionsCount++;
        totalTransactionValue += t.totalAmount;
      }
    }

    return {
      totalFarmers,
      totalBuyers,
      activeListingsCount,
      totalBagsListed,
      pendingRequestsCount,
      completedTransactionsCount,
      totalTransactionValue,
    };
  }
}

export const db = new DatabaseStore();
