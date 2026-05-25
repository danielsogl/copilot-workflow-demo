export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  handle: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  joinedAt: string;
}

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

export type SettingId =
  | "account"
  | "notifications"
  | "appearance"
  | "privacy"
  | "language"
  | "storage"
  | "help"
  | "about";

export interface SettingItem {
  id: SettingId;
  label: string;
  description: string;
  icon: string;
}

export interface SettingGroup {
  id: "preferences" | "support";
  title: string;
  items: SettingItem[];
}
