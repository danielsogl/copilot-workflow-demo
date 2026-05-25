import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { pipe, switchMap, tap } from "rxjs";
import { ProductApi } from "../infrastructure/product-api";
import {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "../models/product.model";

export interface ProductState {
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initialProductState: ProductState = {
  loading: false,
  error: null,
  selectedId: null,
};

const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: "products",
  selectId: (product: Product) => product.id,
});

export const ProductStore = signalStore(
  { providedIn: "root" },
  withState(initialProductState),
  withEntities(productEntityConfig),
  withComputed(({ productsEntities, selectedId }) => ({
    selectedProduct: computed(() => {
      const id = selectedId();
      if (id === null) return null;
      return productsEntities().find((product) => product.id === id) ?? null;
    }),
    favourites: computed(() =>
      productsEntities().filter((product) => product.isFavourite),
    ),
    totalProductCount: computed(() => productsEntities().length),
    hasData: computed(() => productsEntities().length > 0),
    isEmpty: computed(() => productsEntities().length === 0),
  })),
  withMethods((store, productApi = inject(ProductApi)) => ({
    loadProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          productApi.getProducts().pipe(
            tapResponse({
              next: (products) =>
                patchState(
                  store,
                  setAllEntities(products, productEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load products: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    createProduct: rxMethod<CreateProductRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((product) =>
          productApi.createProduct(product).pipe(
            tapResponse({
              next: (createdProduct) =>
                patchState(
                  store,
                  addEntity(createdProduct, productEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to create product: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    updateProduct: rxMethod<{ id: string; updates: UpdateProductRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          productApi.updateProduct(id, updates).pipe(
            tapResponse({
              next: (product) =>
                patchState(
                  store,
                  updateEntity({ id, changes: product }, productEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update product: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    deleteProduct: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          productApi.deleteProduct(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, removeEntity(id, productEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to delete product: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    toggleFavourite(product: Product): void {
      patchState(
        store,
        updateEntity(
          {
            id: product.id,
            changes: { isFavourite: !product.isFavourite },
          },
          productEntityConfig,
        ),
      );
    },

    selectProduct(id: string | null): void {
      patchState(store, { selectedId: id });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
