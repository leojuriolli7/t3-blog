type User = {
  email?: string | null;
  name?: string | null;
};

const getUserDisplayName = (user?: User | null) => {
  if (!!user?.name) return user?.name;

  if (!!user?.email) return user?.email;

  return undefined;
};

export default getUserDisplayName;
