import MainLayout from "@components/MainLayout";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@components/LoginForm"), {
  ssr: false,
});

const LoginPage = () => {
  return (
    <MainLayout>
      <LoginForm />
    </MainLayout>
  );
};

export default LoginPage;
