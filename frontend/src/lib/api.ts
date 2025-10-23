const API_BASE_URL = (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'http://localhost:8201/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'backend' | 'frontend' | 'pm' | 'qa' | 'designer';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'owner' | 'backend' | 'frontend' | 'pm' | 'qa' | 'designer';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  ai_tools_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  is_active: boolean;
  ai_tools_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AiTool {
  id: number;
  name: string;
  slug: string;
  description: string;
  how_to_use?: string;
  real_examples?: string;
  link: string;
  documentation_link?: string;
  screenshots?: string[];
  additional_requirements?: Record<string, any>;
  category_id: number;
  created_by: number;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  category?: Category;
  tags?: Tag[];
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface CreateAiToolData {
  name: string;
  description: string;
  link: string;
  category_id: number;
  recommended_roles?: string[];
  tag_ids?: number[];
  how_to_use?: string;
  real_examples?: string;
  documentation_link?: string;
  screenshots?: string[];
  additional_requirements?: Record<string, any>;
}

export interface TwoFactorStatus {
  enabled_methods: string[];
  has_any_enabled: boolean;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string, twoFactorCode?: string, twoFactorType?: string): Promise<LoginResponse | { requires_2fa: boolean; available_methods: string[] }> {
    const body: any = { email, password };
    if (twoFactorCode) {
      body.two_factor_code = twoFactorCode;
      body.two_factor_type = twoFactorType || 'google_authenticator';
    }

    const response = await this.request<LoginResponse | { requires_2fa: boolean; available_methods: string[] }>('/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if ('requires_2fa' in response) {
      return response;
    }

    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return response;
  }

  async getUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/user');
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Tools API
  async getAiTools(params?: {
    category_id?: number;
    role?: string;
    tag_id?: number;
    search?: string;
    featured?: boolean;
    page?: number;
  }): Promise<{ data: AiTool[]; current_page: number; last_page: number; total: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return this.request<{ data: AiTool[]; current_page: number; last_page: number; total: number }>(`/ai-tools${query ? `?${query}` : ''}`);
  }

  async getAiTool(id: number): Promise<AiTool> {
    return this.request<AiTool>(`/ai-tools/${id}`);
  }

  async createAiTool(data: CreateAiToolData): Promise<{ message: string; tool: AiTool }> {
    return this.request<{ message: string; tool: AiTool }>('/ai-tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAiTool(id: number, data: Partial<CreateAiToolData>): Promise<{ message: string; tool: AiTool }> {
    return this.request<{ message: string; tool: AiTool }>(`/ai-tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAiTool(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/ai-tools/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async createCategory(data: { name: string; description?: string; color?: string; icon?: string }): Promise<{ message: string; category: Category }> {
    return this.request<{ message: string; category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tags API
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/tags');
  }

  async createTag(data: { name: string; color?: string }): Promise<{ message: string; tag: Tag }> {
    return this.request<{ message: string; tag: Tag }>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 2FA methods
  async getTwoFactorStatus(): Promise<TwoFactorStatus> {
    const response = await this.request<TwoFactorStatus>('/2fa/status');
    return response;
  }

  async enableTwoFactor(type: string, data: any = {}): Promise<any> {
    const response = await this.request('/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ type, ...data }),
    });
    return response;
  }

  async disableTwoFactor(type: string): Promise<any> {
    const response = await this.request('/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    return response;
  }

  async sendTwoFactorCode(type: string, data: any = {}): Promise<any> {
    const response = await this.request('/2fa/send-code', {
      method: 'POST',
      body: JSON.stringify({ type, ...data }),
    });
    return response;
  }

  async verifyTwoFactorCode(code: string, type: string): Promise<any> {
    const response = await this.request('/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code, type }),
    });
    return response;
  }

  async generateBackupCodes(): Promise<any> {
    const response = await this.request('/2fa/backup-codes', {
      method: 'POST',
    });
    return response;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
