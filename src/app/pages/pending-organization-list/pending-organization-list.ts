import { Component, inject, OnInit, signal } from '@angular/core';
import { OrganizationService } from '../../services/api/organization-service';
import { GetOrganizationDto } from '../../models/api/organization';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pending-organization-list',
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: './pending-organization-list.html',
  styleUrl: './pending-organization-list.scss'
})
export class PendingOrganizationList implements OnInit {
  organizationService = inject(OrganizationService);
  fileService = inject(FileService);
  sanitizer = inject(DomSanitizer);
  router = inject(Router);

  pendingOrganizations = signal<GetOrganizationDto[]>([]);
  isLoading = signal<boolean>(true);
  searchInput = signal<string>('');
  
  // Cache de imágenes cargadas
  imageCache = new Map<string, SafeUrl>();

  ngOnInit(): void {
    this.loadPendingOrganizations();
  }

  loadPendingOrganizations() {
    this.isLoading.set(true);
    this.organizationService.getAllOrganizationsPending().subscribe({
      next: (organizations) => {
        this.pendingOrganizations.set(organizations);
        this.isLoading.set(false);
        
        // Cargar imágenes de perfil
        organizations.forEach(org => {
          if (org.profileFileId) {
            this.loadImage(org.profileFileId);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar organizaciones pendientes:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadImage(fileId: string) {
    // Si ya está en caché, no volver a cargar
    if (this.imageCache.has(fileId)) return;

    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.imageCache.set(fileId, safeUrl);
      },
      error: (error) => {
        console.error('Error al cargar imagen:', error);
      }
    });
  }

  getImageUrl(fileId: string | undefined): SafeUrl | null {
    if (!fileId) return null;
    return this.imageCache.get(fileId) || null;
  }

  filteredOrganizations(): GetOrganizationDto[] {
    const search = this.searchInput().toLowerCase();
    if (!search) return this.pendingOrganizations();
    
    return this.pendingOrganizations().filter(org => 
      org.name.toLowerCase().includes(search) ||
      org.description?.toLowerCase().includes(search)
    );
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchInput.set(target.value);
  }

  clearSearch() {
    this.searchInput.set('');
  }

  viewOrganization(ngoId: string) {
    this.router.navigate(['/organizations', ngoId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  getDaysWaiting(createdDateTime: string): number {
    const created = new Date(createdDateTime);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getWaitingClass(days: number): string {
    if (days <= 3) return 'text-green-600 bg-green-50';
    if (days <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }
}
