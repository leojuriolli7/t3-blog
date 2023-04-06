import Field from "@components/Field";
import { useFormContext } from "react-hook-form";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import { UpdateUserInput } from "@schema/user.schema";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import isURL from "validator/lib/isURL";
import { Metadata, UserLink } from "@utils/types";
import UserLinkPreview from "./UserLinkPreview";
import { baseUrl } from "@utils/constants";
import TextInput from "@components/TextInput";

type Url = Metadata & {
  logo?: string | null;
};

type Props = {
  initialLink: UserLink;
};

const UserLinkField: React.FC<Props> = ({ initialLink }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");

  const { setValue, formState, watch } = useFormContext<UpdateUserInput>();
  const formError = formState.errors.url;

  const currentMetadata = watch("url");

  const { error, isLoading } = trpc.useQuery(
    ["scraper.scrape-link", { url: link }],
    {
      refetchOnWindowFocus: false,
      enabled: !!link,
      onSettled: (data, error) => {
        if (error || !data?.url) {
          setValue("url", undefined, { shouldValidate: true });
        }

        if (!!data?.url) {
          const result = data as Url;

          const dataToSend = {
            icon:
              result?.logo || result?.image || `${baseUrl}/static/default.jpg`,
            title: result?.title || "Shared link",
            url: result.url,
            ...(result?.publisher && {
              publisher: result?.publisher,
            }),
          };

          setValue("url", dataToSend, { shouldValidate: true });
        }
      },
    }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    const isValidLink = isURL(newLink);

    // User clearing up input: should clear form and link value.
    if (newLink === "") {
      setValue("url", undefined, { shouldValidate: true });
      return setLink(newLink);
    }

    if (isValidLink) {
      return setLink(newLink);
    }

    // Invalid link: should clear input, form value & link value.
    if (!isValidLink) {
      toast.error("Invalid link");
      setValue("url", undefined, { shouldValidate: true });
      setLink("");
      if (inputRef?.current) inputRef.current.value = "";
    }
  };

  const onChange = debounce(handleChange, 500);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (initialLink) {
      setValue("url", initialLink, { shouldValidate: true });
      setLink(initialLink?.url);
      if (inputRef?.current) inputRef.current.value = initialLink?.url;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLink]);

  return (
    <div>
      <Field label="your link" error={formError as any}>
        <TextInput
          defaultValue=""
          type="text"
          placeholder="link will be highlighted on your profile"
          ref={inputRef}
          onChange={onChange}
          disabled={isLoading}
        />
      </Field>

      <UserLinkPreview data={currentMetadata} />
    </div>
  );
};

export default UserLinkField;
