import { Injectable } from '@angular/core';
import { CryptoHelper } from '../core/utils/crypto.helper';

export type Persona =
  | 'property-owner'
  | 'busines-owner'
  | 'community-member'
  | 'yoga-studio'
  | 'scout'
  | 'admin';

export interface AppUser {
  user_type: Persona;
  approval: boolean | 'pending' | 'rejected'|'approved';
  rejectMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'user';

  constructor() {}

  // Save encrypted user data to localStorage
  saveUser(user: AppUser) {
    const encrypted = CryptoHelper.encrypt(user);
    localStorage.setItem(this.storageKey, encrypted);
  }

  // Get decrypted user data from localStorage
  getUser(): AppUser | null {
    const cipher = localStorage.getItem(this.storageKey);
    if (!cipher) return null;

    const decrypted = CryptoHelper.decrypt<AppUser>(cipher);
    console.log('decrypted',decrypted);
    
    return decrypted;
  }

  isSignedIn(): boolean {
    return !!this.getUser();
  }

  clearUser() {
    localStorage.removeItem(this.storageKey);
  }

  // Persona root for redirect
  getPersonaRoot(user: AppUser | null): string {
    if (!user) return '/';
    switch (user.user_type) {
      case 'property-owner': return '/landing/property-owner';
      case 'busines-owner': return '/landing/busines-owner';
      case 'community-member': return '/landing/community-member';
      case 'yoga-studio': return '/landing/yoga-studio';
      case 'scout': return '/landing/scout';
      case 'admin': return '/landing/admin';
      default: return '/';
    }
  }
}
