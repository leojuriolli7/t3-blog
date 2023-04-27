import { Popover as HeadlessPopover, Transition } from "@headlessui/react";
import { Placement } from "@popperjs/core";
import clsx from "clsx";
import { useState } from "react";
import { usePopper } from "react-popper";

type Props = {
  icon: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  rounded?: boolean;
  className?: string;
  strategy?: "fixed" | "absolute";
};

const Popover: React.FC<Props> = ({
  icon,
  children,
  placement = "bottom",
  strategy = "absolute",
  className,
  rounded,
}) => {
  let [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement,
    strategy: strategy,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  return (
    <HeadlessPopover className="relative z-50 flex items-center">
      <HeadlessPopover.Button
        ref={(ref) => setReferenceElement(ref)}
        className={clsx(
          "inline-flex items-center gap-x-1 text-sm font-bold leading-6 text-gray-900",
          rounded && "rounded-full"
        )}
        aria-label="Open popover"
      >
        {icon}
      </HeadlessPopover.Button>

      <Transition
        enter="transition duration-75 ease-in"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <HeadlessPopover.Panel
          ref={(ref) => setPopperElement(ref)}
          style={styles.popper}
          {...attributes.popper}
          className="absolute left-1/2 z-10 flex w-screen max-w-max -translate-x-1/2 px-4"
        >
          <div className="w-fit rounded-md shadow dark:shadow-xl">
            <ul
              className={clsx(
                "flex flex-col rounded-md border border-neutral-300 bg-white/70 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/70",
                className
              )}
            >
              {children}
            </ul>
          </div>
        </HeadlessPopover.Panel>
      </Transition>
    </HeadlessPopover>
  );
};

export default Popover;
