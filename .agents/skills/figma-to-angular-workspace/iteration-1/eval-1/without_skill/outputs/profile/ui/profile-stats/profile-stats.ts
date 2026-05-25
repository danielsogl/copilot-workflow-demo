import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ProfileStats as ProfileStatsModel } from "../../data/models/profile.model";

@Component({
  selector: "app-profile-stats",
  templateUrl: "./profile-stats.html",
  styleUrl: "./profile-stats.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class ProfileStats {
  readonly stats = input.required<ProfileStatsModel>();
}
