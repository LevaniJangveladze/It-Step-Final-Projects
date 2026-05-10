import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { CartDrawer } from './components/cart-drawer/cart-drawer';
import { CartService } from './services/cart';
import { AuthModal } from './components/auth-modal/auth-modal';
import { AuthService } from './services/auth';
import { ProfileModal } from './components/profile-modal/profile-modal';
import { Logos } from './components/logos/logos';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, CartDrawer, AuthModal, ProfileModal, Logos],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-shop-project');

  cartService = inject(CartService)
   authService = inject(AuthService)
}
