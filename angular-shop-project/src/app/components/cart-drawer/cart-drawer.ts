import { Component, inject, OnInit, effect } from '@angular/core';
import { CartService } from '../../services/cart';
import { CartItem } from '../../models/cart';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-cart-drawer',
  imports: [],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer implements OnInit {
  cartService = inject(CartService);
  productService = inject(ProductService);
  cdr = inject(ChangeDetectorRef);
  enrichedItems: (CartItem & { product?: Product })[] = [];

  constructor(){
    // only watches open state — no cartUpdated effect!
    effect(() => {
      const isOpen = this.cartService.isCartOpen();
      if(isOpen && localStorage.getItem('accessToken')) {
        this.loadCart();
      }
    })
  }

  ngOnInit(): void {
    if(localStorage.getItem('accessToken')) {
      this.loadCart();
    }
  }

  loadCart(){
    this.cartService.getCart().subscribe(data => {
      this.cartService.cartItems.set(data.products);
      this.cartService.cartTotal.set(data.total.price.current);
      this.enrichedItems = new Array(data.products.length);
      data.products.forEach((item, index) => {
        this.productService.getProductById(item.productId).subscribe(product => {
          this.enrichedItems[index] = {...item, product};
          this.cdr.detectChanges();
        })
      })
    })
  }

  closeCart(){
    this.cartService.isCartOpen.set(false);
  }

  updateQuantity(productId: string, quantity: number){
    if(quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cartService.updateQuantity(productId, quantity).subscribe(() => {
      this.loadCart(); // ← just call directly!
    })
  }

  removeFromCart(productId: string){
    this.cartService.removeFromCart(productId).subscribe(() => {
      this.loadCart(); // ← just call directly!
    })
  }

  checkout(){
    this.cartService.checkout().subscribe({
      next: () => {
        this.enrichedItems = [];
        this.cartService.cartTotal.set(0); // ← clear total immediately!
        this.cartService.cartItems.set([]); // ← clear items immediately!
        this.cdr.detectChanges();
        this.cartService.isCartOpen.set(false);
        alert('Order placed successfully! 🎉');
        window.location.reload();
      },
      error: () => {
        alert('Checkout failed. Please try again!')
      }
    })
  }
}