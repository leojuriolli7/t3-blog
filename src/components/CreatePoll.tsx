import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CreatePostInput } from "@schema/post.schema";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import { useFormContext } from "react-hook-form";
import { PollOption } from "@prisma/client";
import { MdOutlineAdd } from "react-icons/md";
import ActionButton from "./ActionButton";
import Field from "./Field";
import ShouldRender from "./ShouldRender";
import TextInput from "./TextInput";

type Option = Pick<PollOption, "title" | "color">;

function getRandomColor() {
  var letters = "0123456789ABCDEF".split("");
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

const CreatePoll: React.FC = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [title, setTitle] = useState<string>("");
  const [currentOption, setCurrentOption] = useState<Option | null>(null);

  const { setValue, formState } = useFormContext<CreatePostInput>();
  const { errors } = formState;

  const [itemsListRef] = useAutoAnimate();
  const [inputsParentRef] = useAutoAnimate();
  const optionInputRef = useRef<HTMLInputElement>(null);

  const onTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value?.trim());
  }, []);

  const debouncedTitleChange = debounce(onTitleChange);

  const addNewOption = useCallback(() => {
    if (!!currentOption?.title?.trim()) {
      if (options?.length === 6) {
        toast.error("Maximum of 6 options per poll.");
      } else {
        setOptions((options) => [...options, currentOption]);
        setCurrentOption(null);
      }

      if (optionInputRef?.current) {
        optionInputRef.current.value = "";
      }
    }
  }, [setCurrentOption, currentOption, options]);

  const onNewOptionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const randomColor = getRandomColor();

    const newOption = {
      title: e.target.value,
      color: randomColor,
    };

    setCurrentOption(newOption);
  }, []);

  const deleteOption = useCallback(
    (option: Option) => () =>
      setOptions((prev) => prev.filter((item) => item.color !== option.color)),
    [setOptions]
  );

  useEffect(() => {
    if (!title) {
      setOptions([]);
      setCurrentOption(null);
      setValue("poll", undefined, { shouldValidate: true });
    }
  }, [title, setValue]);

  useEffect(() => {
    setValue("poll.options", options, { shouldValidate: true });
  }, [options, setValue]);

  useEffect(() => {
    setValue("poll.title", title, { shouldValidate: true });
  }, [title, setValue]);

  return (
    <Field
      label="Poll"
      description="Let users vote on their preferred option."
      error={errors?.poll as any}
    >
      <div ref={inputsParentRef}>
        <TextInput
          variant="primary"
          sizeVariant="lg"
          type="text"
          placeholder="poll title/question"
          className="w-full rounded-md border-[1px] border-zinc-300 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
          onChange={debouncedTitleChange}
        />

        <ShouldRender if={!!title}>
          <div className="relative mt-3 w-full">
            <TextInput
              variant="primary"
              sizeVariant="lg"
              type="text"
              placeholder="new option"
              className="w-full rounded-md border-[1px] border-zinc-300 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
              onPressEnter={addNewOption}
              onChange={onNewOptionChange}
              ref={optionInputRef}
            />
            <button
              type="button"
              className="absolute right-0 top-1/2 flex h-full -translate-y-1/2 items-center justify-center rounded-r-md bg-emerald-500 px-5 hover:opacity-80"
              aria-label="Add poll option"
              title="Add poll option"
              onClick={addNewOption}
              disabled={!currentOption?.title?.trim()}
            >
              <MdOutlineAdd size={22} className="text-white" />
            </button>
          </div>

          <div ref={itemsListRef} className="mt-2 flex w-full flex-col gap-2">
            {options?.map((option) => (
              <div
                className="flex w-full justify-between gap-3"
                key={option.title}
              >
                <div
                  className="w-full max-w-[500px] p-2"
                  style={{
                    backgroundColor: `${option.color}90`,
                  }}
                >
                  <p className="line-clamp-1 overflow-hidden text-ellipsis break-all text-sm sm:text-base">
                    {option.title}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue={option.color}
                    onChange={(e) => {
                      const items = [...options];
                      const itemIndex = options.findIndex(
                        (value) => value.color === option.color
                      );
                      const item = options[itemIndex];

                      if (!!item) {
                        item.color = e.target.value;
                        items[itemIndex] = item;

                        setOptions(items);
                      }
                    }}
                  />
                  <ActionButton
                    action="delete"
                    onClick={deleteOption(option)}
                    type="button"
                  />
                </div>
              </div>
            ))}
          </div>
        </ShouldRender>
      </div>
    </Field>
  );
};

export default CreatePoll;
