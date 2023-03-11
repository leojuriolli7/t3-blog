import ShouldRender from "@components/ShouldRender";

type ItemProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gap?: string;
  onClick?: () => void;
};

const PopoverItem: React.FC<ItemProps> = ({
  title,
  subtitle,
  icon,
  gap,
  onClick,
}) => {
  return (
    <li
      className="hover:opacity-60 dark:hover:brightness-125 dark:hover:opacity-100 bg-inherit p-4 cursor-pointer"
      onClick={onClick || undefined}
    >
      <div className="text-left">
        <div className={`flex w-full gap-${gap || "3"}`}>
          <p className="text-lg text-black dark:text-white font-medium leading-6">
            {title}
          </p>
          <ShouldRender if={icon}>{icon}</ShouldRender>
        </div>
        <ShouldRender if={subtitle}>
          <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
        </ShouldRender>
      </div>
    </li>
  );
};

export default PopoverItem;
