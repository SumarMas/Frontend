import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { ButtonComponent } from "../../components/button-component/button-component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DonationService } from '../../services/api/donation-service';
import { PostDonationDto } from '../../models/api/donation';

@Component({
  selector: 'app-donation-register',
  imports: [ButtonComponent, FormsModule, CommonModule],
  templateUrl: './donation-register.html',
  styleUrl: './donation-register.scss'
})
export class DonationRegister implements OnInit {
  donationService = inject(DonationService);

  commonValues = [3000, 5000, 10000];
  amount: number = this.commonValues[1];
  campaignName = input<string>('');
  campaignId = input<string>('');

  isLoading = signal<boolean>(false);
  showRedirectMessage = signal<boolean>(false);
  redirectUrl = signal<string>('');
  counter = signal<number>(0);

  isCustomAmount = signal<boolean>(false);

  constructor() {
    //si el monto es custom, setear amount a NaN
    effect(() => {
      if (this.isCustomAmount()) {
        this.amount = NaN;
      }
    });

    //iniciar el contador cuando se muestre el mensaje de redirección
    effect(() => {
      if (this.showRedirectMessage()) {
        this.counter.set(10); //10 segundos
      }
    });

    effect((onCleanup) => {
    //Si el mensaje NO se está mostrando, sal del effect.
    if (!this.showRedirectMessage()) {
      return; 
    }

    //Si el contador es 0 y debe redirigir:
    if (this.counter() <= 0) {
      window.location.href = this.redirectUrl();
      return;
    }

    const intervalId = setInterval(() => {
      this.counter.update(value => {
        const newValue = value - 1;
        if (newValue <= 0) {
          window.location.href = this.redirectUrl();
        }
        return newValue;
      });
    }, 1000);

    onCleanup(() => {
      clearInterval(intervalId);
    });
  });
  }

  ngOnInit(): void {

  }

  onDonate() {
    if (this.amount > 0) {
      const donation = {
        campaign_id: this.campaignId(),
        amount: this.amount,
        title: this.campaignName()
      } as PostDonationDto;

      this.isLoading.set(true);

      this.donationService.postDonation(donation).subscribe({
        next: (url: string) => {
          this.showRedirectMessage.set(true);
          this.redirectUrl.set(url);
        },
        error: (error) => {
          console.error('Error processing donation:', error);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      })
      
      this.isCustomAmount.set(false);
    }
  }

  set setAmount(value: number) {
    this.isCustomAmount.set(false);
    this.amount = value;
  }

  get getAmount(): number {
    return this.amount;
  }

  disable(): boolean {
    return isNaN(this.amount) || this.amount < 1;
  }
}
