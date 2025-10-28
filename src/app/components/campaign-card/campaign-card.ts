import { Component, inject, Input } from '@angular/core';
import { ButtonComponent } from '../button-component/button-component';
import { GetCampaignDto } from '../../models/api/campaign';
import { TruncatePipe } from '../../pipes/truncate-pipe';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-campaign-card',
  imports: [ButtonComponent, TruncatePipe, CurrencyPipe, NgClass],
  templateUrl: './campaign-card.html',
  styleUrl: './campaign-card.scss'
})
export class CampaignCard {
  private router = inject(Router);

  @Input() campaign: GetCampaignDto | null = null;

  daysLeft(endDate: Date | undefined): number | string {
    if (!endDate) {
      return 'N/A';
    }
    const currentDate = new Date();
    const timeDiff = new Date(endDate).getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 ? daysDiff : '';
  }

  navigate(){
    this.router.navigate(['/organizations/1/campaign', this.campaign?.id]);
  }
}
