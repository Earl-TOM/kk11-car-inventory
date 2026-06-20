const BOOTSTRAP_ADMIN_EMAIL = "thomas.lifuti@gmail.com";

export async function isAdminUser(user: { id: string; email: string }) {
  return Boolean(user?.id && user?.email);
}

export { BOOTSTRAP_ADMIN_EMAIL };