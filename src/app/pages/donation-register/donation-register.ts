import { Component, inject, OnInit } from '@angular/core';
import { ButtonComponent } from "../../components/button-component/button-component";
import { InputComponent } from '../../components/input-component/input-component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-donation-register',
  imports: [ButtonComponent, InputComponent, FormsModule, CommonModule],
  templateUrl: './donation-register.html',
  styleUrl: './donation-register.scss'
})
export class DonationRegister implements OnInit {
  amount: number = 0;
  campaignName: string = '';
  campaignId: string = '';

  commonValues = [3000, 5000, 10000];
  private route = inject(ActivatedRoute);
  private title = inject(Title);

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.campaignName = params['campaignName'];
      this.campaignId = params['campaignId'];
      console.log('Campaign Name:', this.campaignName);
      console.log('Campaign ID:', this.campaignId);
    });

    if(this.campaignName){
      this.title.setTitle(`Donar a ${this.campaignName} | Sumar+`);
    }

  }

  onDonate() {
    if (this.amount > 0) {
      alert(`Gracias por tu donación de $${this.amount.toFixed(2)}!`);
      this.amount = 0; // Resetear el monto después de donar
    } else {
      alert('Por favor, ingresa un monto válido para donar.');
    }
  }

  set setAmount(value: number) {
    this.amount = value;
  }

  get getAmount(): number {
    return this.amount;
  }
}
