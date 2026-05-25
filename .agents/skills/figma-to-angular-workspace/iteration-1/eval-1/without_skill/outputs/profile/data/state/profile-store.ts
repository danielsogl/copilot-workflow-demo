import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { forkJoin, pipe, switchMap, tap } from "rxjs";
import { ProfileApi } from "../infrastructure/profile-api";
import {
  ProfileStats,
  SettingGroup,
  UserProfile,
} from "../models/profile.model";

export interface ProfileState {
  profile: UserProfile | null;
  stats: ProfileStats | null;
  settingGroups: SettingGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  stats: null,
  settingGroups: [],
  loading: false,
  error: null,
};

export const ProfileStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed(({ profile, stats, settingGroups }) => ({
    hasProfile: computed(() => profile() !== null),
    initials: computed(() => {
      const p = profile();
      if (!p) return "";
      return p.displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }),
    totalSettings: computed(() =>
      settingGroups().reduce((sum, group) => sum + group.items.length, 0),
    ),
    hasStats: computed(() => stats() !== null),
  })),
  withMethods((store, api = inject(ProfileApi)) => ({
    loadProfile: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          forkJoin({
            profile: api.getProfile(),
            stats: api.getStats(),
            settingGroups: api.getSettingGroups(),
          }).pipe(
            tapResponse({
              next: ({ profile, stats, settingGroups }) =>
                patchState(store, {
                  profile,
                  stats,
                  settingGroups,
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load profile: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
