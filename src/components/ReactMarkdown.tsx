import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ShouldRender from "./ShouldRender";
import Skeleton, { SkeletonProps } from "./Skeleton";

type Props = SkeletonProps & {
  children?: string;
  className?: string;
  loading?: boolean;
};

const CustomReactMarkdown: React.FC<Props> = ({
  children,
  className,
  loading,
  ...props
}) => {
  return (
    <>
      <ShouldRender if={loading}>
        <Skeleton {...props} />
      </ShouldRender>

      <ShouldRender if={!loading}>
        <ReactMarkdown
          className={`${className} prose-emerald markdown__content dark:prose-invert break-words`}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {children || ""}
        </ReactMarkdown>
      </ShouldRender>
    </>
  );
};

export default CustomReactMarkdown;
