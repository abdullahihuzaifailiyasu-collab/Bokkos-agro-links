import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { 
  ProduceListing, 
  PurchaseRequest, 
  User, 
  CooperativePool, 
  QualityPassport, 
  EscrowTransaction 
} from '../types/index.ts';
import { 
  INITIAL_COOPERATIVE_POOLS, 
  INITIAL_QUALITY_PASSPORTS, 
  INITIAL_ESCROW_TRANSACTIONS 
} from './phase5Data.ts';

/**
 * Firestore Service for Real-Time & Persistent Cloud Storage
 */
export const firestoreService = {
  // --- Produce Listings ---
  async getListings(): Promise<ProduceListing[]> {
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return [];
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProduceListing));
    } catch (err) {
      console.warn('Firestore getListings fallback:', err);
      return [];
    }
  },

  async saveListing(listing: Omit<ProduceListing, 'id'> & { id?: string }): Promise<string> {
    if (listing.id) {
      const docRef = doc(db, 'listings', listing.id);
      await setDoc(docRef, listing, { merge: true });
      return listing.id;
    } else {
      const colRef = collection(db, 'listings');
      const docRef = await addDoc(colRef, {
        ...listing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    }
  },

  // --- Cooperative Pools ---
  async getCooperativePools(): Promise<CooperativePool[]> {
    try {
      const snapshot = await getDocs(collection(db, 'cooperativePools'));
      if (snapshot.empty) {
        // Seed default initial pools into Firestore for durability
        for (const pool of INITIAL_COOPERATIVE_POOLS) {
          await setDoc(doc(db, 'cooperativePools', pool.id), pool);
        }
        return INITIAL_COOPERATIVE_POOLS;
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CooperativePool));
    } catch (err) {
      console.warn('Firestore getCooperativePools fallback:', err);
      return INITIAL_COOPERATIVE_POOLS;
    }
  },

  async updateCooperativePool(pool: CooperativePool): Promise<void> {
    try {
      await setDoc(doc(db, 'cooperativePools', pool.id), pool, { merge: true });
    } catch (err) {
      console.warn('Failed to update cooperative pool in Firestore:', err);
    }
  },

  // --- Quality Passports ---
  async getQualityPassports(): Promise<QualityPassport[]> {
    try {
      const snapshot = await getDocs(collection(db, 'qualityPassports'));
      if (snapshot.empty) {
        for (const qp of INITIAL_QUALITY_PASSPORTS) {
          await setDoc(doc(db, 'qualityPassports', qp.id), qp);
        }
        return INITIAL_QUALITY_PASSPORTS;
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as QualityPassport));
    } catch (err) {
      console.warn('Firestore getQualityPassports fallback:', err);
      return INITIAL_QUALITY_PASSPORTS;
    }
  },

  async saveQualityPassport(passport: QualityPassport): Promise<void> {
    try {
      await setDoc(doc(db, 'qualityPassports', passport.id), passport);
    } catch (err) {
      console.warn('Failed to save quality passport in Firestore:', err);
    }
  },

  // --- Escrow Vault ---
  async getEscrowTransactions(): Promise<EscrowTransaction[]> {
    try {
      const snapshot = await getDocs(collection(db, 'escrowVault'));
      if (snapshot.empty) {
        for (const escrow of INITIAL_ESCROW_TRANSACTIONS) {
          await setDoc(doc(db, 'escrowVault', escrow.id), escrow);
        }
        return INITIAL_ESCROW_TRANSACTIONS;
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EscrowTransaction));
    } catch (err) {
      console.warn('Firestore getEscrowTransactions fallback:', err);
      return INITIAL_ESCROW_TRANSACTIONS;
    }
  },

  async saveEscrowTransaction(escrow: EscrowTransaction): Promise<void> {
    try {
      await setDoc(doc(db, 'escrowVault', escrow.id), escrow, { merge: true });
    } catch (err) {
      console.warn('Failed to save escrow transaction in Firestore:', err);
    }
  },

  // Real-time listener for Escrow
  subscribeToEscrow(callback: (transactions: EscrowTransaction[]) => void) {
    return onSnapshot(collection(db, 'escrowVault'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EscrowTransaction));
      if (data.length > 0) {
        callback(data);
      }
    });
  }
};
