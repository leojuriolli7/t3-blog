type Props = {
  title: string;
  active: boolean;
  onClick: () => void;
  label: string;
};

const Tab: React.FC<Props> = (props) => {
  const { active, label, onClick, title } = props;

  return (
    <button title={title}>
      <p
        className={`${
          active ? "border-b-2 border-black dark:border-white" : ""
        } cursor-pointer hover:opacity-80`}
        onClick={onClick}
      >
        {label}
      </p>
    </button>
  );
};

export default Tab;
