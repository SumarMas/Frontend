import { Component, inject, input } from '@angular/core';
import { Sidebuttons } from '../../models/nav-item';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../services/ui/sidebar-service';
import { IconComponent } from "../icon-component/icon-component";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ConfirmService } from '../../services/ui/confirm-service';

type Role = 'ADMIN' | 'DONOR' | 'ORGANIZATION';

@Component({
  selector: 'app-sidebar-component',
  imports: [NgClass, IconComponent, RouterLink],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss'
})
export class SidebarComponent {
  buttons = Sidebuttons;
  roles = input<Role[]>(['DONOR', 'ORGANIZATION']);

  sidebarService = inject(SidebarService);
  authService = inject(AuthService)
  confirmService = inject(ConfirmService);
  
  getButtonsForRoles(): typeof Sidebuttons {
  return this.buttons.filter(button =>
    button.roles.some(role => this.roles().includes(role))
  );
}

  async onLogout(){
    const ok = await this.confirmService.ask('¿Estás seguro de que deseas cerrar sesión?', {
    title: 'Cerrar sesión',
    variant: 'warning',
    confirmText: 'Cerrar sesión',
    cancelText: 'Cancelar',
  });
  if (ok) { this.authService.logout() }
  }
}

