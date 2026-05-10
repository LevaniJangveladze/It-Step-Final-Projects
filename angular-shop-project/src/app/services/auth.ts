import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  http = inject(HttpClient);

  private baseUrl = 'https://api.everrest.educata.dev';

  isAuthOpen = signal(false);

  isLoggedIn = signal(!!localStorage.getItem('accessToken'));

  authType = signal('login');

  isProfileOpen = signal(false)

  currentUser = signal <any>(null);
  

  logIn(email: string, password: string): Observable<any> {
   return this.http.post(`${this.baseUrl}/auth/sign_in`, {
    email, password
   })
  }
 signUp(userData: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/sign_up`, userData)
}

toggleAuth(){
  this.isAuthOpen.update(val => !val);
}


getUser(): Observable<any> {
  return this.http.get(`${this.baseUrl}/auth`, {
    headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}
  })
}

updateProfile(userData: any): Observable<any> {
 return this.http.patch(`${this.baseUrl}/auth/update`, 
  userData,
  { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
)
}

changePassword(oldPassword: string, newPassword: string): Observable<any> {
  return this.http.patch(`${this.baseUrl}/auth/change_password`, 
    {oldPassword, newPassword},
    { headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}}
  )
}

forgotPassword(email:string):Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/recovery`, 
    {email}
   )
}

verifyEmail(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/verify_email`,
    {email}
  )
}

refreshToken(): Observable <any> {
  return this.http.post(`${this.baseUrl}/auth/refresh`,
    {},
    {headers: {Authorization: `Bearer ${localStorage.getItem('refreshToken')}`}}
  )
}
}
