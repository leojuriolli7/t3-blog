import { InferQueryOutput } from "@utils/types";
import { createContext, useContext } from "react";

// Infer type from query

const UserContext = createContext<InferQueryOutput<"users.me">>(null);

function UserContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: InferQueryOutput<"users.me"> | undefined;
}) {
  return (
    <UserContext.Provider value={value || null}>
      {children}
    </UserContext.Provider>
  );
}

const useUserContext = () => useContext(UserContext);

export { useUserContext, UserContextProvider };
