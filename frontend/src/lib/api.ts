import { useUser } from '@clerk/nextjs';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
interface ApiResponse<T> {
  data?: T;
  error?: string;
}
class ApiClient {
  private baseUrl: string;
  private getUserId: () => string | undefined;
  constructor(baseUrl: string, getUserId: () => string | undefined) {
    this.baseUrl = baseUrl;
    this.getUserId = getUserId;
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const userId = this.getUserId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };
      if (userId) {
        headers['user-id'] = userId;
      }
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.error || `HTTP ${response.status}` };
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error' };
    }
  }
  // User API methods
  async getUserProfile() {
    return this.request('/api/users/profile');
  }
  async updateUserProfile(updates: Partial<{
    name: string;
    email: string;
    avatar: string;
  }>) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
  // Email API methods
  async getEmails(params?: {
    page?: number;
    limit?: number;
    folder?: 'inbox' | 'starred' | 'sent' | 'archive';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.folder) queryParams.append('folder', params.folder);
    const query = queryParams.toString();
    return this.request(`/api/emails${query ? `?${query}` : ''}`);
  }
  async getEmail(id: string) {
    return this.request(`/api/emails/${id}`);
  }
  async sendEmail(emailData: {
    to: string;
    subject: string;
    body: string;
    attachments?: File[];
  }) {
    const formData = new FormData();
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('body', emailData.body);
    if (emailData.attachments) {
      emailData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }
    return this.request('/api/emails/send', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }
  async updateEmail(id: string, updates: Partial<{
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
  }>) {
    return this.request(`/api/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
  async deleteEmail(id: string) {
    return this.request(`/api/emails/${id}`, {
      method: 'DELETE',
    });
  }
  async syncUser(userData: { clerkId: string; email: string; name?: string }) {
    return this.request('/api/auth/sync-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}
// ✅ Initialize ApiClient with a function that returns the current user ID
export const useApiClient = () => {
  const { user } = useUser();
  const getUserId = () => user?.id;
  return new ApiClient(API_BASE_URL, getUserId);
  // your logic here
};
export default ApiClient;