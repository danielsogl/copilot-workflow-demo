import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./core/components/navbar/navbar";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class AppComponent {}
