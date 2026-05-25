import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { UserProfile } from "../../data/models/profile.model";

@Component({
  selector: "app-profile-header",
  templateUrl: "./profile-header.html",
  styleUrl: "./profile-header.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconButton, MatIcon],
})
export class ProfileHeader {
  readonly profile = input.required<UserProfile>();
  readonly initials = input.required<string>();

  readonly editProfile = output<void>();
  readonly shareProfile = output<void>();
}
