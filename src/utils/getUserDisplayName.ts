import { User } from "@prisma/client";
import { User as UserType } from "./types";
import { User as AuthUser } from "next-auth";

const getUserDisplayName = (user?: User | UserType | AuthUser | null) => {
  if (!!user?.name) return user?.name;

  if (!!user?.email) return user?.email;

  return undefined;
};

export default getUserDisplayName;
