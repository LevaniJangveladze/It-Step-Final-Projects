import { Component, inject, signal, HostListener, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit{
  cartCount: number = 0;
  searchTerm: string = "";
  searchResults: Product[] = [];
  showResults = signal(false);
  productService = inject(ProductService)
  el = inject(ElementRef)
  cartService = inject(CartService)
  router = inject(Router);
  authService = inject(AuthService)
  isMobileOpen = signal(false)
  theme = inject(ThemeService)

 

  search(){
  this.router.navigate(['/products'], {queryParams: {keywords: this.searchTerm}})
}
private searchTimeout: any;

fetchSuggestions(){
  if(this.searchTerm.length < 2) {
    this.showResults.set(false);
    return;
  }
  
 clearTimeout(this.searchTimeout);
 this.searchTimeout = setTimeout(() => {
   this.productService.searchProducts({keywords: this.searchTerm, page_size: 5}).subscribe(data => {
    this.searchResults = data.products;
    this.showResults.set(true);
  })
 }, 300);
}
goToProduct(id: string){
  console.log('navigating to:', id);
  this.router.navigate(['/product', id]);
  this.showResults.set(false);
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event){
  if(!this.el.nativeElement.contains(event.target)){
    this.showResults.set(false)
  }
}

openCart(){
  this.cartService.toggleCart();
}

openAuth(type: string){
  console.log('openAuth called!');
  this.authService.toggleAuth();
  this.authService.authType.set(type);
}

logout(): void{
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  this.authService.isLoggedIn.set(false); 
}

openProfile(){
  this.authService.getUser().subscribe(user => {
    this.authService.currentUser.set(user)
    this.authService.isProfileOpen.set(true)
  })
}

openBurger(){
  this.isMobileOpen.update(val => !val)
}

ngOnInit(){
  this.theme.loadTheme();
}

}
