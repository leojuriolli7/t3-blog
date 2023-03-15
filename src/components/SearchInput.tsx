import { useRouter } from "next/router";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { HiSearch } from "react-icons/hi";
import debounce from "lodash.debounce";

type Props = {
  setQuery: Dispatch<SetStateAction<string>>;
  placeholder: string;
};

const SearchInput: React.FC<Props> = ({ setQuery, placeholder }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const onChange = useCallback(
    (value: string) => {
      setQuery(value);

      router.replace({
        query: {
          q: value,
        },
      });
    },
    [setQuery, router]
  );

  const handleChange = debounce(onChange, 500);

  // If there is a query parameter (?q=...) when the page
  // first opens, we set is as the query.
  useEffect(() => {
    if (router.isReady && !!router.query.q) {
      const queryParam = router.query.q as string;

      setQuery(queryParam);
      if (inputRef?.current) inputRef.current.value = queryParam;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <HiSearch className="text-gray-500 dark:text-gray-400" size={20} />
      </div>
      <input
        ref={inputRef}
        onChange={(e) => handleChange(e.target.value)}
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
