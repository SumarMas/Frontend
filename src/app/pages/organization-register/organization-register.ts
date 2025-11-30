import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../components/input-component/input-component";
import { ButtonComponent } from '../../components/button-component/button-component';
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { CarrouselImage, PostOrganizationDto } from '../../models/api/organization';
import { OrganizationService } from '../../services/api/organization-service';
import { ToastService } from '../../services/ui/toast-service';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { FileService } from '../../services/api/file-service';
import { ReusableModalComponent } from "../../components/reusable-modal-component/reusable-modal-component";
import { AuthService } from '../../services/api/auth-service';

@Component({
  selector: 'app-organization-register',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, ReusableModalComponent],
  templateUrl: './organization-register.html',
  styleUrl: './organization-register.scss'
})
export class OrganizationRegister {
  registerOrganizationForm: FormGroup<{
    name: FormControl<string | null>,
    description: FormControl<string | null>,
    profileFile: FormControl<FileList | null>,
    bannerFile: FormControl<FileList | null>,
    documents: FormControl<FileList | null>,
    images: FormControl<FileList | null>
  }>;

  fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  organizationService = inject(OrganizationService);
  toastService = inject(ToastService);
  fileService = inject(FileService);
  router = inject(Router);
  authService = inject(AuthService);

  isLoading = signal<boolean>(false);

  @ViewChild('updateStatus') updateStatus!: ReusableModalComponent;

  constructor() {
    this.registerOrganizationForm = this.fb.group({
      name: new FormControl<string | null>('', { validators: [Validators.required, Validators.maxLength(100)] }),
      description: new FormControl<string | null>('', { validators: [Validators.minLength(5), Validators.maxLength(500)] }),
      profileFile: new FormControl<FileList | null>(null, { validators: [Validators.required] }),
      bannerFile: new FormControl<FileList | null>(null, { validators: [Validators.required] }),
      documents: new FormControl<FileList | null>(null, { validators: [Validators.required] }),
      images: new FormControl<FileList | null>(null, { validators: [Validators.required] })
    });
  }

  async onSubmit() {
    if (!this.registerOrganizationForm.valid) {
      this.toastService.open('Por favor complete todos los campos requeridos', 'warning', 3000, 'bottom-right');
      return;
    }

    const vals = this.registerOrganizationForm.value;
    
    // Validar que los archivos existan
    if (!vals.profileFile || vals.profileFile.length === 0) {
      this.toastService.open('Debe seleccionar una foto de perfil', 'error', 3000, 'bottom-right');
      return;
    }
    if (!vals.bannerFile || vals.bannerFile.length === 0) {
      this.toastService.open('Debe seleccionar una foto de portada', 'error', 3000, 'bottom-right');
      return;
    }
    if (!vals.documents || vals.documents.length === 0) {
      this.toastService.open('Debe adjuntar al menos un documento legal', 'error', 3000, 'bottom-right');
      return;
    }
    if (!vals.images || vals.images.length === 0) {
      this.toastService.open('Debe adjuntar al menos una foto extra', 'error', 3000, 'bottom-right');
      return;
    }

    this.isLoading.set(true);

    // Cargas individuales (tomar el primer archivo de cada FileList)
    const profile$ = this.fileService.uploadFile(vals.profileFile[0]);
    const banner$ = this.fileService.uploadFile(vals.bannerFile[0]);

    // Arrays de archivos → arrays de observables (convertir FileList a Array)
    const docs$ = Array.from(vals.documents).map(f => this.fileService.uploadFile(f));
    const imgs$ = Array.from(vals.images).map(f => this.fileService.uploadFile(f));

    // Espera a que todas las cargas terminen
    forkJoin({
      profileId: profile$,
      bannerId: banner$,
      docsIds: docs$.length ? forkJoin(docs$) : [],
      imgsIds: imgs$.length ? forkJoin(imgs$) : []
    }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: ({ profileId, bannerId, docsIds, imgsIds }) => {
        const carrouselImages = Array.isArray(imgsIds)
          ? imgsIds.map((id, i) => ({
              imageId: id,
              orderIndex: i + 1
            } as CarrouselImage))
          : [];

        const dto: PostOrganizationDto = {
          name: vals.name ?? '',
          description: vals.description ?? '',
          profileFileId: profileId,
          bannerFileId: bannerId,
          documentsId: Array.isArray(docsIds) ? docsIds : [],
          images: carrouselImages
        };
        
        console.log('DTO --->', dto);
        
        this.organizationService.register(dto).subscribe({
          next: () => {
            this.toastService.open('Organización registrada con éxito', 'success', 3000, 'bottom-right');
            this.updateStatus.open();
          },
          error: (err) => {
            console.error('Error al registrar organización:', err);
            this.toastService.open('Error al registrar la organización: ' + (err.error?.message || err.message), 'error', 5000, 'bottom-right');
          }
        });
      },
      error: (err) => {
        console.error('Error al subir archivos:', err);
        this.toastService.open('Error al subir archivos: ' + (err.error?.message || err.message), 'error', 5000, 'bottom-right');
      }
    });
  }

  closeModal(){
    this.updateStatus.close();
    this.router.navigate(['/home']);
  }

  logout(){
    this.authService.logout();
  }
}
