import Header from "./Header";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <div className="flex flex-col items-center gap-10 py-12 w-11/12 max-w-2xl mx-auto">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
