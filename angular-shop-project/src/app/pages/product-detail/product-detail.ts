import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-product-detail',
  imports: [FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  singleProduct = signal<Product | null>(null);
  cartService = inject(CartService);
  authService = inject(AuthService);
  currentIndex = signal(0);
  selectedRating = signal(0);
  ratingSubmitted = signal(false);
  ratingError = signal('');

  ngOnInit(){
    const id = this.route.snapshot.params['id'];
    this.productService.getProductById(id).subscribe(data => {
      this.singleProduct.set(data);
    })
  }

  get hasDiscount(): boolean {
    const product = this.singleProduct();
    if(!product) return false;
    return product.price.beforeDiscount > product.price.current;
  }

  get discountPercent(): number {
    const product = this.singleProduct();
    if(!product) return 0;
    return Math.round(100 - (product.price.current / product.price.beforeDiscount) * 100)
  }

  getStars(rating: number): string {
    const fullStars = Math.round(rating);
    let starsHTML = "";
    for(let i = 1; i <= 5; i++){
      starsHTML += i <= fullStars ? "★" : "☆";
    }
    return starsHTML;
  }

  addToCart(){
    const product = this.singleProduct();
    if(!product) return;
    this.cartService.handleAddToCart(product._id);
  }

  setRating(star: number){
    this.selectedRating.set(star);
  }

  submitRating(){
    console.log('submitRating called!', this.selectedRating());
    const product = this.singleProduct();
    if(!product || this.selectedRating() === 0) return;

    this.productService.rateProduct(product._id, this.selectedRating()).subscribe({
      next: () => {
        this.ratingSubmitted.set(true);
        this.ratingError.set('');
        // reload product to show updated rating
        this.productService.getProductById(product._id).subscribe(data => {
          this.singleProduct.set(data);
        })
      },
      error: () => {
        this.ratingError.set('Please log in to rate this product!');
      }
    })
  }

  prevImage(){
    const images = this.singleProduct()?.images || [];
    this.currentIndex.update(i => i === 0 ? images.length - 1 : i - 1);
  }

  nextImage(){
    const images = this.singleProduct()?.images || [];
    this.currentIndex.update(i => i === images.length - 1 ? 0 : i + 1);
  }
}