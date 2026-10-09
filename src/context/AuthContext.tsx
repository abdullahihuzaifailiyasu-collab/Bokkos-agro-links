import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  demoLogin: (demoType: 'farmer1' | 'farmer2' | 'buyer1' | 'buyer2' | 'admin') => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        // Check if there is an active Firebase user session
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
            setLoading(false);
            return;
          }
        }
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        api.clearToken();
        setUser(null);
      }
    } catch {
      api.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // First time Google or Firebase sign in, create user profile doc in Firestore
            const newUser: User = {
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName || 'Bokkos AgroLink User',
              email: firebaseUser.email || undefined,
              phoneNumber: firebaseUser.phoneNumber || '08000000000',
              role: 'FARMER',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              farmerProfile: {
                id: `fp_${firebaseUser.uid.substring(0, 6)}`,
                userId: firebaseUser.uid,
                wardLocation: 'Butura',
                farmSizeHectares: 2.0,
                cooperativeName: 'Bokkos Smallholders Forum',
              }
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (e) {
          console.warn('Error reading user doc from Firestore:', e);
        }
      } else {
        refreshUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, password: string) => {
    setError(null);
    try {
      // Also try Firebase email/password if applicable
      if (identifier.includes('@')) {
        try {
          await signInWithEmailAndPassword(auth, identifier, password);
        } catch (firebaseErr) {
          console.log('Firebase login fallback to backend API');
        }
      }
      const res = await api.login({ identifier, password });
      setUser(res.user);
      // Persist to Firestore as active user doc
      try {
        await setDoc(doc(db, 'users', res.user.id), res.user, { merge: true });
      } catch (err) {
        console.warn('Firestore user sync warning:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userRef);
      let appUser: User;
      if (docSnap.exists()) {
        appUser = docSnap.data() as User;
      } else {
        appUser = {
          id: fbUser.uid,
          fullName: fbUser.displayName || 'Google Farmer/Trader',
          email: fbUser.email || undefined,
          phoneNumber: fbUser.phoneNumber || '08012345678',
          avatarUrl: fbUser.photoURL || undefined,
          role: 'FARMER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          farmerProfile: {
            id: `fp_${fbUser.uid.slice(0, 6)}`,
            userId: fbUser.uid,
            wardLocation: 'Bokkos Central',
            farmSizeHectares: 3.5,
            cooperativeName: 'Central Bokkos Producers',
            avatarUrl: fbUser.photoURL || undefined,
          }
        };
        await setDoc(userRef, appUser);
      }
      setUser(appUser);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    }
  };

  const demoLogin = async (demoType: 'farmer1' | 'farmer2' | 'buyer1' | 'buyer2' | 'admin') => {
    setError(null);
    try {
      const res = await api.demoLogin(demoType);
      setUser(res.user);
      // Keep Firestore record populated
      try {
        await setDoc(doc(db, 'users', res.user.id), res.user, { merge: true });
      } catch (e) {
        console.warn('Failed to sync demo user to Firestore:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Demo switch failed');
      throw err;
    }
  };

  const register = async (payload: any) => {
    setError(null);
    try {
      if (payload.email && payload.password) {
        try {
          await createUserWithEmailAndPassword(auth, payload.email, payload.password);
        } catch (e) {
          console.log('Firebase user creation fallback to local backend store');
        }
      }
      const res = await api.register(payload);
      setUser(res.user);
      try {
        await setDoc(doc(db, 'users', res.user.id), res.user, { merge: true });
      } catch (err) {
        console.warn('Firestore registration doc save:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signInWithGoogle,
        demoLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

