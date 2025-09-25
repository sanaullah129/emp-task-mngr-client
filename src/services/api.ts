import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  created_at: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'ongoing' | 'completed';
  due_date?: string;
  employee_id?: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CreateEmployee {
  name: string;
  email: string;
  department: string;
  position: string;
}

export interface UpdateEmployee {
  name?: string;
  email?: string;
  department?: string;
  position?: string;
}

export interface CreateTask {
  title: string;
  description?: string;
  due_date?: string;
  employee_id?: number;
}

export interface UpdateTask {
  title?: string;
  description?: string;
  status?: 'pending' | 'ongoing' | 'completed';
  due_date?: string;
  employee_id?: number;
}

// API Service Class
class ApiService {
  // Authentication
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response: AxiosResponse<TokenResponse> = await axios.post(
      `${API_BASE_URL}/token`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    // Store token
    localStorage.setItem('token', response.data.access_token);
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    const response: AxiosResponse<Employee[]> = await apiClient.get('/employees');
    return response.data;
  }

  async getEmployee(id: number): Promise<Employee> {
    const response: AxiosResponse<Employee> = await apiClient.get(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(employee: CreateEmployee): Promise<Employee> {
    const response: AxiosResponse<Employee> = await apiClient.post('/employees', employee);
    return response.data;
  }

  async updateEmployee(id: number, employee: UpdateEmployee): Promise<Employee> {
    const response: AxiosResponse<Employee> = await apiClient.put(`/employees/${id}`, employee);
    return response.data;
  }

  async deleteEmployee(id: number): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await apiClient.get('/tasks');
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response: AxiosResponse<Task> = await apiClient.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(task: CreateTask): Promise<Task> {
    const response: AxiosResponse<Task> = await apiClient.post('/tasks', task);
    return response.data;
  }

  async updateTask(id: number, task: UpdateTask): Promise<Task> {
    const response: AxiosResponse<Task> = await apiClient.put(`/tasks/${id}`, task);
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }
}

export const apiService = new ApiService();