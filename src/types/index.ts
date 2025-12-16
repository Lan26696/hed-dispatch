// 用户类型
export interface User {
  id: string;
  username: string;
  password: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: number;
  roleId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  role?: Role | null;
}

// 角色类型
export interface Role {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: number;
  createdAt: Date;
  updatedAt: Date | null;
  roleMenus?: RoleMenu[];
}

// 菜单类型
export interface Menu {
  id: number;
  parentId: number | null;
  name: string;
  path: string | null;
  icon: string | null;
  component: string | null;
  permission: string | null;
  type: number;
  visible: number;
  sort: number;
  status: number;
  createdAt: Date;
  updatedAt: Date | null;
  children?: Menu[];
}

// 角色菜单关联
export interface RoleMenu {
  roleId: number;
  menuId: number;
}
