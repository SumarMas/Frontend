import { Component, inject, OnInit, signal } from '@angular/core';
import { GetOrganizationDto } from '../../models/api/organization';
import { OrganizationService } from '../../services/api/organization-service';
import { Router } from '@angular/router';
import { ButtonComponent } from "../../components/button-component/button-component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-organizations',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './my-organizations.html',
  styleUrl: './my-organizations.scss'
})
export class MyOrganizations implements OnInit {
  organization = signal<GetOrganizationDto | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  private organizationService = inject(OrganizationService);
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
      case 'ACTIVE':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'INACTIVE':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }

  getStatusName(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'PENDING':
        return 'Pendiente';
      case 'INACTIVE':
        return 'Inactiva';
      default:
        return 'Desconocido';
    }
  }

  viewOrganization(ngoId: string) {
    this.router.navigate(['/organizations', ngoId]);
  }

  createOrganization() {
    this.router.navigate(['/organizations/register']);
  }
}
