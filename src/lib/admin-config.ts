// Admin Configuration
// Add email addresses that should automatically get admin access
export const ADMIN_EMAILS = [
  'shakthiprasad243@gmail.com', // Main admin email
  'admin@naveentextiles.com',
  'owner@naveentextiles.com',
  // Add more admin emails as needed
];

// Check if an email should have admin access
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// You can also add admin by domain if needed
export const ADMIN_DOMAINS: string[] = [
  // 'naveentextiles.com', // Uncomment to make all emails from this domain admin
];

export function isAdminDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? ADMIN_DOMAINS.includes(domain) : false;
}

export function shouldBeAdmin(email: string): boolean {
  return isAdminEmail(email) || isAdminDomain(email);
}