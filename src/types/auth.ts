export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  password: string; // hashed in real app, plain for demo
  role: 'learner' | 'teacher';
  avatarUrl: string;
  certificateName?: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  isAuthenticated: boolean;
  loginAt: string;
}
