import type { Notification } from "@/types/app";
import { useAppStore } from "@/stores/app";

type Message = {
  data: Notification;
};

/** Add notification to array in appStore */
export default (message: Message) => {
  const appStore = useAppStore();
  appStore.notifications.push(message.data);
};
