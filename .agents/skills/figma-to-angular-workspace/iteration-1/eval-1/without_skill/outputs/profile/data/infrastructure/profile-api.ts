import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import {
  ProfileStats,
  SettingGroup,
  UserProfile,
} from "../models/profile.model";

@Injectable({ providedIn: "root" })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000";

  getProfile(): Observable<UserProfile> {
    // When the mock db is extended with a `profile` collection,
    // swap this for: this.http.get<UserProfile>(`${this.apiUrl}/profile`);
    return of<UserProfile>({
      id: "u_1",
      displayName: "Ava Thompson",
      email: "ava.thompson@example.com",
      handle: "@avathompson",
      avatarUrl: null,
      bio: "Product designer crafting calm, expressive Material You experiences.",
      location: "Berlin, DE",
      joinedAt: "2024-03-12",
    });
  }

  getStats(): Observable<ProfileStats> {
    return of<ProfileStats>({
      posts: 128,
      followers: 2_413,
      following: 312,
    });
  }

  getSettingGroups(): Observable<SettingGroup[]> {
    return of<SettingGroup[]>([
      {
        id: "preferences",
        title: "Preferences",
        items: [
          {
            id: "account",
            label: "Account",
            description: "Profile info, password, sign-in options",
            icon: "person",
          },
          {
            id: "notifications",
            label: "Notifications",
            description: "Push, email, and in-app alerts",
            icon: "notifications",
          },
          {
            id: "appearance",
            label: "Appearance",
            description: "Material You theme, light or dark",
            icon: "palette",
          },
          {
            id: "privacy",
            label: "Privacy & security",
            description: "Permissions, blocked users, data",
            icon: "lock",
          },
          {
            id: "language",
            label: "Language & region",
            description: "Interface language, date format",
            icon: "language",
          },
          {
            id: "storage",
            label: "Storage",
            description: "Cache and downloaded content",
            icon: "sd_storage",
          },
        ],
      },
      {
        id: "support",
        title: "Support",
        items: [
          {
            id: "help",
            label: "Help center",
            description: "Guides, FAQ, contact support",
            icon: "help",
          },
          {
            id: "about",
            label: "About",
            description: "Version, terms, open-source licenses",
            icon: "info",
          },
        ],
      },
    ]);
  }
}
