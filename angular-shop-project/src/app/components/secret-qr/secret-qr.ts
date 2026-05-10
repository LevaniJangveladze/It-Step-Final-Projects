import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-secret-qr',
  imports: [],
  templateUrl: './secret-qr.html',
  styleUrl: './secret-qr.scss',
})
export class SecretQr implements OnInit{
  http = inject(HttpClient);
  qrImage = signal('');
  showModal = signal(false);
  showTab = signal(false);

  ngOnInit(){
    this.http.get<any>('https://api.everrest.educata.dev/qrcode').subscribe(data => {
      this.qrImage.set(data.result);
      this.showTab.set(true);
    })
  }

  openModal(){this.showModal.set(true);}
  closeModal(){this.showModal.set(false);}
}
