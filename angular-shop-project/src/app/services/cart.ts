import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CartResponse, CartItem } from '../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private baseUrl = 'https://api.everrest.educata.dev';
  http = inject(HttpClient);
  isCartOpen = signal(false);
  cartItems = signal<CartItem[]>([]);
  cartTotal = signal<number>(0);
  cartUpdated = signal(0); 

  private getHeaders(){
    return {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/shop/cart`, {
      headers: this.getHeaders()
    })
  }

  addtoCart(productId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/shop/cart/product`,
      { id: productId, quantity: 1 },
      { headers: this.getHeaders() }
    )
  }

  updateQuantity(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/shop/cart/product`,
      { id: productId, quantity: quantity },
      { headers: this.getHeaders() }
    )
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/shop/cart/product`, {
      headers: this.getHeaders(),
      body: { id: productId }
    })
  }

  toggleCart(){
    this.isCartOpen.update(val => !val);
  }

  loadCart(){
    this.getCart().subscribe(data => {
      this.cartItems.set(data.products);
      this.cartTotal.set(data.total.price.current);
      this.cartUpdated.update(v => v + 1); 
    })
  }



  handleAddToCart(productId: string){
    this.addtoCart(productId).subscribe({
      next: () => {
        this.loadCart(); 
        this.isCartOpen.set(true);
      },
      error: (err) => {
        if(err.status === 400) {
          this.getCart().subscribe(data => {
            this.cartItems.set(data.products);
            const existing = this.cartItems().find(i => i.productId === productId);
            if(existing) {
              this.updateQuantity(productId, existing.quantity + 1).subscribe(() => {
                this.loadCart();
                this.isCartOpen.set(true);
              })
            } else {
              this.updateQuantity(productId, 1).subscribe(() => {
                this.loadCart(); 
                this.isCartOpen.set(true);
              })
            }
          })
        }
      }
    })
  }

  get cartCount(): number {
  return this.cartItems().reduce((total, item) => total + item.quantity, 0);
}

  checkout(): Observable<any> {
  return this.http.post(`${this.baseUrl}/shop/cart/checkout`, {}, {
    headers: this.getHeaders()
  })
}
}