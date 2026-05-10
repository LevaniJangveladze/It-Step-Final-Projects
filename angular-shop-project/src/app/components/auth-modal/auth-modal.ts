import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.scss',
})
export class AuthModal {
  auth = inject(AuthService);
  cartService = inject(CartService);
  registrationSuccess = signal(false);
  registrationError = signal('');

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  })

  registerForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    age: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    address: new FormControl(''),
    phone: new FormControl(''),
    zipcode: new FormControl(''),
    avatar: new FormControl(''),
    gender: new FormControl(''),
  })

  login(){
    const { email, password } = this.loginForm.value;
    this.auth.logIn(email!, password!).subscribe((data: any) => {
      localStorage.setItem('accessToken', data.access_token);
      this.auth.isLoggedIn.set(true);
      this.auth.isAuthOpen.set(false);
      this.cartService.loadCart();
    })
  }



register(){
  const formValue = {
    ...this.registerForm.value,
    age: Number(this.registerForm.value.age),
    avatar: this.registerForm.value.avatar?.replace(/['"]/g, '') || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=default'
  }
  
  this.auth.signUp(formValue).subscribe({
    next: () => {
      this.auth.verifyEmail(this.registerForm.value.email!).subscribe();
      this.registrationSuccess.set(true);
      this.registrationError.set('');
      setTimeout(() => {
        this.auth.authType.set('login');
        this.registrationSuccess.set(false);
      }, 2000)
    },
    error: (err) => {
      this.registrationError.set(
        err.error?.error || 'Registration failed. Please check your details!'
      );
    }
  })
}
}