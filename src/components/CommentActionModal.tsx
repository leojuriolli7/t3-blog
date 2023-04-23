import { CommentWithChildren } from "@utils/types";
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
      <div className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-lg px-4 pt-5 pb-4 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <ShouldRender if={!editing}>
          <Comment comment={parentComment} compact hideReplies hideActions />
        </ShouldRender>

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
