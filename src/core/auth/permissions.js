// Capacidades por rol. Un solo lugar para la lógica de permisos.
export const ROLES = { ADMIN: 'admin', GESTOR: 'gestor', REVISOR: 'revisor' }

const abilities = {
  admin: ['reports:read', 'reports:write', 'reports:delete', 'users:manage'],
  gestor: ['reports:read', 'reports:write', 'reports:delete'],
  revisor: ['reports:read'],
}

export function can(role, action) {
  return abilities[role]?.includes(action) ?? false
}
