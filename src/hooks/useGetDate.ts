import { format, formatDistance } from "date-fns";
import { useCallback, useMemo, useState } from "react";

type Dates = "distance" | "date";

const useGetDate = (dateToFormat?: number | Date) => {
  const [selectedDateType, setSelectedDateType] = useState<Dates>("distance");
  const isDistance = selectedDateType === "distance";

  const formattedDate: Record<Dates, string> | undefined = useMemo(() => {
    if (dateToFormat) {
      return {
        distance: formatDistance(dateToFormat, new Date(), {
          addSuffix: true,
        }),
        date: format(dateToFormat, "HH:mm - dd/MM/yyyy"),
      };
    }
  }, [dateToFormat]);

  const toggleDateType = useCallback(() => {
    setSelectedDateType(isDistance ? "date" : "distance");
  }, [isDistance]);

  const date = isDistance ? formattedDate?.distance : formattedDate?.date;

  return { date, toggleDateType, isDistance };
};

export default useGetDate;
