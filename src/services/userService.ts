import { supabase } from '@/lib/supabase';
import { User, CreateUserData, UpdateUserData } from '@/types/users';

export const userService = {
  // Obtener el perfil del usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Usar consulta simple sin .single() para evitar 406
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .limit(1);

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Retornar el primer elemento del array o null
      return data?.[0] || null;
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