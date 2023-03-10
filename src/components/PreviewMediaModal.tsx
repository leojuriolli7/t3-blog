import { MediaType } from "./AttachmentPreview";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";

type Props = {
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  media?: MediaType;
};

const PreviewMediaModal: React.FC<Props> = ({ openState, media }) => {
  return (
    <Modal openState={openState} alwaysCentered>
      <div className="overflow-hidden">
        <ShouldRender if={media?.type?.includes("image")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media?.url || "/static/default.jpg"}
            alt={media?.name}
            className="w-auto h-auto max-w-[60vw] max-h-[80vh]"
          />
        </ShouldRender>

        <ShouldRender if={media?.type?.includes("video")}>
          <video
            src={media?.url}
            className="w-auto h-auto max-w-[60vw] max-h-[80vh]"
            controls
            playsInline
            autoPlay
            muted
          />
        </ShouldRender>
      </div>
    </Modal>
  );
};

export default PreviewMediaModal;
