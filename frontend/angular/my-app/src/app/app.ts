import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './topbar/topbar';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');
  constructor(private authService: AuthService) { }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}