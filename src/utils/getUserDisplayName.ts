type User = {
  email?: string | null;
  name?: string | null;
};

/**
 * Get the user display name - Either their name, or their e-mail.
 */
const getUserDisplayName = (user?: User | null) => {
  if (!!user?.name) return user?.name;

  if (!!user?.email) return user?.email;

  return undefined;
};

export default getUserDisplayName;
