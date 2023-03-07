import Link from "next/link";
import { useCallback, useState } from "react";
import { MdDelete, MdEditNote, MdOutlineTextSnippet } from "react-icons/md";
import EditAccountModal from "./EditAccountModal";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";

type Props = {
  onClickDeleteAccount: () => void;
  userCanEditAccount: boolean;
};

type ItemProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gap?: string;
  onClick?: () => void;
};

const PopupListItem: React.FC<ItemProps> = ({
  title,
  subtitle,
  icon,
  gap,
  onClick,
}) => {
  return (
    <li
      className="hover:opacity-60 dark:hover:brightness-125 dark:hover:opacity-100 bg-inherit p-4"
      onClick={onClick || undefined}
    >
      <div className="text-left">
        <div className={`flex w-full gap-${gap || "3"}`}>
          <p className="text-lg text-black dark:text-white font-medium leading-6">
            {title}
          </p>
          {icon}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
    </li>
  );
};

const UserPopupContent: React.FC<Props> = ({
  onClickDeleteAccount,
  userCanEditAccount,
}) => {
  const isModalOpen = useState(false);
  const [, setIsModalOpen] = isModalOpen;

  const openModal = useCallback(() => setIsModalOpen(true), [setIsModalOpen]);

  return (
    <>
      <div className="w-fit shadow dark:shadow-xl">
        <ul className="flex flex-col gap-1 bg-white border border-neutral-300 dark:border-none dark:bg-neutral-900">
          <ShouldRender if={userCanEditAccount}>
            <PopupListItem
              title="Edit account"
              icon={<MdEditNote size={21} className="text-emerald-500" />}
              subtitle="Give yourself a name!"
              onClick={openModal}
            />
          </ShouldRender>

          <PopupListItem
            title="Delete account"
            gap="1"
            icon={<MdDelete size={18} className="text-emerald-500" />}
            subtitle="Delete your account."
            onClick={onClickDeleteAccount}
          />

          <Link href="/terms/conduct">
            <PopupListItem
              title="Code of conduct"
              gap="2"
              icon={
                <MdOutlineTextSnippet size={16} className="text-emerald-500" />
              }
              subtitle="Read our code of conduct."
            />
          </Link>

          <Link href="/terms/privacy">
            <PopupListItem
              title="Privacy Policy"
              gap="2"
              icon={
                <MdOutlineTextSnippet size={16} className="text-emerald-500" />
              }
              subtitle="Read our privacy terms."
            />
          </Link>
        </ul>
      </div>

      <Modal openState={isModalOpen}>
        <EditAccountModal onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default UserPopupContent;
