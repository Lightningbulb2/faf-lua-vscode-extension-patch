import { useAppStore } from "@/stores/app";
import { NotificationLevels } from "@/types/app";

type Message = {
  data: {
    property: string;
    value: unknown;
  };
};
export default (message: Message) => {
  const appStore = useAppStore();

  const property = message.data.property;
  const value = message.data.value;

  switch (property) {
    case "workspaceState":
      appStore.workspaceOpen = value as boolean;
      if (!value) {
        appStore.notifications.push({
          level: NotificationLevels.warn,
          message:
            "A workspace is not currently open. Addons cannot be enabled/disabled when a workspace is not open!",
        });
      }
      break;
    case "clientVersion":
      appStore.clientVersion = value as string;
      break;
    default:
      console.warn(`Unsupported appStore property "${property}"`);
      break;
  }
};
