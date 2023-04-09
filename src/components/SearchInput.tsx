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
import TextInput from "./TextInput";

type Props = {
  setQuery: Dispatch<SetStateAction<string>>;
  placeholder: string;
  onValueChange?: (value: string) => void;
  replace?: boolean;
};

const SearchInput: React.FC<Props> = ({
  setQuery,
  placeholder,
  onValueChange,
  replace = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const onChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (onValueChange) onValueChange(value);

      if (replace) {
        if (!value) delete router.query.q;

        const queryObject = {
          query: {
            // Necessary to pass previous query's,
            //  so this component can work on any page.
            ...router.query,
            ...(value && { q: value }),
          },
        };

        router.replace(queryObject, queryObject, { shallow: true });
      }
    },
    [setQuery, router, onValueChange, replace]
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
    <TextInput
      variant="primary"
      sizeVariant="lg"
      icon={<HiSearch className="text-gray-500 dark:text-gray-400" size={20} />}
      ref={inputRef}
      onChange={(e) => handleChange(e.target.value)}
      type="text"
      placeholder={placeholder}
      required
      title={placeholder}
    />
  );
};

export default SearchInput;
