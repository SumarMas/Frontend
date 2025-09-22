import { Component } from '@angular/core';
import { Sidebuttons } from '../../models/nav-item';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar-component',
  imports: [NgClass],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss'
})
export class SidebarComponent {
  buttons = Sidebuttons;

  open = false;

  toggle(){
    this.open = !this.open;
  }
}
