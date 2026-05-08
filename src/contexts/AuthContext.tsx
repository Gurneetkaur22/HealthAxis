import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupaUser } from '@supabase/supabase-js';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'receptionist';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole, specialization?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchAppUser(supaUser: SupaUser): Promise<AppUser> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, specialization')
    .eq('user_id', supaUser.id)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supaUser.id)
    .single();

  return {
    id: supaUser.id,
    email: supaUser.email || '',
    fullName: profile?.full_name || '',
    role: (roleData?.role as UserRole) || 'patient',
    specialization: profile?.specialization || undefined,
    phone: profile?.phone || undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const appUser = await fetchAppUser(session.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const appUser = await fetchAppUser(session.user);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole, specialization?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    // Insert role
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: data.user.id,
      role: role,
    });
    if (roleError) throw roleError;

    // Update profile with extra fields
    if (specialization) {
      await supabase.from('profiles').update({ specialization }).eq('user_id', data.user.id);
    }

    // Re-fetch user data after role & profile are set (fixes race condition with onAuthStateChange)
    const appUser = await fetchAppUser(data.user);
    setUser(appUser);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const isRole = (role: UserRole) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
