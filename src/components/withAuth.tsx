import React, { useEffect } from "react";
import { NextComponentType } from "next";
import ShouldRender from "./ShouldRender";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function withAuth(Component: NextComponentType) {
  const Auth = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "unauthenticated") router.push("/api/auth/signin");
    }, [status, router]);

    return (
      <>
        <ShouldRender if={session?.user}>
          <Component />
        </ShouldRender>
      </>
    );
  };

  if (Component.getInitialProps) {
    Auth.getInitialProps = Component.getInitialProps;
  }

  return Auth;
}

export default withAuth;
