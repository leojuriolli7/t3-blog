import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col items-center gap-10 py-12 w-3/4 max-w-2xl mx-auto xl::w-2/4">
      <Header />
      {children}
    </div>
  );
};

export default MainLayout;
