import React from "react";
import { NextComponentType } from "next";
import Error from "next/error";
import { useUserContext } from "src/context/user.context";
import ShouldRender from "./ShouldRender";

function withAuth(Component: NextComponentType) {
  const NotAuthorized = () => <Error statusCode={401} title="Not Authorized" />;

  const Auth = () => {
    const user = useUserContext();

    return (
      <>
        <ShouldRender if={user}>
          <Component />
        </ShouldRender>
        <ShouldRender if={!user}>
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
