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
    setTitle(e.target.value);
  }, []);

  const debouncedTitleChange = debounce(onTitleChange);

  const addNewOption = useCallback(() => {
    if (!!currentOption) {
      if (options?.length > 6) {
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
        <input
          type="text"
          placeholder="poll title/question"
          className="bg-white border-zinc-300 border-[1px] dark:border-neutral-800 p-3 w-full dark:bg-neutral-900"
          onChange={debouncedTitleChange}
        />

        <ShouldRender if={!!title}>
          <div className="w-full relative mt-3">
            <input
              type="text"
              placeholder="new option"
              className="bg-white border-zinc-300 border-[1px] dark:border-neutral-800 p-3 w-full dark:bg-neutral-900"
              onChange={onNewOptionChange}
              ref={optionInputRef}
            />
            <button
              type="button"
              className="h-full px-5 absolute right-0 bg-emerald-500 flex items-center justify-center hover:opacity-80 top-1/2 -translate-y-1/2"
              aria-label="Add poll option"
              title="Add poll option"
              onClick={addNewOption}
              disabled={!currentOption}
            >
              <MdOutlineAdd size={22} className="text-white" />
            </button>
          </div>

          <div ref={itemsListRef} className="mt-2 flex w-full flex-col gap-2">
            {options?.map((option) => (
              <div
                className="w-full flex justify-between gap-3"
                key={option.title}
              >
                <div
                  className="w-full max-w-[500px] p-2"
                  style={{
                    backgroundColor: `${option.color}90`,
                  }}
                >
                  <p className="text-ellipsis line-clamp-1 overflow-hidden break-all text-sm sm:text-base">
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
