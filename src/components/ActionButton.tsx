import React from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import ShouldRender from "./ShouldRender";

type Actions = "delete" | "edit" | "close";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  action: Actions;
};

const ActionButton: React.FC<Props> = (props) => {
  const { action } = props;

  return (
    <button
      {...props}
      className=" bg-teal-100 dark:bg-teal-900 p-2 shadow-lg hover:opacity-70"
    >
      <ShouldRender if={action === "delete"}>
        <AiFillDelete className=" text-emerald-500" size={23} />
      </ShouldRender>

      <ShouldRender if={action === "edit"}>
        <AiFillEdit className=" text-emerald-500" size={23} />
      </ShouldRender>

      <ShouldRender if={action === "close"}>
        <MdClose className=" text-emerald-500" size={23} />
      </ShouldRender>
    </button>
  );
};

export default ActionButton;
