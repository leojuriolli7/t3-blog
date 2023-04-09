import Header from "./Header";
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

// TO-DO: Make sidebar responsive on smaller screens.
const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="relative flex justify-center gap-5 w-full max-w-5xl mx-auto">
      <Sidebar />
      <div className="flex flex-col items-center gap-10 py-12 w-11/12 max-w-2xl">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
