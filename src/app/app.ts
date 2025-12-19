import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Navbar } from "./core/components/navbar/navbar";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Navbar],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {}
