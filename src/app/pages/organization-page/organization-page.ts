import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { GetOrganizationDto } from '../../models/api/organization';
import { IconComponent } from '../../components/icon-component/icon-component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../../components/button-component/button-component";
import { AuthService } from '../../services/api/auth-service';
import { ApprovalDetailsComponent } from "../../components/approval-details-component/approval-details-component";
import { ReusableModalComponent } from '../../components/reusable-modal-component/reusable-modal-component';

@Component({
  selector: 'app-organization-page',
  imports: [IconComponent, CommonModule, ButtonComponent, ReusableModalComponent, ApprovalDetailsComponent],
  templateUrl: './organization-page.html',
  styleUrl: './organization-page.scss'
})
export class OrganizationPage implements OnInit{
  organization: GetOrganizationDto = {
    ngoId: '4dbb8d30-5483-499c-a498-b0883b46dc87',
    name: 'Manos abiertas',
    description: 'Somos una organización que ayuda a personas en situación de calle proporcionando alimentos, ropa y apoyo emocional. Nuestra misión es brindar un refugio seguro y digno para aquellos que más lo necesitan, promoviendo la inclusión social y el respeto por los derechos humanos. Trabajamos con voluntarios comprometidos y colaboramos con otras entidades para maximizar nuestro impacto y llegar a más personas. Juntos, podemos construir una comunidad más solidaria y justa.',
    status: 'PENDING',
    userCreator: { userId: '11111111-1111-1111-1111-111111111111', firstName: 'Pablo', lastName: 'Diaz', email: 'pablo@tesxt.com', roles: ['ORGANIZATION', 'DONOR'] },
    images: [],
    createdDateTime: ''
  };

  @ViewChild('approvalModal') approvalModalRef!: ReusableModalComponent;
  @ViewChild(ApprovalDetailsComponent) approvalDetails!: ApprovalDetailsComponent;

  authService = inject(AuthService);

  ngOnInit(): void {
    console.log('Organization Page - User ID:', this.authService.userId());
    console.log('User roles:', this.authService.roles());
    
  }

  images: { url: string, alt: string }[] = [
    { url: 'https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp', alt: 'Actividad 1' },
    { url: 'https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp', alt: 'Actividad 2' },
    { url: 'https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp', alt: 'Actividad 3' }
  ];

  //------------------------------------Métodos para el carrusel------------------------------------

  //obtener el siguiente indice
  getNextIndex(currentIndex: number, totalLength: number): number {
    return (currentIndex + 1) % totalLength;
  }

  //obtener el indice anterior
  getPreviousIndex(currentIndex: number, totalLength: number): number {
    return (currentIndex - 1 + totalLength) % totalLength;
  }
  
  goToSlide(index: number) {
    const slideId = `slide${index}`;
    document.getElementById(slideId)?.scrollIntoView({ behavior: 'smooth' });
  }

  //------------------------------------Métodos para los modales------------------------------------

  //abrir modal de aprobacion
  openApprovalModal(){
    this.approvalModalRef.open();
    this.approvalDetails.resetForm();
  }

  onApprovalSuccess(){
    this.approvalModalRef.close();
    this.approvalDetails.resetForm();
  }
}
