import { Dispatch, Fragment, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MdClose } from "react-icons/md";
import Image from "next/future/image";
import useGetWindowDimensions from "@hooks/useGetWindowDimensions";

type Props = {
  children: React.ReactNode;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
};

const SlideOver: React.FC<Props> = ({ children, openState }) => {
  const [open, setOpen] = openState;
  const { height } = useGetWindowDimensions();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="aside" className="relative z-[101]" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-800/60 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              // This is a necessary style for iOS Safari's browser address bar to not cut the slide-over menu.
              style={{
                height: height || "100%",
              }}
              className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 backdrop-blur-md"
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-white hover:text-white"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <MdClose className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-y-scroll bg-white/80 py-6 shadow-xl dark:bg-neutral-900/80">
                    <div className="relative flex-1 px-4 sm:px-6">
                      <Image
                        src="/static/logo.png"
                        width={60}
                        height={60}
                        alt="T3 logo"
                        className="absolute left-6 top-0"
                      />

                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SlideOver;
