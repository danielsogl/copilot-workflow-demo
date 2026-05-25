import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  untracked,
} from "@angular/core";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton, MatFabButton } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProductStore } from "../../data/state/product-store";
import { Product } from "../../data/models/product.model";
import { ProductCard } from "../../ui/product-card/product-card";

@Component({
  selector: "app-shop-list",
  templateUrl: "./shop-list.html",
  styleUrl: "./shop-list.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatFabButton,
    MatProgressSpinner,
    ProductCard,
  ],
})
export class ShopList {
  protected readonly store = inject(ProductStore);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.store.loadProducts();

    effect(() => {
      const error = this.store.error();
      if (!error) return;
      this.snackBar.open(error, "Dismiss", { duration: 5000 });
      untracked(() => this.store.clearError());
    });
  }

  protected onBuy(product: Product): void {
    this.snackBar.open(`Added "${product.title}" to cart`, "Dismiss", {
      duration: 3000,
    });
  }

  protected onToggleFavourite(product: Product): void {
    this.store.toggleFavourite(product);
  }

  protected onOpenMessages(): void {
    this.snackBar.open("Messages coming soon", "Dismiss", { duration: 2000 });
  }

  protected onOpenMenu(): void {
    this.snackBar.open("Menu coming soon", "Dismiss", { duration: 2000 });
  }

  protected onOpenAccount(): void {
    this.snackBar.open("Account coming soon", "Dismiss", { duration: 2000 });
  }
}
