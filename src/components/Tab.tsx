type Props = {
  title?: string;
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
};

const Tab: React.FC<Props> = (props) => {
  const { active, label, onClick, title, className = "" } = props;

  return (
    <button title={title} onClick={onClick}>
      <p
        className={`${
          active ? "border-b-2 border-black dark:border-white" : ""
        } cursor-pointer hover:opacity-80 ${className}`}
      >
        {label}
      </p>
    </button>
  );
};

export default Tab;
