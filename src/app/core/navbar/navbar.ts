import { Component } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrls: ["./navbar.scss"],
  imports: [MatToolbarModule, MatIconModule],
})
export class Navbar {}
