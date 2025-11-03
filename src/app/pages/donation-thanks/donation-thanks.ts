import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from "../../components/icon-component/icon-component";

@Component({
  selector: 'app-donation-thanks',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './donation-thanks.html',
  styleUrl: './donation-thanks.scss'
})
export class DonationThanks {

}
