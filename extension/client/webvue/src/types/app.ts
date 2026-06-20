export enum NotificationLevels {
  "error",
  "warn",
  "info",
}

export type Notification = {
  level: NotificationLevels;
  message: string;
};
