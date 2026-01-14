// API client for StudySync backend
import type { Group, Subject, User, Resource } from './types';

const API_BASE = 'http://localhost:3000'; // Backend server URL

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async register(username: string, password: string): Promise<{ success: boolean }> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username: string, password: string): Promise<{ success: boolean; user_id: string }> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request('/logout', { method: 'POST' });
  }

  async getUser(): Promise<User> {
    try {
      return this.request('/get-user');
    } catch (error) {
      // If backend is not available, throw error to trigger logout
      throw new Error('Backend not available');
    }
  }

  // Group Management
  async createGroup(name: string, syllabus: Subject[]): Promise<{ success: boolean; group_id: string }> {
    return this.request('/create-group', {
      method: 'POST',
      body: JSON.stringify({ name, syllabus }),
    });
  }

  async joinGroup(invite_code: string): Promise<{ success: boolean; group_id: string }> {
    return this.request('/join-group', {
      method: 'POST',
      body: JSON.stringify({ invite_code }),
    });
  }

  async getGroup(group_id: string): Promise<Group> {
    return this.request(`/group/${group_id}`);
  }

  async getUserGroups(): Promise<Group[]> {
    return this.request('/user-groups');
  }

  // Progress Tracking
  async updateProgress(group_id: string, concept: string, status: boolean): Promise<{ success: boolean }> {
    return this.request('/update-progress', {
      method: 'POST',
      body: JSON.stringify({ group_id, concept, status }),
    });
  }

  async getProgress(group_id: string): Promise<{ concept: string; at: Date }[]> {
    return this.request(`/progress/${group_id}`);
  }

  // Resources
  async addResource(group_id: string, resource: Omit<Resource, '_id' | 'added_by' | 'added_at'>): Promise<{ success: boolean }> {
    return this.request('/add-resource', {
      method: 'POST',
      body: JSON.stringify({ group_id, ...resource }),
    });
  }

  async approveResource(group_id: string, resource_id: string): Promise<{ success: boolean }> {
    return this.request('/approve-resource', {
      method: 'POST',
      body: JSON.stringify({ group_id, resource_id }),
    });
  }

  async rejectResource(group_id: string, resource_id: string): Promise<{ success: boolean }> {
    return this.request('/reject-resource', {
      method: 'POST',
      body: JSON.stringify({ group_id, resource_id }),
    });
  }
}

export const api = new ApiClient();