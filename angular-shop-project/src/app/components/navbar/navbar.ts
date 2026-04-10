import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit{
  isLoggedIn: boolean = false;
  cartCount: number = 0;
  ngOnInit (): void{
   this.isLoggedIn = !!localStorage.getItem('accessToken');
  }

  logout(): void{
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.isLoggedIn = false;
  }
}
