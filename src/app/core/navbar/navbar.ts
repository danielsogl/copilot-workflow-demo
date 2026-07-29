import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { ColorModeService } from "../color-mode/color-mode-service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbar,
    MatIcon,
    MatButton,
    MatIconButton,
    MatTooltip,
    RouterLink,
    RouterLinkActive,
  ],
})
export class Navbar {
  protected readonly colorMode = inject(ColorModeService);
}
