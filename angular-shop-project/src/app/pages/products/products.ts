import { Component, inject, OnInit } from '@angular/core';
import { Category } from '../../models/product';
import { SearchParams } from '../../models/search-params';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit{
  
  showCategories: boolean = false;
  showBrands: boolean = false;

  productService = inject(ProductService)

  products : Product[] = [];
  totalProducts!: number
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
    this.fetchProducts();
  
     this.productService.getBrands().subscribe(data => {
       this.brands = data;
    });
  
    this.productService.getCategories().subscribe(data => {
      this.categories = data;
    });
}

toggleCategory(): void{
  this.showCategories = !this.showCategories;
}

toggleBrand(): void{
  this.showBrands = !this.showBrands;
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

fetchProducts(): void{
  this.productService.searchProducts(this.searchParams).subscribe(data => {
    this.products = data.products;
    this.totalProducts = data.total;
  });
}
}
