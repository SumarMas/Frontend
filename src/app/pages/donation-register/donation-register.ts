import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ButtonComponent } from "../../components/button-component/button-component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-donation-register',
  imports: [ButtonComponent, FormsModule, CommonModule],
  templateUrl: './donation-register.html',
  styleUrl: './donation-register.scss'
})
export class DonationRegister implements OnInit {
  commonValues = [3000, 5000, 10000];
  amount: number = this.commonValues[1];
  campaignName: string = '';
  campaignId: string = '';

  isCustomAmount = signal<boolean>(false);

  constructor(){
    effect(() => {
      if(this.isCustomAmount()){
        this.amount = NaN;
      }
    });
  }  

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
      this.amount = this.commonValues[1]; // Resetear el monto después de donar
      this.isCustomAmount.set(false);
    } else {
      alert('Por favor, ingresa un monto válido para donar.');
    }
  }

  set setAmount(value: number) {
    this.isCustomAmount.set(false);
    this.amount = value;
  }

  get getAmount(): number {
    return this.amount;
  }

  disable() : boolean{
    return isNaN(this.amount) || this.amount < 1;
  }
}
