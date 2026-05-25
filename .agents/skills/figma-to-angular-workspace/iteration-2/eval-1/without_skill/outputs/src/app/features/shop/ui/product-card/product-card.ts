import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatButton } from "@angular/material/button";
import { CurrencyPipe } from "@angular/common";
import { Product } from "../../data/models/product.model";

@Component({
  selector: "app-product-card",
  templateUrl: "./product-card.html",
  styleUrl: "./product-card.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardContent, MatButton, CurrencyPipe],
})
export class ProductCard {
  readonly product = input.required<Product>();

  readonly buy = output<Product>();
  readonly favourite = output<Product>();

  protected readonly favouriteLabel = computed(() =>
    this.product().isFavourite ? "Favourited" : "Add to favourite",
  );
}
