import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { Category } from '../../models/product';
import { SearchParams } from '../../models/search-params';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { ProductCard } from '../../components/product-card/product-card';
import { FormsModule, ValueChangeEvent } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-products',
  imports: [ProductCard, FormsModule, UpperCasePipe],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit{
  
  cdr = inject(ChangeDetectorRef);
  route = inject(ActivatedRoute);
  cartService = inject(CartService)

  showCategories = signal(false);
  showBrands = signal(false);
  showRatings = signal(false);
  ratings: number[] = [5, 4, 3, 2, 1];
  showPrice = signal(false);
  searchKeyword = signal('');

  productService = inject(ProductService)

  products : Product[] = [];
  totalProducts: number = 0;
  brands: string[] = [];
  categories:Category [] = [];
  searchParams: SearchParams = {
    page_index: 1,
    page_size: 6,
    keywords: "",
    brand: "",
    category_id: "",
    rating: "",
    price_min: "",
    price_max: "",
    sort_by: "",
    sort_direction: ""
  }

  ngOnInit(): void {
  
     this.productService.getBrands().subscribe(data => {
       this.brands = data;
    });
  
    this.productService.getCategories().subscribe(data => {
      this.categories = data;
    });

    this.route.queryParams.subscribe(params => {
      if(params['keywords']) {
        this.searchParams.keywords = params['keywords'];
      }
      this.fetchProducts();
    })
}

toggleCategory(): void{
  this.showCategories.update(val => !val);
}

toggleBrand(): void{
  this.showBrands.update(val => !val);
}

toggleRating(): void{
  this.showRatings.update(val => !val);
}

togglePrice(): void{
  this.showPrice.update(val => !val);
}

filterByCategory(categoryId: string){
  this.searchParams.category_id = categoryId;
  this.searchParams.page_index = 1;
  this.fetchProducts();
}

filterByBrand(brand: string){
  this.searchParams.brand = brand;
  this.searchParams.page_index = 1;
  this.fetchProducts();
}

filterByRating(rating: Number){
  this.searchParams.rating = rating.toString();
  this.searchParams.page_index = 1;
  this.fetchProducts();
}

filterByPrice(): void{
  this.searchParams.page_index = 1;
  this.fetchProducts();
}

changePage(page: number){
  this.searchParams.page_index = page;
  this.fetchProducts();
}

fetchProducts(): void{
  const filteredParams: any = {};
  for (const key in this.searchParams) {
    const value = (this.searchParams as any)[key];
    if (value !== "" && value !== null) {
      filteredParams[key] = value;
    }
  }
  
  this.productService.searchProducts(filteredParams).subscribe(data => {
    this.products = [...data.products];
    this.totalProducts = data.total;
    this.cdr.detectChanges();
  });
}

clearAllFilters() {
  this.searchParams = {
    page_index: 1,
    page_size: 6,
    keywords: "",
    brand: "",
    category_id: "",
    rating: "",
    price_min: "",
    price_max: "",
    sort_by: "",
    sort_direction: ""
  }
  this.showCategories.set(false);
  this.showBrands.set(false);
  this.showRatings.set(false);
  this.showPrice.set(false);
  this.fetchProducts();
}
  
get totalPages(): number {
  return Math.ceil(this.totalProducts / this.searchParams.page_size);
}

get pages(): number[] {
  return Array.from(
    { length: this.totalPages },
    (_, i) => i + 1
  );
}



changePageSize(event: Event){
  const value = (event.target as HTMLSelectElement).value;
  this.searchParams.page_size = Number(value);
  this.searchParams.page_index = 1;
  this.fetchProducts();
}
changeSort(event: Event){
  const value = (event.target as HTMLSelectElement).value;
  
  if(!value) {
    this.searchParams.sort_by = "";
    this.searchParams.sort_direction = "";
  } else {
    const [field, direction] = value.split("_");
    this.searchParams.sort_by = field;
    this.searchParams.sort_direction = direction;
  }
  
  this.searchParams.page_index = 1;
  this.fetchProducts();
}
private searchTimeout: any;

onSearch(): void{
 clearTimeout(this.searchTimeout);
 this.searchTimeout = setTimeout(() => {
  this.searchParams.page_index = 1;
  this.fetchProducts();
 }, 300);
}

handleAddToCart(productId: string){
  this.cartService.handleAddToCart(productId);
}
}
