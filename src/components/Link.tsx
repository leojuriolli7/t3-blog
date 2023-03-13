import { trpc } from "@utils/trpc";
import debounce from "lodash.debounce";
import { useFormContext } from "react-hook-form";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Field from "./Field";
import { Metadata } from "@utils/types";
import isURL from "validator/lib/isURL";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";
import PreviewMediaModal from "./PreviewMediaModal";
import { IoExpandOutline } from "react-icons/io5";
import { CreatePostInput, UpdatePostInput } from "@schema/post.schema";

type Props = {
  data?: Metadata;
  loading: boolean;
};

const LinkPreview: React.FC<Props> = ({ data, loading }) => {
  const previewModalState = useState(false);
  const [, setIsOpen] = previewModalState;
  const hasImageToShow = !!data?.image;

  const openModal = useCallback(() => {
    if (hasImageToShow) {
      setIsOpen(true);
    }
  }, [hasImageToShow, setIsOpen]);

  const media = {
    name: data?.title || "Image",
    url: data?.image,
    type: "image",
  };

  return (
    <>
      <div>
        <div className="flex gap-4 w-full bg-white dark:bg-neutral-900 shadow-sm border-2 border-zinc-300 dark:border-neutral-700">
          <ShouldRender if={!!data && !loading}>
            <div onClick={openModal} className="relative group flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={data?.title || "Shared link"}
                src={data?.image || "/static/default.jpg"}
                className={`aspect-square ${
                  hasImageToShow ? "group-hover:opacity-50 cursor-pointer" : ""
                } w-36 flex-shrink-0 object-cover`}
              />
              <ShouldRender if={hasImageToShow}>
                <IoExpandOutline
                  size={36}
                  className="text-white cursor-pointer hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </ShouldRender>
            </div>
          </ShouldRender>

          <ShouldRender if={loading}>
            <Skeleton
              width="aspect-square w-36 flex-shrink-0"
              height="h-full"
            />
          </ShouldRender>
          <div className="py-3 pr-2 w-full flex flex-col justify-between">
            <ShouldRender if={!loading}>
              <div className="w-full">
                <p className="line-clamp-1 break-all font-bold">
                  {data?.title || "Shared link"}
                </p>
                <p className="line-clamp-3 text-sm break-all">
                  {data?.description || "Link shared on T3 Blog."}
                </p>
              </div>
              <a
                className="line-clamp-1 text-sm mt-1 break-all underline dark:text-emerald-500 text-emerald-700"
                target="_blank"
                rel="noreferrer"
                href={data?.url}
              >
                {data?.url}
              </a>
            </ShouldRender>

            <ShouldRender if={loading}>
              <Skeleton heading width="w-[50%]" />
              <Skeleton lines={2} width="w-full" className="mt-3" />
              <Skeleton width="w-12" className="mt-3" />
            </ShouldRender>
          </div>
        </div>
      </div>
      <PreviewMediaModal openState={previewModalState} media={media} />
    </>
  );
};

const Link = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const { setValue, formState } = useFormContext<
    CreatePostInput | UpdatePostInput
  >();
  const formError = formState.errors.link;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    const isValidLink = isURL(newLink);

    // User clearing up input: should clear form and link value.
    if (newLink === "") {
      setValue("link", undefined, { shouldValidate: true });
      return setLink(newLink);
    }

    if (isValidLink) {
      return setLink(newLink);
    }

    // Invalid link: should clear input, form value & link value.
    if (!isValidLink) {
      toast.error("Invalid link");
      setValue("link", undefined, { shouldValidate: true });
      setLink("");
      if (inputRef?.current) inputRef.current.value = "";
    }
  };

  const onChange = debounce(handleChange, 500);

  const {
    data: metadata,
    error,
    isLoading,
  } = trpc.useQuery(["scraper.scrape-link", { url: link }], {
    refetchOnWindowFocus: false,
    enabled: !!link,
    onSettled: (data, error) => {
      if (error || !data?.url) {
        setValue("link", undefined, { shouldValidate: true });
      }

      if (data?.url) {
        const dataToSend = {
          image:
            data?.image || "https://t3-blog-pi.vercel.app/static/default.jpg",
          title: data?.title || "Shared link",
          url: data.url,
          description: data?.description || "Link shared on T3 blog.",
          ...(data?.publisher && {
            publisher: data?.publisher,
          }),
        };

        setValue("link", dataToSend, { shouldValidate: true });
      }
    },
  });

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  return (
    <div className="flex flex-col w-full gap-3">
      <Field
        label="Link"
        description="By adding a link to your post, the link will be highlighted on the post."
        error={formError as any}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={isLoading}
          onChange={onChange}
          placeholder="Paste your link"
          className="bg-white border-zinc-300 border-[1px] dark:border-neutral-800 p-3 w-full dark:bg-neutral-900 disabled:opacity-70"
        />
      </Field>
      <ShouldRender if={!!metadata || isLoading}>
        <LinkPreview loading={isLoading} data={metadata} />
      </ShouldRender>
    </div>
  );
};

export default Link;
