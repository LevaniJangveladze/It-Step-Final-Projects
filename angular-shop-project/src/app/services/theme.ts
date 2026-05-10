import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode = signal(localStorage.getItem('theme') === 'dark')

  toggleDarkMode(){
    this.isDarkMode.update(v => !v);
    document.body.classList.toggle('dark', this.isDarkMode());
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light')
  }

  loadTheme(){
    if(this.isDarkMode()) {
      document.body.classList.add('dark');
    }
  }
}