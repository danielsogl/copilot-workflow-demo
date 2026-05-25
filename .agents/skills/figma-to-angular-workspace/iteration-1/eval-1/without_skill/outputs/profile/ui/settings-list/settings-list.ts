import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatRipple } from "@angular/material/core";
import { SettingGroup, SettingItem } from "../../data/models/profile.model";

@Component({
  selector: "app-settings-list",
  templateUrl: "./settings-list.html",
  styleUrl: "./settings-list.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatRipple],
})
export class SettingsList {
  readonly groups = input.required<SettingGroup[]>();
  readonly selectSetting = output<SettingItem>();
  readonly signOut = output<void>();
}
