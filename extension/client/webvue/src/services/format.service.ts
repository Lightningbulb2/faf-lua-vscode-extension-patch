import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import UTC from "dayjs/plugin/utc";
dayjs.extend(RelativeTime);
dayjs.extend(UTC);

export const formatBytes = (bytes: number): string => {
  const suffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;

  if (bytes <= 1024) {
    return `${bytes}B`;
  }

  while (bytes >= 1024 && i < suffixes.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${suffixes[i]}`;
};
