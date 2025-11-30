import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from "../../components/icon-component/icon-component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-donation-thanks',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './donation-thanks.html',
  styleUrl: './donation-thanks.scss'
})
export class DonationThanks {
  router = inject(Router);

  navigate(url: string){
    this.router.navigate([url]);
  }
}
