export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  isFavourite: boolean;
}

export interface CreateProductRequest {
  title: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
}

export interface UpdateProductRequest {
  title?: string;
  price?: number;
  currency?: string;
  description?: string;
  imageUrl?: string;
  isFavourite?: boolean;
}
