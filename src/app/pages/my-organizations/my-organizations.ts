import { Component, inject, OnInit, signal } from '@angular/core';
import { GetOrganizationDto } from '../../models/api/organization';
import { OrganizationService } from '../../services/api/organization-service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonComponent } from "../../components/button-component/button-component";
import { NgClass } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate-pipe';

@Component({
  selector: 'app-my-organizations',
  imports: [ButtonComponent, NgClass, TruncatePipe],
  templateUrl: './my-organizations.html',
  styleUrl: './my-organizations.scss'
})
export class MyOrganizations implements OnInit {
  organizations: GetOrganizationDto[] = [];
  // = [{
  //   ngoId: '11111111-1111-1111-1111-00000877',
  //   name: 'Manos abiertas', description: 'Somos una organización que ayuda a personas en situación de calle proporcionando alimentos, ropa y apoyo emocional. Nuestra misión es brindar un refugio seguro y digno para aquellos que más lo necesitan, promoviendo la inclusión social y el respeto por los derechos humanos. Trabajamos con voluntarios comprometidos y colaboramos con otras entidades para maximizar nuestro impacto y llegar a más personas. Juntos, podemos construir una comunidad más solidaria y justa.',
  //   status: 'ACTIVE',
  //   userCreator: { userId: '11111111-1111-1111-1111-111111111111', firstName: 'Pablo' , lastName: 'Diaz', email: 'pablo@tesxt.com', roles: ['ORGANIZATION', 'DONOR']},
  //   images: [],
  //   createdDateTime: ''
  // }];

  private organizationService = inject(OrganizationService);
  private router = inject(Router);

  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchMyOrganizations();
  }

  statusClass(status: string) {
    if (status === 'ACTIVE') {
      return 'badge-success';
    } else if (status === 'INACTIVE') {
      return 'badge-error';
    } else if (status === 'PENDING') {
      return 'badge-warning';
    }
    return '';
  }

  statusName(status: string) {
    if (status === 'ACTIVE') {
      return 'Activa';
    } else if (status === 'INACTIVE') {
      return 'Inactiva';
    } else if (status === 'PENDING') {
      return 'Pendiente';
    }
    return 'Desconocido';
  }

  fetchMyOrganizations() {
    this.organizationService.getMyOrganizations().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (orgs: GetOrganizationDto[]) => {
        this.organizations = orgs;
        if (Array.isArray(orgs)) {
          //si es un array
          this.organizations = orgs;

          //si no es un array
        } else if (orgs && typeof orgs === 'object') {
          this.organizations = [orgs];

          //cualquier otro caso
        } else {
          this.organizations = [];
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage.set('No posee organizaciones asociadas.');
        }
        else if (err.status === 500) {
          this.errorMessage.set('Error del servidor. Intente nuevamente más tarde.');
        }
        else {
          this.errorMessage.set('Error desconocido. Intente nuevamente más tarde.');
        }
      }
    });
  }

  redirect(ngoId: string) {
    this.router.navigate(['/organizations', ngoId]);
  }
}
