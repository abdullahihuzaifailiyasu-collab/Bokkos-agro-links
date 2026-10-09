/**
 * Core Domain Types for Bokkos AgroLink
 * Digital Platform for Potato Value Chain in Bokkos LGA, Plateau State, Nigeria
 */

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export type PotatoVariety = 'Nicola' | 'Marabel' | 'Bertita' | 'Caruso' | 'Lady Rosetta' | 'Local Red' | 'Connect' | 'Markies' | 'Other';
export type PotatoGrade = 'GRADE_A' | 'GRADE_B' | 'SEED_POTATO' | 'COMMERCIAL';
export type QualityGrade = PotatoGrade; // Alias for backward compatibility
export type QuantityUnit = '50kg Bag' | '100kg Bag' | 'Tonne' | 'Pickup Load';
export type BagType = QuantityUnit; // Alias for backward compatibility
export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD_OUT' | 'INACTIVE';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type TransactionStatus = 'PENDING_FULFILLMENT' | 'COMPLETED' | 'CANCELLED';

export type NotificationType = 
  | 'REQUEST_RECEIVED' 
  | 'REQUEST_ACCEPTED' 
  | 'REQUEST_REJECTED' 
  | 'REQUEST_CANCELLED' 
  | 'TRANSACTION_COMPLETED' 
  | 'SYSTEM';

// Wards within Bokkos Local Government Area, Plateau State
export const BOKKOS_WARDS = [
  'Bokkos Central',
  'Butura',
  'Daffo',
  'Manguna',
  'Richa',
  'Toff',
  'Mushere Central',
  'Mushere West',
  'Kamwai',
  'Kunet',
  'Sha'
] as const;

export type BokkosWard = typeof BOKKOS_WARDS[number];

