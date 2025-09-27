import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isOpen = signal(false);

  isLoggedIn = signal(false);

  toggle() {
    this.isOpen.update(value => !value);
  }

  setLoginStatus(status: boolean) {
    this.isLoggedIn.set(status);
  }
}
