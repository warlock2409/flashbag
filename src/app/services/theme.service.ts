import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  toggleTheme() {
    this.isDarkTheme.next(!this.isDarkTheme.value);
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  }

  setInitialTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkTheme.next(prefersDark);
    document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
  }
} 