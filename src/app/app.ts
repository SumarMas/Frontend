import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar-component/navbar-component";
import { ButtonComponent } from "./components/button-component/button-component";
import { FooterComponent } from "./components/footer-component/footer-component";
import { SidebarComponent } from "./components/sidebar-component/sidebar-component";
import { SidebarService } from './services/ui/sidebar-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ButtonComponent, FooterComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  sidebarService = inject(SidebarService);

}
