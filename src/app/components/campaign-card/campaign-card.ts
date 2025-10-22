import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button-component/button-component';
import { GetCampaignDto } from '../../models/api/campaign';
import { TruncatePipe } from '../../pipes/truncate-pipe';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-campaign-card',
  imports: [ButtonComponent, TruncatePipe, CurrencyPipe],
  templateUrl: './campaign-card.html',
  styleUrl: './campaign-card.scss'
})
export class CampaignCard {
  @Input() campaign: GetCampaignDto | null = null;
}
