import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse, Category  } from '../models/product';

@Injectable({
  providedIn: 'root',
})

export class ProductService {
  private baseUrl = 'https://api.everrest.educata.dev';
  constructor(private http: HttpClient){};
  

  getAllProducts(): Observable<ProductsResponse>{
    return this.http.get<ProductsResponse>(`${this.baseUrl}/shop/products/all?page_size=38`);
  }

  searchProducts(params: any): Observable<ProductsResponse>{
    const query = new URLSearchParams(params).toString();
    return this.http.get<ProductsResponse>(`${this.baseUrl}/shop/products/search?${query}`)
    
  }

  getBrands(): Observable<string[]>{
    return this.http.get<string[]>(`${this.baseUrl}/shop/products/brands`)
  }

  getCategories(): Observable<Category[]>{
    return this.http.get<Category[]>(`${this.baseUrl}/shop/products/categories`)
  }

  getProductById(id : string): Observable<Product>{
    return this.http.get<Product>(`${this.baseUrl}/shop/products/id/${id}`)
  }
}
