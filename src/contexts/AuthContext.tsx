import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types/hrm';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<UserRole, User> = {
  ADMIN: { id: '1', username: 'admin', email: 'admin@hrm.vn', role: 'ADMIN', fullName: 'Nguyễn Văn An' },
  HR: { id: '2', username: 'hr', email: 'hr@hrm.vn', role: 'HR', fullName: 'Trần Thị Bình' },
  MANAGER_TECH: { id: '3', username: 'manager', email: 'manager@hrm.vn', role: 'MANAGER_TECH', fullName: 'Lê Văn Cường' },
  FINANCE: { id: '4', username: 'finance', email: 'finance@hrm.vn', role: 'FINANCE', fullName: 'Phạm Thị Dung' },
  EMPLOYEE: { id: '5', username: 'employee', email: 'nv@hrm.vn', role: 'EMPLOYEE', fullName: 'Hoàng Văn Em' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('hrm_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const setAndPersistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('hrm_user', JSON.stringify(u));
    else localStorage.removeItem('hrm_user');
  }, []);

  const login = useCallback((username: string, _password: string, role: UserRole) => {
    setAndPersistUser(MOCK_USERS[role]);
    return true;
  }, [setAndPersistUser]);

  const logout = useCallback(() => setAndPersistUser(null), [setAndPersistUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
