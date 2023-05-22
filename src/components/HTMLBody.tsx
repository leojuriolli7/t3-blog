import ShouldRender from "./ShouldRender";
import Skeleton, { SkeletonProps } from "./Skeleton";

type Props = SkeletonProps & {
  children?: string;
  className?: string;
  loading?: boolean;
  style?: React.CSSProperties;
};

/**
 * This component receives HTML and renders it on the page.
 *
 *  It is intended to be used to render a post or a comment's body,
 *  which is parsed from markdown into HTML in the server. (tRPC router)
 */
const HTMLBody: React.FC<Props> = ({
  children,
  className,
  loading,
  style,
  ...props
}) => {
  return (
    <>
      <ShouldRender if={loading}>
        <Skeleton {...props} />
      </ShouldRender>

      <ShouldRender if={!loading}>
        <div
          style={style || {}}
          className={`${className} markdown__content word-break-word prose-emerald dark:prose-invert dark:prose-hr:border-neutral-700`}
          dangerouslySetInnerHTML={{ __html: children || "" }}
        />
      </ShouldRender>
    </>
  );
};

export default HTMLBody;
