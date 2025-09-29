import { Component, inject, input } from '@angular/core';
import { Sidebuttons } from '../../models/nav-item';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../services/sidebar-service';
import { IconComponent } from "../icon-component/icon-component";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

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
  authService = inject(AuthService);
  
  getButtonsForRoles(): typeof Sidebuttons {
  return this.buttons.filter(button =>
    button.roles.some(role => this.roles().includes(role))
  );
}
}
