import { Component, inject, OnInit, effect } from '@angular/core';
import { CartService } from '../../services/cart';
import { CartItem } from '../../models/cart';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

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
  http = inject(HttpClient);
  authService = inject(AuthService);

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
      this.loadCart(); 
    })
  }

  removeFromCart(productId: string){
    this.cartService.removeFromCart(productId).subscribe(() => {
      this.loadCart(); 
    })
  }

checkout() {
  
  this.authService.getUser().subscribe(user => {
    // 2. Build the payload
   const payload = {
  email: user.email,
  items: this.enrichedItems.map(item => ({
    title: item.product?.title,
    price: item.pricePerQuantity,
    quantity: item.quantity,
    image: item.product?.images?.[0] ?? ''  
  })),
  total: this.cartService.cartTotal()
};

    // 3. Send to n8n webhook
    this.http.post('http://localhost:5678/webhook/64182f16-a053-44a7-983d-73eea69e1071', payload).subscribe();

    // 4. Proceed with checkout as before
    this.cartService.checkout().subscribe({
      next: () => {
        this.enrichedItems = [];
        this.cartService.cartTotal.set(0);
        this.cartService.cartItems.set([]);
        this.cdr.detectChanges();
        this.cartService.isCartOpen.set(false);
        alert('Order placed! Confirmation email sent! 🎉');
        window.location.reload();
      },
      error: () => {
        alert('Checkout failed. Please try again!');
      }
    });
  });
}
}