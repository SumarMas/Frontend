import { Component, inject, input, signal, computed } from '@angular/core';
import { Sidebuttons } from '../../models/ui/nav-item';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../services/ui/sidebar-service';
import { IconComponent } from "../icon-component/icon-component";
import { Router } from '@angular/router';
import { AuthService } from '../../services/api/auth-service';
import { ConfirmService } from '../../services/ui/confirm-service';

type Role = 'ADMIN' | 'DONOR' | 'ORGANIZATION';

@Component({
  selector: 'app-sidebar-component',
  imports: [NgClass, IconComponent],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss'
})
export class SidebarComponent {
  buttons = Sidebuttons;
  roles = input<Role[]>(['DONOR', 'ORGANIZATION', 'ADMIN']);
  
  // Estado local reactivo para controlar qué items están abiertos
  openItems = signal<string[]>([]);

  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  confirmService = inject(ConfirmService);
  router = inject(Router);
  
  // Computed para los botones filtrados
  filteredButtons = computed(() => {
    return this.buttons.filter(button =>
      button.roles.some(role => this.roles().includes(role))
    );
  });

  isOpen(title: string): boolean {
    return this.openItems().includes(title);
  }

  toggleItem(title: string): void {
    const current = this.openItems();
    if (current.includes(title)) {
      // Remover
      this.openItems.set(current.filter(t => t !== title));
    } else {
      // Agregar
      this.openItems.set([...current, title]);
    }
  }

  navigateTo(route?: string): void {
    if (route) {
      this.router.navigate([route]);
    }
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

