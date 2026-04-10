import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input() product! : Product;
  @Output() addToCart = new EventEmitter<string>();
  
  constructor(private router: Router){}

  onAddToCart(){
    this.addToCart.emit(this.product._id)
  }

  getStars(rating: number): string{
    const fullStars = Math.round(rating);
    let starsHTML = "";
    for(let i = 1; i <=5; i++){
      starsHTML += i <= fullStars ? "★" : "☆";
    }
    return starsHTML
  }

  goToProduct(id: string){
    this.router.navigate(['/product', id])
  }
}
