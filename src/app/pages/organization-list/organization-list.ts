import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { GetOrganizationDto } from '../../models/api/organization';
import { Router } from '@angular/router';
import { OrganizationService } from '../../services/api/organization-service';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-organization-list',
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss'
})
export class OrganizationList implements OnInit {
  organizations = signal<GetOrganizationDto[]>([]);
  filteredOrganizations = signal<GetOrganizationDto[]>([]);
  isLoading = signal<boolean>(true);
  searchInput: string = '';
  
  // Cache de imágenes para evitar cargas duplicadas
  private imageCache = new Map<string, SafeUrl>();

  constructor(
    private router: Router,
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}

  organizationService = inject(OrganizationService);

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.organizationService.getAllOrganizationsApproved().subscribe({
      next: (data) => {
        this.organizations.set(data);
        this.filteredOrganizations.set(data);
        this.isLoading.set(false);
        
        // Cargar imágenes de perfil para todas las organizaciones
        data.forEach(org => {
          if (org.profileFileId) {
            this.loadImage(org.profileFileId);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching organizations', error);
        this.isLoading.set(false);
      }
    })
  }

  onSearch() {
    const search = this.searchInput.toLowerCase().trim();
    if (!search) {
      this.filteredOrganizations.set(this.organizations());
      return;
    }

    const filtered = this.organizations().filter(org => 
      org.name.toLowerCase().includes(search) || 
      org.description.toLowerCase().includes(search)
    );
    this.filteredOrganizations.set(filtered);
  }

  clearSearch() {
    this.searchInput = '';
    this.filteredOrganizations.set(this.organizations());
  }

  viewOrganization(ngoId: string) {
    //navegar a la página de la organización
    this.router.navigate(['/organizations', ngoId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  }

  /**
   * Carga una imagen desde el FileService y la almacena en cache
   */
  loadImage(fileId: string): void {
    // Si ya está en cache, no la volvemos a cargar
    if (this.imageCache.has(fileId)) {
      return;
    }

    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.imageCache.set(fileId, safeUrl);
      },
      error: (error) => {
        console.error(`Error loading image ${fileId}:`, error);
      }
    });
  }

  /**
   * Obtiene la URL segura de una imagen desde el cache
   */
  getImageUrl(fileId: string | undefined): SafeUrl | null {
    if (!fileId) return null;
    return this.imageCache.get(fileId) || null;
  }
}
