import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from "@angular/material/button-toggle";
import { Theme, ThemeMode } from "../theme/theme";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbar,
    MatIcon,
    MatButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    RouterLink,
    RouterLinkActive,
  ],
})
export class Navbar {
  readonly theme = inject(Theme);

  setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
