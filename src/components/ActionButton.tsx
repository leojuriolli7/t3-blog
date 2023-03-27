import React from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { MdClose } from "react-icons/md";

type Actions = "delete" | "edit" | "close";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  action: Actions;
};

const iconProps = {
  className: "text-emerald-500",
  size: 23,
};

const icons: Record<Actions, React.ReactNode> = {
  close: <MdClose {...iconProps} />,
  delete: <AiFillDelete {...iconProps} />,
  edit: <AiFillEdit {...iconProps} />,
};

const ActionButton: React.FC<Props> = (props) => {
  const { action } = props;

  return (
    <button
      {...props}
      className=" bg-teal-100 p-2 shadow-lg hover:opacity-70 dark:bg-teal-900"
    >
      {icons[action]}
    </button>
  );
};

export default ActionButton;
