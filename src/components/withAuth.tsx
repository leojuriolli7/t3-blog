import React from "react";
import { NextComponentType } from "next";
import Error from "next/error";
import ShouldRender from "./ShouldRender";
import { useSession } from "next-auth/react";

function withAuth(Component: NextComponentType) {
  const NotAuthorized = () => <Error statusCode={401} title="Not Authorized" />;

  const Auth = () => {
    const { data: session } = useSession();

    return (
      <>
        <ShouldRender if={session?.user}>
          <Component />
        </ShouldRender>
        <ShouldRender if={!session?.user}>
          <NotAuthorized />
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
