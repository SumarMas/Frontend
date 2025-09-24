import { Component, inject } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";
import { RouterLinkActive, RouterLink } from '@angular/router';
import { SidebarService } from '../../services/sidebar-service';
import { IconComponent } from "../icon-component/icon-component";

@Component({
  selector: 'app-navbar-component',
  imports: [ButtonComponent, RouterLinkActive, RouterLink, IconComponent],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent {
  sidebarService = inject(SidebarService);

  login(){
    this.sidebarService.isLoggedIn.set(!this.sidebarService.isLoggedIn());
  }
}
