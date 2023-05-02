import React, { useCallback, useEffect, useRef, useState } from "react";
import Tag from "@components/Tag";
import { MdOutlineAdd } from "react-icons/md";
import { CreateTagInput } from "@schema/tag.schema";
import type { FieldType, TagType } from "@utils/types";
import { Controller, useFormContext } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import TextInput from "./TextInput";
import UpsertTagModal from "./UpsertTagModal";

const CheckableTag = Tag;

type Props = {
  control: any;
  initialTags?: TagType[];
  initialSelectedTags?: TagType[];
  name: string;
  error?: any;
};

const SelectTags: React.FC<Props> = ({
  control,
  initialTags,
  initialSelectedTags,
  name,
  error,
}) => {
  const [containerRef] = useAutoAnimate();
  const [parentRef] = useAutoAnimate();

  const methods = useFormContext();
  const modalOpenState = useState(false);
  const [, setModalOpen] = modalOpenState;

  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickTag = useCallback(
    (field: FieldType, tag: TagType) => (checked: boolean) => {
      const nextSelectedTags = checked
        ? [...selectedTags, tag]
        : selectedTags.filter((t) => t.name !== tag.name);

      setSelectedTags(nextSelectedTags);
      field.onChange(nextSelectedTags);
    },
    [selectedTags]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onNewTagCreated = (field: FieldType) => (tag: CreateTagInput) => {
    field.onChange([...selectedTags, tag]);
    setTags((previous) => [...previous, tag]);
    setSelectedTags((previous) => [...previous, tag]);
    setInputValue("");
  };

  const handleInputConfirm = useCallback(() => {
    const trimmedInputValue = inputValue?.trim().toLowerCase();
    const inputValueOnTagArray = tags.findIndex(
      (tag) => tag.name.trim().toLowerCase() === trimmedInputValue
    );

    if (
      trimmedInputValue &&
      trimmedInputValue.length > 3 &&
      inputValueOnTagArray === -1
    ) {
      setModalOpen(true);
    }

    if (inputValueOnTagArray !== -1) {
      setSelectedTags([...selectedTags, tags[inputValueOnTagArray]]);
      setInputValue("");
    }
  }, [inputValue, selectedTags, setModalOpen, tags]);

  useEffect(() => {
    if (initialTags && !tags?.length) {
      setTags(initialTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTags]);

  useEffect(() => {
    if (initialSelectedTags && !selectedTags?.length) {
      setSelectedTags(initialSelectedTags);
      methods.setValue("tags", initialSelectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedTags]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div ref={containerRef}>
          <h2 className="text-2xl">Tags</h2>
          <ErrorMessage error={error} />
          <div ref={parentRef} className="mb-4 mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <CheckableTag
                key={tag.id}
                checked={selectedTags.includes(tag)}
                onChange={handleClickTag(field, tag)}
                tag={tag}
              />
            ))}
          </div>
          <div className="relative w-full">
            <TextInput
              ref={inputRef}
              variant="primary"
              placeholder="create new tag"
              sizeVariant="lg"
              className="h-[46px] rounded-md"
              type="text"
              maxLength={30}
              value={inputValue}
              onChange={handleInputChange}
              onPressEnter={handleInputConfirm}
            />
            <button
              type="button"
              disabled={!inputValue}
              onClick={handleInputConfirm}
              className="absolute right-0 top-1/2 flex h-full -translate-y-1/2 items-center justify-center rounded-r-md bg-emerald-500 px-5 hover:opacity-80"
              aria-label="Add new tag"
              title="Add new tag"
            >
              <MdOutlineAdd size={22} className="text-white" />
            </button>
          </div>

          <UpsertTagModal
            openState={modalOpenState}
            initialTagName={inputValue}
            onFinish={onNewTagCreated(field)}
          />
        </div>
      )}
    />
  );
};

export default SelectTags;
