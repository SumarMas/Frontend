import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../auth-service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private authService = inject(AuthService);

  isOpen = signal(false);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  toggle() {
    this.isOpen.update(value => !value);
  }
}
