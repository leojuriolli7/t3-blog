import { trpc } from "@utils/trpc";
import debounce from "lodash.debounce";
import { useFormContext } from "react-hook-form";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Field from "./Field";
import isURL from "validator/lib/isURL";
import ShouldRender from "./ShouldRender";
import { CreatePostInput, UpdatePostInput } from "@schema/post.schema";
import LinkPreview from "./LinkPreview";
import { Link as LinkType } from "@prisma/client";

type Props = {
  initialLink?: LinkType | null;
};

const Link: React.FC<Props> = ({ initialLink }) => {
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

  useEffect(() => {
    if (initialLink) {
      setValue("link", initialLink, { shouldValidate: true });
      setLink(initialLink?.url);
      if (inputRef?.current) inputRef.current.value = initialLink?.url;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLink]);

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
