import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthSession } from '@/types/auth';
import { UserRole } from '@/types/elearning';

interface AuthState {
  // Data
  registeredUsers: AuthUser[];
  session: AuthSession | null;

  // Actions
  register: (
    fullName: string,
    email: string,
    password: string,
    role: UserRole
  ) => { success: boolean; error?: string; user?: AuthUser };

  login: (
    email: string,
    password: string
  ) => { success: boolean; error?: string; user?: AuthUser };

  logout: () => void;

  getCurrentUser: () => AuthUser | null;

  updateCertificateName: (userId: string, certificateName: string) => void;
}

// Seed demo users so existing demo still works
const SEED_USERS: AuthUser[] = [
  {
    id: 'user-budi',
    fullName: 'Budi Santoso',
    email: 'budi@eduflow.id',
    password: 'demo123',
    role: 'learner',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'user-alex',
    fullName: 'Pak Alex Kurniawan, M.Kom',
    email: 'alex@eduflow.id',
    password: 'demo123',
    role: 'teacher',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-08-01T00:00:00Z',
  },
];

const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      registeredUsers: SEED_USERS,
      session: null,

      register: (fullName, email, password, role) => {
        const { registeredUsers } = get();

        // Validate
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          return { success: false, error: 'All fields are required.' };
        }

        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const emailLower = email.toLowerCase().trim();
        const exists = registeredUsers.find(
          (u) => u.email.toLowerCase() === emailLower
        );
        if (exists) {
          return { success: false, error: 'Email is already registered.' };
        }

        const newUser: AuthUser = {
          id: `user-${Date.now()}`,
          fullName: fullName.trim(),
          email: emailLower,
          password, // plain text for demo only
          role,
          avatarUrl:
            AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)],
          createdAt: new Date().toISOString(),
        };

        set({ registeredUsers: [...registeredUsers, newUser] });

        return { success: true, user: newUser };
      },

      login: (email, password) => {
        const { registeredUsers } = get();

        if (!email.trim() || !password.trim()) {
          return { success: false, error: 'Email and password are required.' };
        }

        const emailLower = email.toLowerCase().trim();
        const user = registeredUsers.find(
          (u) => u.email.toLowerCase() === emailLower && u.password === password
        );

        if (!user) {
          return { success: false, error: 'Invalid email or password.' };
        }

        const session: AuthSession = {
          userId: user.id,
          isAuthenticated: true,
          loginAt: new Date().toISOString(),
        };

        set({ session });

        return { success: true, user };
      },

      logout: () => {
        set({ session: null });
      },

      getCurrentUser: () => {
        const { session, registeredUsers } = get();
        if (!session?.isAuthenticated) return null;
        return registeredUsers.find((u) => u.id === session.userId) || null;
      },

      updateCertificateName: (userId: string, certificateName: string) => {
        const { registeredUsers } = get();
        set({
          registeredUsers: registeredUsers.map((u) =>
            u.id === userId ? { ...u, certificateName: certificateName.trim() } : u
          ),
        });
      },
    }),
    {
      name: 'eduflow-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
