import { CommentWithChildren } from "@utils/types";
import { Dispatch, SetStateAction } from "react";
import { MdClose } from "react-icons/md";
import Comment from "./Comment";
import CommentField from "./CommentField";
import EditCommentForm from "./EditCommentForm";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";

type Props = {
  parentComment?: CommentWithChildren;
  editing?: boolean;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
};

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute z-[3] rounded-full top-0 right-0 p-2 bg-emerald-500 dark:bg-teal-900"
  >
    <MdClose className="w-5 h-5 text-white" />
  </button>
);

const CommentActionModal: React.FC<Props> = ({
  openState,
  parentComment,
  editing,
}) => {
  const [, setOpen] = openState;

  const closeModal = () => setOpen(false);

  return (
    <Modal openState={openState} alwaysCentered>
      <div className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <CloseButton onClick={closeModal} />

        <Comment comment={parentComment} compact hideReplies hideActions />

        <div className="w-full mt-5">
          <ShouldRender if={!editing}>
            <CommentField
              parentId={parentComment?.id}
              onCommented={closeModal}
            />
          </ShouldRender>

          <ShouldRender if={editing}>
            <EditCommentForm comment={parentComment} onFinish={closeModal} />
          </ShouldRender>
        </div>
      </div>
    </Modal>
  );
};

export default CommentActionModal;
