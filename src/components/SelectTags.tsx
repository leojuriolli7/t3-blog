import React, { useCallback, useEffect, useRef, useState } from "react";
import Tag from "@components/Tag";
import { MdOutlineAdd } from "react-icons/md";
import type { FieldType } from "@utils/types";
import { Controller, useFormContext } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import TextInput from "./TextInput";

const CheckableTag = Tag;

type Props = {
  control: any;
  initialTags?: string[];
  initialSelectedTags?: string[];
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

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleChange = useCallback(
    (field: FieldType, tag: string) => (checked: boolean) => {
      const nextSelectedTags = checked
        ? [...selectedTags, tag]
        : selectedTags.filter((t) => t !== tag);

      setSelectedTags(nextSelectedTags);
      field.onChange(nextSelectedTags);
    },
    [selectedTags]
  );

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = useCallback(
    (field: FieldType) => () => {
      const trimmedInputValue = inputValue?.trim();
      const inputValueOnTagArray = tags.indexOf(trimmedInputValue);

      if (
        trimmedInputValue &&
        trimmedInputValue.length > 3 &&
        inputValueOnTagArray === -1
      ) {
        setTags([...tags, trimmedInputValue]);
        setSelectedTags([...selectedTags, trimmedInputValue]);
        field.onChange([...selectedTags, trimmedInputValue]);
      }

      if (inputValueOnTagArray !== -1) {
        setSelectedTags([...selectedTags, tags[inputValueOnTagArray]]);
      }

      setInputVisible(false);
      setInputValue("");
    },
    [inputValue, selectedTags, tags]
  );

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
          <div ref={parentRef} className="flex flex-wrap gap-2 mb-4 mt-2">
            {tags.map((tag) => (
              <CheckableTag
                key={tag}
                checked={selectedTags.includes(tag)}
                onChange={handleChange(field, tag)}
              >
                {tag}
              </CheckableTag>
            ))}
          </div>
          <div className="w-full relative">
            {inputVisible ? (
              <TextInput
                ref={inputRef}
                variant="primary"
                sizeVariant="lg"
                className="h-[46px]"
                type="text"
                maxLength={30}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputConfirm(field)}
                onPressEnter={handleInputConfirm(field)}
              />
            ) : (
              <Tag
                onClick={showInput}
                omitBgClass
                className="bg-white text-neutral-500 h-[46px] border-zinc-300 dark:border-neutral-800 p-3 w-full dark:bg-neutral-900"
              >
                create new tag
              </Tag>
            )}
            <button
              type="button"
              disabled={!inputValue}
              onClick={handleInputConfirm(field)}
              className="h-full px-5 absolute rounded-r-md right-0 bg-emerald-500 flex items-center justify-center hover:opacity-80 top-1/2 -translate-y-1/2"
              aria-label="Add new tag"
              title="Add new tag"
            >
              <MdOutlineAdd size={22} className="text-white" />
            </button>
          </div>
        </div>
      )}
    />
  );
};

export default SelectTags;
