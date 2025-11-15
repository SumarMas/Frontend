import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ButtonComponent } from '../button-component/button-component';
import { GetCampaignDto } from '../../models/api/campaign';
import { DecimalPipe, NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../icon-component/icon-component';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-campaign-card',
  imports: [ButtonComponent, DecimalPipe, NgClass, IconComponent, CommonModule],
  templateUrl: './campaign-card.html',
  styleUrl: './campaign-card.scss'
})
export class CampaignCard implements OnInit {
  private router = inject(Router);
  private fileService = inject(FileService);
  private sanitizer = inject(DomSanitizer);

  @Input() campaign: GetCampaignDto | null = null;
  
  campaignImageUrl = signal<SafeUrl | null>(null);
  imageLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCampaignImage();
  }

  loadCampaignImage(): void {
    const imageId = this.campaign?.images?.[0];
    
    if (!imageId) {
      return;
    }

    this.imageLoading.set(true);
    
    this.fileService.getFile(imageId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.campaignImageUrl.set(safeUrl);
        this.imageLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar imagen de campaña:', err);
        this.imageLoading.set(false);
      }
    });
  }

  daysLeft(endDate: Date | string | undefined): number | string {
    if (!endDate) {
      return 'N/A';
    }
    const currentDate = new Date();
    const timeDiff = new Date(endDate).getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 ? daysDiff : 0;
  }

  daysLeftText(): string {
    const endDate = this.campaign?.endDateTime || this.campaign?.end_date_time;
    const days = this.daysLeft(endDate);
    if (days === 'N/A') return 'Fecha no disponible';
    if (days === 0) return 'Último día';
    return `${days} días restantes`;
  }

  getDaysLeftClass(): string {
    const endDate = this.campaign?.endDateTime || this.campaign?.end_date_time;
    const days = this.daysLeft(endDate);
    if (days === 'N/A' || days === 0) return 'badge-error';
    if (Number(days) <= 7) return 'badge-warning';
    return 'badge-success';
  }

  getDaysLeftIcon(): string {
    const endDate = this.campaign?.endDateTime || this.campaign?.end_date_time;
    const days = this.daysLeft(endDate);
    if (days === 'N/A' || days === 0) return 'warning';
    if (Number(days) <= 7) return 'warning';
    return 'check';
  }

  getProgressPercentage(): number {
    const goalAmount = this.campaign?.goal_amount || this.campaign?.goal_amount || 0;
    const currentAmount = this.campaign?.current_amount || this.campaign?.current_amount || 0;
    if (!goalAmount || goalAmount === 0 || !currentAmount) return 0;
    return Math.round((currentAmount / goalAmount) * 100);
  }

  getRemainingAmount(): number {
    const goalAmount = this.campaign?.goal_amount || this.campaign?.goal_amount || 0;
    const currentAmount = this.campaign?.current_amount || this.campaign?.current_amount || 0;
    if (!goalAmount || !currentAmount) return goalAmount;
    return Math.max(0, goalAmount - currentAmount);
  }

  getCampaignImage(): SafeUrl | string {
    if (this.campaignImageUrl()) {
      return this.campaignImageUrl()!;
    }
    return '/images/donations.jpeg';
  }

  getCategories() {
    return this.campaign?.categories || [];
  }

  getVisibleCategories() {
    return this.getCategories().slice(0, 3);
  }

  hasMoreCategories(): boolean {
    return this.getCategories().length > 3;
  }

  getRemainingCategoriesCount(): number {
    return this.getCategories().length - 3;
  }

  navigate(){
    this.router.navigate(['/organizations/1/campaign', this.campaign?.id]);
  }
}