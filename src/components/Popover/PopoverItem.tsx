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
      className="cursor-pointer bg-inherit p-4 hover:opacity-60 dark:hover:opacity-100 dark:hover:brightness-125"
      onClick={onClick || undefined}
    >
      <div className="text-left">
        <div className={`flex w-full gap-${gap || "3"}`}>
          <p className="text-lg font-medium leading-6 text-black dark:text-white">
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
