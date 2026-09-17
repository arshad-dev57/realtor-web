// lib/auth.ts

export interface UserData {
  token: string;
  userId: string;
  role: string;
  email: string;
  name: string;
  phone: string;
  isProfileComplete: boolean;
  isSubscribed: boolean;
}

export const authService = {
  saveUser(data: UserData) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('role', data.role);
    localStorage.setItem('email', data.email);
    localStorage.setItem('name', data.name);
    localStorage.setItem('phone', data.phone);
    localStorage.setItem('isProfileComplete', String(data.isProfileComplete));
    localStorage.setItem('isSubscribed', String(data.isSubscribed));
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  getRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('role');
  },

  getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  },

  getEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('email');
  },

  getName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('name');
  },

  getPhone(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('phone');
  },

  updateUserRole(role: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('role', role);
  },

  updateProfileComplete(value: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('isProfileComplete', String(value));
  },

  updateOneTimePaymentStatus(paid: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('isSubscribed', String(paid));
  },

  isProfileComplete(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isProfileComplete') === 'true';
  },

  isSubscribed(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isSubscribed') === 'true';
  },

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!this.getToken();
  },

  clear() {
    if (typeof window === 'undefined') return;
    const keys = ['token', 'userId', 'role', 'email', 'name', 'phone', 'isProfileComplete', 'isSubscribed'];
    keys.forEach((k) => localStorage.removeItem(k));
  },

  // For favorites (backward compatibility)
  getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const favorites = localStorage.getItem('favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  },

  addFavorite(propertyId: string) {
    if (typeof window === 'undefined') return;
    const favorites = this.getFavorites();
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  },

  removeFavorite(propertyId: string) {
    if (typeof window === 'undefined') return;
    const favorites = this.getFavorites();
    const index = favorites.indexOf(propertyId);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  },

  toggleFavorite(propertyId: string): boolean {
    if (typeof window === 'undefined') return false;
    const favorites = this.getFavorites();
    const index = favorites.indexOf(propertyId);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(propertyId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    }
  },
};