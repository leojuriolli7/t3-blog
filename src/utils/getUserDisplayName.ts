import { User } from "next-auth";

const getUserDisplayName = (user?: User | null) => {
  if (!!user?.name) return user?.name;

  if (!!user?.email) return user?.email;

  return undefined;
};

export default getUserDisplayName;
