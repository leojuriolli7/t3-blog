import { TagWithPosts } from "@utils/types";
import CompactCard from "./CompactCard";
import Image from "./Image";
import Section from "./Section";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";

type Props = {
  loading: boolean;
  tag?: TagWithPosts;
};

type TitleProps = {
  name?: string;
  description?: string;
  avatar?: string;
  loading?: boolean;
};

const SectionHeader = ({ name, description, avatar, loading }: TitleProps) => {
  return (
    <div className="flex w-full gap-2">
      <Image
        src={avatar}
        isLoading={loading}
        width={60}
        height={60}
        className="h-12 w-12 flex-shrink-0 rounded-full xs:h-[60px] xs:w-[60px]"
        alt={`${name} avatar`}
      />

      <ShouldRender if={!loading}>
        <div>
          <h2 className="prose line-clamp-1 text-ellipsis text-xl dark:prose-invert xs:text-2xl">
            {name}
          </h2>

          <p className="line-clamp-2 text-ellipsis text-sm leading-5 text-zinc-600 dark:text-zinc-400 xs:text-base">
            {description}
          </p>
        </div>
      </ShouldRender>

      <ShouldRender if={loading}>
        <div className="flex w-full flex-col justify-center">
          <Skeleton heading width="w-[160px]" />
          <Skeleton width="w-[200px]" className="mt-2" />
        </div>
      </ShouldRender>
    </div>
  );
};

export const TagSection: React.FC<Props> = ({ loading, tag }) => {
  return (
    <Section
      loading={loading}
      title={
        <SectionHeader
          name={tag?.name}
          description={tag?.description}
          avatar={tag?.avatar}
          loading={loading}
        />
      }
      seeMoreHref={`/posts/tags/${tag?.id}`}
    >
      {loading ? (
        <CompactCard loading slide />
      ) : (
        tag?.posts?.map((post, key) => (
          <CompactCard
            loading={loading}
            key={loading ? key : `${tag?.id}-${post?.id}`}
            post={post}
            slide
          />
        ))
      )}
    </Section>
  );
};
