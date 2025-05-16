// utils/abilities.ts
import { defineAbility } from 'nuxt-authorization';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
};

// 验证用户是否已认证
export const isAuthenticated = defineAbility((user: User | null) => {
  return Boolean(user);
});

// 验证用户是否为管理员
export const isAdmin = defineAbility((user: User | null) => {
  return user?.role === 'admin';
});

// 验证用户是否拥有特定权限
export const hasPermission = defineAbility(
  (user: User | null, permission: string) => {
    return user?.permissions.includes(permission);
  }
);