export interface User {
  id: string;
  phoneNumber: string;
  phone?: string; // alias
  email?: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  wardLocation: string; // e.g. 'Butura', 'Daffo'
  specificLocation?: string; // village / landmark
  farmSizeHectares?: number;
  cooperativeName?: string;
  yearsOfFarming?: number;
  avatarUrl?: string;
  bio?: string;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  businessName?: string;
  businessType?: 'Wholesaler' | 'Retailer' | 'Processor' | 'Restaurant / Hotel' | 'Individual Consumer';
  buyerType?: string; // alias
  operatingCity: string; // e.g. Jos, Abuja, Lagos, Bokkos
  deliveryPreference?: string;
  avatarUrl?: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerWard: string;
  cooperativeName?: string;
  variety: PotatoVariety;
  grade: PotatoGrade;
  availableQuantity: number;
  quantityBags?: number; // alias
  minimumOrderQuantity: number;
  unit: QuantityUnit;
  bagType?: string; // alias
  pricePerUnit: number; // in NGN
  pricePerBag?: number; // alias
  farmLocation: string; // village/ward
  harvestDate: string; // YYYY-MM-DD
  availabilityPeriod: string; // e.g., "Ready for immediate pickup", "Harvesting in 5 days"
  description: string;
  imageUrl?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  id: string;
  listingId: string;
  listingVariety: PotatoVariety;
  produceVariety?: string; // alias
  listingGrade: PotatoGrade;
  listingUnit: QuantityUnit;
  unitPrice: number;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerBusinessName?: string;
  buyerCity: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerWard: string;
  requestedQuantity: number;
  quantityBags?: number; // alias
  totalEstimatedAmount: number;
  totalPrice?: number; // alias
  note?: string;
  notes?: string; // alias
  proposedPickupDate?: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProduceRequest = PurchaseRequest; // Alias

export interface Transaction {
  id: string;
  requestId: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerWard: string;
  variety: PotatoVariety;
  produceVariety?: string; // alias
  grade: PotatoGrade;
  quantity: number;
  quantityBags?: number; // alias
  unit: QuantityUnit;
  unitPrice: number;
  totalAmount: number;
  status: TransactionStatus;
  pickupLocationNotes?: string;
  completionNotes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AdminStats {
  totalFarmers: number;
  totalBuyers: number;
  activeListingsCount: number;
  totalBagsListed: number;
  pendingRequestsCount: number;
  completedTransactionsCount: number;
  totalTransactionValue: number;
  // Aliases for dashboard views
  totalProduceListings?: number;
  activeProduceListings?: number;
  totalVolumeNaira?: number;
  totalTransactionsCount?: number;
}

// Phase 4 Domain Models: Price Intelligence, Spatial Wards, and Logistics
export interface MarketPriceBenchmark {
  id: string;
  variety: PotatoVariety;
  grade: PotatoGrade;
  farmGateBokkos: number; // NGN per 50kg bag
  josTerminus: number;
  abujaDeiDei: number;
  lagosMile12: number;
  kadunaCentral: number;
  kanoDawanau: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changePercent: number;
  unit: QuantityUnit;
  lastUpdated: string;
  demandIntensity: 'HIGH' | 'MODERATE' | 'SURPLUS';
}

export interface WeeklyPriceTrend {
  week: string;
  dateLabel: string;
  bokkosFarmGate: number;
  josWholesale: number;
  abujaWholesale: number;
  lagosWholesale: number;
}

export interface WardProfile {
  ward: BokkosWard;
  elevationMeters: number;
  soilType: string;
  primaryVarieties: PotatoVariety[];
  activeFarmersCount: number;
  availableStockBags: number;
  roadAccessibility: 'PAVED_HIGHWAY' | 'GRADED_FEEDER' | 'DIFFICULT_IN_RAIN';
  mainCollectionHub: string;
  harvestWindow: string;
  description: string;
}

export interface HaulageTransporter {
  id: string;
  driverName: string;
  transportCompany: string;
  phoneNumber: string;
  baseLocation: string; // e.g. Bokkos Motor Park
  vehicleType: 'PICKUP_1TON' | 'CANTER_3TON' | 'TRUCK_7TON' | 'HEAVY_15TON' | 'TRAILER_30TON';
  vehicleModel: string;
  plateNumber: string;
  capacityBags50kg: number;
  verified: boolean;
  tripsCompleted: number;
  rating: number;
  ratePerBag: {
    jos: number;
    abuja: number;
    kaduna: number;
    lagos: number;
  };
}

// Phase 5 Domain Models: Cooperative Aggregation, Quality Passports, Escrow Settlement & Rural Gateway
export interface PoolContribution {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerWard: BokkosWard;
  bagsContributed: number;
  pledgedAt: string;
  inspectionStatus: 'PASSED' | 'PENDING' | 'REJECTED';
  payoutAmount?: number;
  payoutStatus?: 'PENDING' | 'DISBURSED';
}

export interface CooperativePool {
  id: string;
  poolCode: string;
  poolTitle: string;
  leadCooperative: string;
  ward: BokkosWard;
  variety: PotatoVariety;
  grade: PotatoGrade;
  targetBags: number;
  pledgedBags: number;
  minContributionBags: number;
  targetPricePerBag: number;
  collectionDepot: string;
  deadlineDate: string;
  status: 'OPEN' | 'INSPECTION' | 'LOCKED_OFFTAKE' | 'DISPATCHED' | 'SETTLED';
  description: string;
  contributions: PoolContribution[];
  offtakeContract?: {
    buyerName: string;
    buyerCity: string;
    agreedPricePerBag: number;
    totalContractValue: number;
    escrowLocked: boolean;
  };
}

export interface QualityPassport {
  id: string;
  passportNumber: string;
  batchReference: string;
  producerOrPool: string;
  ward: BokkosWard;
  variety: PotatoVariety;
  harvestDate: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorBadge: string;
  accreditationBody: string;
  certifiedGrade: 'EXPORT_GRADE_A' | 'INDUSTRIAL_PROCESSING' | 'CERTIFIED_SEED_G3' | 'TABLE_GRADE_1';
  metrics: {
    dryMatterPercent: number;
    specificGravity: number;
    sizeCaliberMm: string;
    skinSetScore: number; // 0-100
    defectRatePercent: number;
    internalDefects: string;
    moisturePercent: number;
    fungalScore: string;
  };
  qrCodeData: string;
  verifiedStatus: 'VALID_CERTIFIED' | 'EXPIRED' | 'PROVISIONAL';
  officialNotes: string;
}

export interface EscrowMilestone {
  stage: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  referenceCode?: string;
}

export interface EscrowTransaction {
  id: string;
  escrowCode: string;
  relatedEntity: string; // e.g. "Pool: Butura Nicola Consortium" or "Listing: 100 Bags Marabel"
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  farmerOrPoolName: string;
  farmerPhone: string;
  farmerBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  transporterName: string;
  transporterPhone: string;
  waybillNumber: string;
  totalAmountNaira: number;
  bagCount: number;
  variety: PotatoVariety;
  status: 'FUNDS_LOCKED' | 'LOADING_WAYBILL_ISSUED' | 'IN_TRANSIT' | 'DELIVERY_ACCEPTED' | 'FUNDS_RELEASED' | 'DISPUTED';
  createdAt: string;
  milestones: EscrowMilestone[];
  autoReleaseHoursRemaining?: number;
}

export interface OfftakeAgreement {
  id: string;
  agreementCode: string;
  institutionalBuyer: string;
  buyerType: string;
  buyerCity: string;
  varietyRequired: PotatoVariety;
  totalTargetBags: number;
  floorPricePerBag: number;
  contractWindow: string;
  deliveryHub: string;
  status: 'OPEN_FOR_CLUSTERS' | 'ALLOCATED' | 'FULFILLED';
  termsSummary: string;
  advanceInputSubsidyPercent: number;
}

