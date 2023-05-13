import { format, isToday, formatDistance } from "date-fns";

type Options = { smart: boolean };

export const formatDate = (date: Date, options?: Options) => {
  const dateToFormat = new Date(date);

  if (options?.smart === true)
    return format(dateToFormat, isToday(dateToFormat) ? "HH:mm" : "dd/MM/yyyy");

  return formatDistance(dateToFormat, new Date(), {
    addSuffix: true,
  });
};
