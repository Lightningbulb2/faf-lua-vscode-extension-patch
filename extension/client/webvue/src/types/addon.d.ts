export interface Addon {
  readonly name: string;
  readonly uri: string;

  displayName?: string;
  description?: string;
  size?: number;
  hasPlugin?: boolean;
  processing?: boolean;
  hasUpdate?: boolean;
  enabled?: boolean[];
  installed?: boolean;
  tags?: string[];
  version?: string;
}
