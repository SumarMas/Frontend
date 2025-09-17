import { Component } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";
import { RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-component',
  imports: [ButtonComponent, RouterLinkActive, RouterLink],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent {

}
