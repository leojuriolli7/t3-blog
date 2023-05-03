import { TagWithPosts } from "@utils/types";
import CompactCard from "./CompactCard";
import Image from "./Image";
import Section from "./Section";

type Props = {
  loading: boolean;
  tag?: TagWithPosts;
};

type TitleProps = {
  name?: string;
  description?: string;
  avatar?: string;
};

const SectionHeader = ({ name, description, avatar }: TitleProps) => {
  return (
    <div className="flex gap-2">
      <Image
        src={avatar}
        width={64}
        height={64}
        className="h-[64px] w-[64px] rounded-full"
        alt={`${name} avatar`}
      />
      <div>
        <h2 className="prose line-clamp-1 text-ellipsis text-2xl font-bold dark:prose-invert">
          {name}
        </h2>

        <p className="prose line-clamp-2 text-ellipsis leading-6 dark:prose-invert">
          {description}
        </p>
      </div>
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
