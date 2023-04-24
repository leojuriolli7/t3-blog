import Header from "./Header";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <div className="mx-auto flex w-11/12 max-w-2xl flex-col items-center gap-10 py-12">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
