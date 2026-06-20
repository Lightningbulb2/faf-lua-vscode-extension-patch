import type { Notification } from "@/types/app";
import { defineStore } from "pinia";

export type AppStore = {
  /** Whether a workspace is open or VS Code is in file mode */
  workspaceOpen: boolean;
  /** The version of the VS Code extension */
  clientVersion: string;
  /** Notifications received from the VS Code extension */
  notifications: Notification[];
};

export const useAppStore = defineStore("app", {
  state: (): AppStore => ({
    workspaceOpen: false,
    clientVersion: "",
    notifications: [],
  }),
});
