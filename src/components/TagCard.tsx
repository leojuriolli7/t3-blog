import * as HoverCard from "@radix-ui/react-hover-card";
import { TagType } from "@utils/types";
import Image from "@components/Image";
import Link from "next/link";
import ShouldRender from "./ShouldRender";

type Props = {
  children: React.ReactNode;
  tag?: TagType;
};

export const TagCard: React.FC<Props> = ({ children, tag }) => {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="w-72 origin-hover-card rounded-md border border-zinc-300 bg-white/80 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] backdrop-blur-2xl data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade  data-[state=open]:transition-all dark:border-zinc-800 dark:bg-zinc-950/50"
          sideOffset={5}
          collisionPadding={{
            top: 0,
            bottom: 0,
            left: 20,
            right: 20,
          }}
        >
          <div>
            <ShouldRender if={!!tag?.backgroundImage}>
              <Image
                className="h-32 w-full rounded-t-md object-cover"
                src={tag?.backgroundImage as string}
                alt={`${tag?.name} background`}
                width={288}
                height={128}
              />
            </ShouldRender>
            <div className="relative -mt-1 p-3">
              <ShouldRender if={!!tag?.avatar}>
                <Image
                  width={56}
                  height={56}
                  src={tag?.avatar as string}
                  alt={`${tag?.name} avatar`}
                  className="absolute -top-4 left-2 h-14 w-14 rounded-full object-cover"
                />
              </ShouldRender>
              <Link
                href={`/posts/tags/${tag?.id}`}
                className="prose ml-[59px] text-lg font-bold dark:prose-invert hover:underline"
              >
                {tag?.name}
              </Link>
              <div className="prose mt-2 line-clamp-4 text-ellipsis text-sm dark:prose-invert">
                {tag?.description}
              </div>
              {/* <div className="mt-1 flex gap-1 text-base">
                <span className="font-bold">290</span> <span>Subscribers</span>
              </div> */}
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
