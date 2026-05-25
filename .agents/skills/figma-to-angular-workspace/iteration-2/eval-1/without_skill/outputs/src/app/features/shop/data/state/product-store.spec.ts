import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { MockProvider } from "ng-mocks";
import { ProductApi } from "../infrastructure/product-api";
import {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "../models/product.model";
import { ProductStore } from "./product-store";

describe("ProductStore", () => {
  let store: InstanceType<typeof ProductStore>;
  let productApi: {
    getProducts: ReturnType<typeof vi.fn<() => Observable<Product[]>>>;
    getProductById: ReturnType<
      typeof vi.fn<(id: string) => Observable<Product>>
    >;
    createProduct: ReturnType<
      typeof vi.fn<(product: CreateProductRequest) => Observable<Product>>
    >;
    updateProduct: ReturnType<
      typeof vi.fn<
        (id: string, updates: UpdateProductRequest) => Observable<Product>
      >
    >;
    deleteProduct: ReturnType<typeof vi.fn<(id: string) => Observable<void>>>;
  };

  const mockProducts: Product[] = [
    {
      id: "p1",
      title: "Leather boots",
      price: 27.5,
      currency: "USD",
      description: "Great warm shoes from the artificial leather.",
      imageUrl: "https://example.com/boots.jpg",
      isFavourite: false,
    },
    {
      id: "p2",
      title: "Suede jacket",
      price: 120,
      currency: "USD",
      description: "Stylish jacket.",
      imageUrl: "https://example.com/jacket.jpg",
      isFavourite: true,
    },
  ];

  beforeEach(() => {
    productApi = {
      getProducts: vi.fn(() => of(mockProducts)),
      getProductById: vi.fn((id: string) =>
        of(mockProducts.find((p) => p.id === id) ?? mockProducts[0]),
      ),
      createProduct: vi.fn((product) =>
        of({ ...product, id: "new", isFavourite: false }),
      ),
      updateProduct: vi.fn((id, updates) =>
        of({
          ...(mockProducts.find((p) => p.id === id) ?? mockProducts[0]),
          ...updates,
        }),
      ),
      deleteProduct: vi.fn(() => of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        ProductStore,
        provideZonelessChangeDetection(),
        MockProvider(ProductApi, productApi as Partial<ProductApi>),
      ],
    });

    store = TestBed.inject(ProductStore);
  });

  it("should initialize with default state", () => {
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.selectedId()).toBeNull();
    expect(store.totalProductCount()).toBe(0);
    expect(store.isEmpty()).toBe(true);
  });

  it("should load products", () => {
    store.loadProducts();
    TestBed.tick();

    expect(productApi.getProducts).toHaveBeenCalledOnce();
    expect(store.totalProductCount()).toBe(2);
    expect(store.hasData()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it("should toggle favourite", () => {
    store.loadProducts();
    TestBed.tick();

    const product = store.productsEntities()[0];
    store.toggleFavourite(product);

    const updated = store.productsEntities().find((p) => p.id === product.id);
    expect(updated?.isFavourite).toBe(!product.isFavourite);
  });

  it("should compute favourites", () => {
    store.loadProducts();
    TestBed.tick();

    expect(store.favourites().length).toBe(1);
    expect(store.favourites()[0].id).toBe("p2");
  });

  it("should handle load errors", () => {
    productApi.getProducts.mockReturnValueOnce(
      throwError(() => new Error("network error")),
    );

    store.loadProducts();
    TestBed.tick();

    expect(store.loading()).toBe(false);
    expect(store.error()).toContain("Failed to load products");
  });

  it("should clear error", () => {
    productApi.getProducts.mockReturnValueOnce(
      throwError(() => new Error("network error")),
    );
    store.loadProducts();
    TestBed.tick();

    store.clearError();

    expect(store.error()).toBeNull();
  });
});
