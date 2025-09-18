import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

interface RoleContextType {
  userRole: UserRole | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  canAccessFinancial: () => boolean;
  canManageUsers: () => boolean;
  canManageProducts: () => boolean;
  canProcessSales: () => boolean;
}

export type Permission = 
  | 'view_dashboard'
  | 'manage_products' 
  | 'process_sales'
  | 'view_reports'
  | 'manage_users'
  | 'view_financial'
  | 'manage_suppliers'
  | 'manage_stock'
  | 'access_settings';

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_products',
    'process_sales',
    'view_reports',
    'manage_users',
    'view_financial',
    'manage_suppliers',
    'manage_stock',
    'access_settings'
  ],
  manager: [
    'view_dashboard',
    'manage_products',
    'process_sales',
    'view_reports',
    'view_financial',
    'manage_suppliers',
    'manage_stock'
  ],
  operator: [
    'view_dashboard',
    'process_sales',
    'view_reports',
    'manage_stock'
  ],
  viewer: [
    'view_dashboard',
    'view_reports'
  ]
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      // Try to get role from user metadata first
      const role = user?.user_metadata?.role || user?.app_metadata?.role;
      
      if (role && Object.keys(rolePermissions).includes(role)) {
        setUserRole(role as UserRole);
      } else {
        // Default role for new users
        setUserRole('operator');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('operator'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return rolePermissions[userRole].includes(permission);
  };

  const isAdmin = (): boolean => userRole === 'admin';
  const isManager = (): boolean => userRole === 'manager' || isAdmin();
  const canAccessFinancial = (): boolean => hasPermission('view_financial');
  const canManageUsers = (): boolean => hasPermission('manage_users');
  const canManageProducts = (): boolean => hasPermission('manage_products');
  const canProcessSales = (): boolean => hasPermission('process_sales');

  const value = {
    userRole,
    loading,
    hasPermission,
    isAdmin,
    isManager,
    canAccessFinancial,
    canManageUsers,
    canManageProducts,
    canProcessSales
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};