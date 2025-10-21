import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { OrganizationService } from '../../services/api/organization-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ValidateOrganizationDto } from '../../models/api/organization';
import { finalize } from 'rxjs';
import { ButtonComponent } from "../button-component/button-component";
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-approval-details-component',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './approval-details-component.html',
  styleUrl: './approval-details-component.scss'
})
export class ApprovalDetailsComponent {
  @Input() ngoId: string | null = null;
  @Output() actionSuccess = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  comment : FormControl<string | null> = new FormControl(null);

  isLoading = signal<boolean>(false);

  private organizationService = inject(OrganizationService);
  private toastService = inject(ToastService);

  //------------------------------------Métodos------------------------------------

  resetForm() {
    this.comment.setValue('');
  }

  close(){
    this.resetForm();
    this.closeModal.emit();
  }

  //aprobar la organizacion
  approveOrganization() {
    if (this.ngoId) {
      this.isLoading.set(true);

      const approveData : ValidateOrganizationDto = {
        comment: this.comment.value || '',
        approved: true
      };

      this.organizationService.changeStatusOrganization(this.ngoId, approveData).pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: () => {
          //emitir exito y cerrar modal
          this.actionSuccess.emit();
          this.closeModal.emit();
          this.toastService.open('Organización aprobada con éxito', 'success', 3000);
        },
        error: (error) => {
          this.toastService.open('Ha ocurrido un error al intentar aprobar la organización, intente de nuevo más tarde', 'error', 3000);
        }
      });
    }
  }

  rejectOrganization() {
    if (this.ngoId) {
      this.isLoading.set(true);

      const rejectData : ValidateOrganizationDto = {
        comment: this.comment.value || '',
        approved: false
      };

      this.organizationService.changeStatusOrganization(this.ngoId, rejectData).pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: () => {
          //emitir exito y cerrar modal
          this.actionSuccess.emit();
          this.closeModal.emit();
          this.toastService.open('Organización rechazada con éxito', 'success', 3000);
        },
        error: (error) => {
          this.toastService.open('Ha ocurrido un error al intentar rechazar la organización, intente de nuevo más tarde', 'error', 3000);
        }
      });
    }
  }
}
