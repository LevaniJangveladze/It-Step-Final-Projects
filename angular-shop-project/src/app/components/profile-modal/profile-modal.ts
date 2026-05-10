import { Component, inject, effect, signal, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-profile-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-modal.html',
  styleUrl: './profile-modal.scss',
})
export class ProfileModal {

  authService = inject(AuthService);
  cartService = inject(CartService);

  successMessage = signal('');
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  passwordSuccess = signal(false);
  activeTab = signal<'profile' | 'analytics'>('profile');

  @ViewChild('barChart') barChartRef!: ElementRef;
  chartInstance: any = null;

  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    age: new FormControl(''),
    address: new FormControl(''),
    phone: new FormControl(''),
    zipcode: new FormControl(''),
    avatar: new FormControl(''),
    gender: new FormControl(''),
  })

  passwordForm = new FormGroup({
    oldPassword: new FormControl(''),
    newPassword: new FormControl('')
  })

  constructor(){
    
    effect(() => {
      const user = this.authService.currentUser();
      if(user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          age: user.age || '',
          address: user.address || '',
          phone: user.phone || '',
          zipcode: user.zipcode || '',
          avatar: user.avatar || '',
          gender: user.gender || '',
        })
      }
    })

    
    effect(() => {
      if(this.activeTab() === 'analytics') {
        setTimeout(() => this.buildChart(), 100);
      }
    })
  }

  buildChart(){
    const items = this.cartService.cartItems();
    if(!items.length || !this.barChartRef) return;

    const labels = items.map((item: any, i: number) => `Item ${i + 1}`);
    const prices = items.map((item: any) => item.pricePerQuantity);
    const quantities = items.map((item: any) => item.quantity);

    if(this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Price ($)',
            data: prices,
            backgroundColor: 'rgba(99,102,241,0.7)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: 'Quantity',
            data: quantities,
            backgroundColor: 'rgba(139,92,246,0.5)',
            borderColor: '#8b5cf6',
            borderWidth: 2,
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#888', font: { size: 13 } }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#888' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            ticks: { color: '#888' },
            grid: { display: false }
          }
        }
      }
    });
  }

  updateProfile(){
    this.authService.updateProfile(this.profileForm.value).subscribe(() => {
      this.authService.getUser().subscribe(user => {
        this.authService.currentUser.set(user);
        this.successMessage.set('Profile updated successfully! ✅');
        setTimeout(() => this.successMessage.set(''), 3000);
      })
    })
  }

  changePassword(){
    const { oldPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(oldPassword!, newPassword!).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.passwordSuccess.set(true);
        setTimeout(() => this.passwordSuccess.set(false), 3000);
      },
      error: () => {
        this.passwordSuccess.set(false);
      }
    })
  }
}