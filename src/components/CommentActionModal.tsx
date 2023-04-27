import type { CommentWithChildren } from "@utils/types";
import { Dispatch, SetStateAction } from "react";
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

const CommentActionModal: React.FC<Props> = ({
  openState,
  parentComment,
  editing,
}) => {
  const [, setOpen] = openState;

  const closeModal = () => setOpen(false);

  return (
    <Modal openState={openState} alwaysCentered>
      <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 shadow-xl dark:bg-zinc-900 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <ShouldRender if={!editing}>
          <Comment comment={parentComment} compact hideReplies hideActions />
        </ShouldRender>

        <div className="mt-5 w-full">
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
