export const isCustomerAccount = (apiRoles: string[]): boolean =>
  apiRoles.some((role) => role.toLowerCase() === 'user');

export const isStaffAccount = (apiRoles: string[]): boolean =>
  apiRoles.some((role) => role.toLowerCase() === 'admin');
