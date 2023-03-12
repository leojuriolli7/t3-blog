import { ChangeEvent } from "react";
import { HiSearch } from "react-icons/hi";

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
};

const SearchInput: React.FC<Props> = ({ onChange, placeholder }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <HiSearch className="text-gray-500 dark:text-gray-400" size={20} />
      </div>
      <input
        onChange={onChange}
        type="text"
        className="bg-gray-50 border border-gray-300 dark:border-neutral-600 text-gray-900 text-md rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3  dark:bg-neutral-800 dark:neutral-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
        placeholder={placeholder}
        required
        title={placeholder}
      />
    </div>
  );
};

export default SearchInput;
