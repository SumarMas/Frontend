import { Component, inject, OnInit, signal } from '@angular/core';
import { GetOrganizationDto } from '../../models/api/organization';
import { OrganizationService } from '../../services/api/organization-service';
import { Router } from '@angular/router';
import { ButtonComponent } from "../../components/button-component/button-component";
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IconComponent } from '../../components/icon-component/icon-component';

@Component({
  selector: 'app-my-organizations',
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './my-organizations.html',
  styleUrl: './my-organizations.scss'
})
export class MyOrganizations implements OnInit {
  organization = signal<GetOrganizationDto | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  
  // Cache de imágenes
  imageCache = new Map<string, SafeUrl>();

  private organizationService = inject(OrganizationService);
  private fileService = inject(FileService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  ngOnInit(): void {
    this.fetchMyOrganization();
  }

  fetchMyOrganization() {
    this.isLoading.set(true);
    this.organizationService.getMyOrganizations().subscribe({
      next: (org: GetOrganizationDto) => {
        this.organization.set(org);
        this.isLoading.set(false);
        
        // Cargar banner y perfil
        if (org.bannerFileId) {
          this.loadImage(org.bannerFileId);
        }
        if (org.profileFileId) {
          this.loadImage(org.profileFileId);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.errorMessage.set('No posee una organización asociada.');
        } else if (err.status === 500) {
          this.errorMessage.set('Error del servidor. Intente nuevamente más tarde.');
        } else {
          this.errorMessage.set('Error al cargar la organización.');
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'VERIFIED':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'DENIED':
        return 'badge-error';
      case 'UNVERIFIED':
        return 'badge-ghost';
      default:
        return 'badge-ghost';
    }
  }

  getStatusName(status: string): string {
    switch (status) {
      case 'VERIFIED':
        return 'Verificada';
      case 'PENDING':
        return 'Pendiente';
      case 'DENIED':
        return 'Denegada';
      case 'UNVERIFIED':
        return 'No Verificada';
      default:
        return 'Desconocido';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'VERIFIED':
        return 'check';
      case 'PENDING':
        return 'schedule';
      case 'DENIED':
        return 'close';
      case 'UNVERIFIED':
        return 'info';
      default:
        return 'info';
    }
  }

  viewOrganization(ngoId: string) {
    this.router.navigate(['/organizations', ngoId]);
  }

  createOrganization() {
    this.router.navigate(['/organizations/register']);
  }
  
  loadImage(fileId: string) {
    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.imageCache.set(fileId, this.sanitizer.bypassSecurityTrustUrl(objectUrl));
      },
      error: (err) => {
        console.error('Error al cargar imagen:', err);
      }
    });
  }

  getImageUrl(fileId: string): SafeUrl | null {
    return this.imageCache.get(fileId) || null;
  }
}
