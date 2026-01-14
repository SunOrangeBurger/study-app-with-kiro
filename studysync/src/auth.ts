// Authentication utilities
import { api } from './api';

export class AuthManager {
  private static readonly USER_ID_KEY = 'studysync_user_id';
  private static readonly USERNAME_KEY = 'studysync_username';

  static getUserId(): string | null {
    return sessionStorage.getItem(this.USER_ID_KEY);
  }

  static getUsername(): string | null {
    return sessionStorage.getItem(this.USERNAME_KEY);
  }

  static setUser(userId: string, username: string): void {
    sessionStorage.setItem(this.USER_ID_KEY, userId);
    sessionStorage.setItem(this.USERNAME_KEY, username);
  }

  static clearUser(): void {
    sessionStorage.removeItem(this.USER_ID_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getUserId() !== null;
  }

  static async validateSession(): Promise<boolean> {
    try {
      const user = await api.getUser();
      this.setUser(user._id, user.username);
      return true;
    } catch {
      this.clearUser();
      return false;
    }
  }

  static async login(username: string, password: string): Promise<boolean> {
    try {
      const result = await api.login(username, password);
      if (result.success) {
        this.setUser(result.user_id, username);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static async register(username: string, password: string): Promise<boolean> {
    try {
      const result = await api.register(username, password);
      return result.success;
    } catch {
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.logout();
    } catch {
      // Continue with logout even if API call fails
    }
    this.clearUser();
  }
}