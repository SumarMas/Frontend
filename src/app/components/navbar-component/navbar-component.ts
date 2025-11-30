import { Component, computed, inject } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";
import { RouterLinkActive, RouterLink, Router } from '@angular/router';
import { SidebarService } from '../../services/ui/sidebar-service';
import { IconComponent } from "../icon-component/icon-component";
import { AuthService } from '../../services/api/auth-service';
import { NotificationComponent } from '../notification-component/notification-component';

@Component({
  selector: 'app-navbar-component',
  imports: [ButtonComponent, RouterLinkActive, RouterLink, IconComponent, NotificationComponent],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent {
  sidebarService = inject(SidebarService);
  private router = inject(Router);
  authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  navigate(url: string) {
    this.router.navigate([url]);
  }
}
