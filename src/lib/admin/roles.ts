export type Role = 'admin' | 'owner' | 'sub';

export const ROLES: Role[] = ['admin', 'owner', 'sub'];

const RANK: Record<Role, number> = { admin: 3, owner: 2, sub: 1 };

export const can = (role: Role, min: Role) => RANK[role] >= RANK[min];

export const canManage = (actor: Role, target: Role) =>
  actor === 'admin' || (actor === 'owner' && target === 'sub');

export const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', owner: 'Owner', sub: 'Sub' };

export const ROLE_HINT: Record<Role, string> = {
  admin: 'Toàn quyền: liên hệ, mọi tài khoản và thiết bị',
  owner: 'Liên hệ, cùng tài khoản và thiết bị của Sub',
  sub: 'Xem và xử lý liên hệ',
};
