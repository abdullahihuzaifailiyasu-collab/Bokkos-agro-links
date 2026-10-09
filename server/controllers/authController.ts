import { Request, Response } from 'express';
import { db } from '../db/store.ts';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto.ts';
import { User, FarmerProfile, BuyerProfile, UserRole } from '../../src/types/index.ts';

export const authController = {
  // POST /api/auth/register
  register(req: Request, res: Response): void {
    try {
      const {
        phoneNumber,
        email,
        password,
        fullName,
        avatarUrl,
        role,
        // Farmer specifics
        wardLocation,
        specificLocation,
        farmSizeHectares,
        cooperativeName,
        // Buyer specifics
        businessName,
        businessType,
        operatingCity,
      } = req.body;

      // Validation
      if (!phoneNumber || !password || !fullName || !role) {
        res.status(400).json({
          success: false,
          message: 'Phone number, password, full name, and account role are strictly required.',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters in length.',
        });
        return;
      }

      if (role !== 'FARMER' && role !== 'BUYER') {
        res.status(400).json({
          success: false,
          message: 'Self-registration is permitted for roles FARMER or BUYER only. Admins must be provisioned internally.',
        });
        return;
      }

      // Check unique phone number
      for (const u of db.users.values()) {
        if (u.phoneNumber === phoneNumber.trim()) {
          res.status(409).json({
            success: false,
            message: 'An account with this phone number already exists. Please log in instead.',
          });
          return;
        }
        if (email && u.email && u.email.toLowerCase() === email.trim().toLowerCase()) {
          res.status(409).json({
            success: false,
            message: 'An account with this email address already exists.',
          });
          return;
        }
      }

      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const now = new Date().toISOString();
      const passwordHash = hashPassword(password);

      let farmerProfile: FarmerProfile | undefined;
      let buyerProfile: BuyerProfile | undefined;

      if (role === 'FARMER') {
        farmerProfile = {
          id: `fp_${Date.now()}`,
          userId,
          wardLocation: wardLocation || 'Bokkos Central',
          specificLocation: specificLocation || '',
          farmSizeHectares: farmSizeHectares ? Number(farmSizeHectares) : undefined,
          cooperativeName: cooperativeName || '',
          avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
        };
        db.farmerProfiles.set(farmerProfile.id, farmerProfile);
      } else if (role === 'BUYER') {
        buyerProfile = {
          id: `bp_${Date.now()}`,
          userId,
          businessName: businessName || fullName,
          businessType: businessType || 'Retailer',
          operatingCity: operatingCity || 'Jos',
          avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
        };
        db.buyerProfiles.set(buyerProfile.id, buyerProfile);
      }

      const newUser = {
        id: userId,
        phoneNumber: phoneNumber.trim(),
        email: email ? email.trim() : undefined,
        fullName: fullName.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
        role: role as UserRole,
        status: 'ACTIVE' as const,
        createdAt: now,
        updatedAt: now,
        farmerProfile,
        buyerProfile,
        passwordHash,
      };

      db.users.set(userId, newUser);

      // Create welcome notification
      db.createNotification({
        userId,
        title: 'Welcome to Bokkos AgroLink!',
        message: `Welcome, ${fullName}! Your ${role.toLowerCase()} account is active. Connect directly with agricultural partners across Bokkos LGA.`,
        type: 'SYSTEM',
        linkUrl: role === 'FARMER' ? '/farmer/produce/add' : '/marketplace',
      });

      // Log activity
      db.logActivity({
        actorId: userId,
        actorName: fullName,
        actorRole: role,
        action: 'USER_REGISTERED',
        targetEntity: 'USER',
        targetId: userId,
        details: `New ${role} registered with phone ${phoneNumber}`,
      });

      const token = generateToken(userId, role as UserRole);
      const { passwordHash: _, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        message: 'Registration successful. Welcome to Bokkos AgroLink!',
        token,
        user: safeUser,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration: ' + (err.message || 'Unknown'),
      });
    }
  },

  // POST /api/auth/login
  login(req: Request, res: Response): void {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide both your phone number/email and password.',
        });
        return;
      }

      const cleanIdentifier = identifier.trim().toLowerCase();
      let matchedUser: (User & { passwordHash: string }) | undefined;

      for (const u of db.users.values()) {
        if (
          u.phoneNumber === identifier.trim() ||
          (u.email && u.email.toLowerCase() === cleanIdentifier)
        ) {
          matchedUser = u;
          break;
        }
      }

      if (!matchedUser) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. No account found matching this phone number or email.',
        });
        return;
      }

      if (matchedUser.status === 'SUSPENDED') {
        res.status(403).json({
          success: false,
          message: 'This account has been suspended by system administrators.',
        });
        return;
      }

      const isMatch = verifyPassword(password, matchedUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please verify your password.',
        });
        return;
      }

      const token = generateToken(matchedUser.id, matchedUser.role);
      const { passwordHash: _, ...safeUser } = matchedUser;

      res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: safeUser,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during login: ' + (err.message || 'Unknown'),
      });
    }
  },

  // POST /api/auth/demo-login
  demoLogin(req: Request, res: Response): void {
    try {
      const { demoType } = req.body; // 'farmer1' | 'farmer2' | 'buyer1' | 'buyer2' | 'admin'
      let targetUserId: string;

      switch (demoType) {
        case 'farmer1':
          targetUserId = 'usr_farmer_001';
          break;
        case 'farmer2':
          targetUserId = 'usr_farmer_002';
          break;
        case 'buyer1':
          targetUserId = 'usr_buyer_001';
          break;
        case 'buyer2':
          targetUserId = 'usr_buyer_002';
          break;
        case 'admin':
          targetUserId = 'usr_admin_001';
          break;
        default:
          res.status(400).json({ success: false, message: 'Invalid demo user selected.' });
          return;
      }

      const user = db.users.get(targetUserId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Demo user not found.' });
        return;
      }

      const token = generateToken(user.id, user.role);
      const { passwordHash: _, ...safeUser } = user;

      res.json({
        success: true,
        message: `Switched to demo account: ${user.fullName} (${user.role})`,
        token,
        user: safeUser,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Demo login failed: ' + (err.message || 'Unknown'),
      });
    }
  },

  // GET /api/auth/me
  me(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    res.json({
      success: true,
      user: req.user,
    });
  },

  // PUT /api/auth/profile
  updateProfile(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const currentUser = db.users.get(req.user.id);
      if (!currentUser) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const { fullName, email, farmerProfile, buyerProfile } = req.body;

      if (fullName) currentUser.fullName = fullName.trim();
      if (email !== undefined) currentUser.email = email ? email.trim() : undefined;

      if (currentUser.role === 'FARMER' && farmerProfile) {
        currentUser.farmerProfile = {
          ...currentUser.farmerProfile,
          id: currentUser.farmerProfile?.id || `fp_${Date.now()}`,
          userId: currentUser.id,
          wardLocation: farmerProfile.wardLocation || currentUser.farmerProfile?.wardLocation || 'Bokkos Central',
          specificLocation: farmerProfile.specificLocation ?? currentUser.farmerProfile?.specificLocation,
          farmSizeHectares: farmerProfile.farmSizeHectares ? Number(farmerProfile.farmSizeHectares) : currentUser.farmerProfile?.farmSizeHectares,
          cooperativeName: farmerProfile.cooperativeName ?? currentUser.farmerProfile?.cooperativeName,
          yearsOfFarming: farmerProfile.yearsOfFarming ? Number(farmerProfile.yearsOfFarming) : currentUser.farmerProfile?.yearsOfFarming,
          bio: farmerProfile.bio ?? currentUser.farmerProfile?.bio,
        };
        db.farmerProfiles.set(currentUser.farmerProfile.id, currentUser.farmerProfile);
      }

      if (currentUser.role === 'BUYER' && buyerProfile) {
        currentUser.buyerProfile = {
          ...currentUser.buyerProfile,
          id: currentUser.buyerProfile?.id || `bp_${Date.now()}`,
          userId: currentUser.id,
          businessName: buyerProfile.businessName ?? currentUser.buyerProfile?.businessName,
          businessType: buyerProfile.businessType ?? currentUser.buyerProfile?.businessType,
          operatingCity: buyerProfile.operatingCity || currentUser.buyerProfile?.operatingCity || 'Jos',
          deliveryPreference: buyerProfile.deliveryPreference ?? currentUser.buyerProfile?.deliveryPreference,
        };
        db.buyerProfiles.set(currentUser.buyerProfile.id, currentUser.buyerProfile);
      }

      currentUser.updatedAt = new Date().toISOString();
      db.users.set(currentUser.id, currentUser);

      const { passwordHash: _, ...safeUser } = currentUser;
      res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: safeUser,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile: ' + (err.message || 'Unknown'),
      });
    }
  },
};
