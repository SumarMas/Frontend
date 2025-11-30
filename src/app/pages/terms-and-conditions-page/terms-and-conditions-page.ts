import { Component } from '@angular/core';
import { IconComponent } from '../../components/icon-component/icon-component';
import { FooterComponent } from '../../components/footer-component/footer-component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-and-conditions-page',
  imports: [IconComponent, FooterComponent, CommonModule],
  templateUrl: './terms-and-conditions-page.html',
  styleUrl: './terms-and-conditions-page.scss'
})
export class TermsAndConditionsPage {

}
