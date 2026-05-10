import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';
import { ProductCard } from '../../components/product-card/product-card';
import { RouterLink } from "@angular/router";
import { CartService } from '../../services/cart';
import { SecretQr } from '../../components/secret-qr/secret-qr';

@Component({
  selector: 'app-home',
  imports: [ProductCard, RouterLink, SecretQr],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit{
  cartService = inject(CartService)
  products: Product[] = [];
  constructor(
    private productService:ProductService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void{
   this.productService.getAllProducts().subscribe(data => {
   const sortedProducts = data.products.sort((a, b) => b.rating - a.rating).slice(0, 6);
   this.products = [...sortedProducts];
   
  });

  setInterval(() => {
    this.currentIndex++;
    if (this.currentIndex >= this.images.length) this.currentIndex = 0;
    this.cdr.detectChanges();
   }, 4000);
   }

  images = ['images/bluelaptop.jpg', 'images/samsung.jpg', 'images/smartwatch.jpg', 'images/work.jpg'];
  currentIndex = 0;
  
  

handleAddToCart(productId: string){
  this.cartService.handleAddToCart(productId);
}
}
