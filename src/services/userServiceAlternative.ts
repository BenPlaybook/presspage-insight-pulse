import { supabase } from '@/lib/supabase';
import { User, CreateUserData, UpdateUserData } from '@/types/users';

export const userServiceAlternative = {
  // Obtener el perfil del usuario actual usando fetch directo
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Obtener la sesión para el token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return null;

      // Usar fetch directamente para controlar headers
      const response = await fetch(
        `https://kfqyjghjvwweltpdoffa.supabase.co/rest/v1/users?select=*&id=eq.${user.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcXlqZ2hqdnd3ZWx0cGRvZmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODg3MjYsImV4cCI6MjA2MTA2NDcyNn0.SY3P_gSI8GjDHIrpNwsMvwuzt3VCeuXsglpMOStXRRM',
            'Content-Type': 'application/json',
            'Accept': 'application/json', // Usar application/json en lugar de application/vnd.pgrst.object+json
            'Prefer': 'count=exact'
          }
        }
      );

      if (!response.ok) {
        console.error('Error fetching user profile:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      // Si devuelve un array, tomar el primer elemento
      if (Array.isArray(data)) {
        return data[0] || null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  },

  // Crear un nuevo usuario en la tabla public.users
  async createUser(userData: CreateUserData): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  },

  // Actualizar el perfil del usuario
  async updateUser(userId: string, updates: UpdateUserData): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  },

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data;
  },

  // Obtener usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  },

  // Verificar si un usuario existe
  async userExists(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }
}; 