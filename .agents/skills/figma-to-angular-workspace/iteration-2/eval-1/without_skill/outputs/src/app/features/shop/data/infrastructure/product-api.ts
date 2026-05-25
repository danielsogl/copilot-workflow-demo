import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "../models/product.model";

@Injectable({
  providedIn: "root",
})
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/products";

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(
    id: string,
    updates: UpdateProductRequest,
  ): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, updates);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
