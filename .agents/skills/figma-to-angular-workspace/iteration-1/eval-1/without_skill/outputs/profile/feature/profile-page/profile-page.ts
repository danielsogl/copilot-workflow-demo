import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  untracked,
} from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProfileStore } from "../../data/state/profile-store";
import { SettingItem } from "../../data/models/profile.model";
import { ProfileHeader } from "../../ui/profile-header/profile-header";
import { ProfileStats } from "../../ui/profile-stats/profile-stats";
import { SettingsList } from "../../ui/settings-list/settings-list";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile-page.html",
  styleUrl: "./profile-page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinner, ProfileHeader, ProfileStats, SettingsList],
})
export class ProfilePage {
  protected readonly store = inject(ProfileStore);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.store.loadProfile();

    effect(() => {
      const error = this.store.error();
      if (!error) return;
      this.snackBar.open(error, "Dismiss", { duration: 5000 });
      untracked(() => this.store.clearError());
    });
  }

  protected onEditProfile(): void {
    this.snackBar.open("Edit profile (not wired)", "OK", { duration: 2500 });
  }

  protected onShareProfile(): void {
    this.snackBar.open("Profile link copied", "OK", { duration: 2500 });
  }

  protected onSelectSetting(item: SettingItem): void {
    this.snackBar.open(`Open: ${item.label}`, "OK", { duration: 2000 });
  }

  protected onSignOut(): void {
    this.snackBar.open("Signed out", "OK", { duration: 2500 });
  }
}
