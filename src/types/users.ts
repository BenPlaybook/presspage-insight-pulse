export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  id: string;
  email: string;
  name?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
} 