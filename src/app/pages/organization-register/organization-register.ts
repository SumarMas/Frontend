import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../components/input-component/input-component";
import { ButtonComponent } from '../../components/button-component/button-component';
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { CarrouselImage, PostOrganizationDto } from '../../models/api/organization';
import { OrganizationService } from '../../services/api/organization-service';
import { ToastService } from '../../services/ui/toast-service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-organization-register',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './organization-register.html',
  styleUrl: './organization-register.scss'
})
export class OrganizationRegister {
  registerOrganizationForm: FormGroup<{
    name: FormControl<string | null>,
    description: FormControl<string | null>,
    profileFile: FormControl<File | null>,
    bannerFile: FormControl<File | null>,
    documents: FormControl<File[] | null>,
    images: FormControl<File[] | null>
  }>;

  fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  organizationService = inject(OrganizationService);
  toastService = inject(ToastService);
  router = inject(Router);

  isLoading = signal<boolean>(true);

  constructor() {
    this.registerOrganizationForm = this.fb.group({
      name: new FormControl<string | null>('', { validators: [Validators.required, Validators.maxLength(100)] }),
      description: new FormControl<string | null>('', { validators: [Validators.minLength(5),Validators.maxLength(500)] }),
      profileFile: new FormControl<File | null>(null, { validators: [Validators.required] }),
      bannerFile: new FormControl<File | null>(null, { validators: [Validators.required] }),
      documents: new FormControl<File[] | null>(null, { validators: [Validators.required] }),
      images: new FormControl<File[] | null>(null, { validators: [Validators.required] })
    });
  }

  async onSubmit() {
  if (!this.registerOrganizationForm.valid) return;

  const vals = this.registerOrganizationForm.value;

  const profileId = await this.saveFiles(vals.profileFile!);
  const bannerId  = await this.saveFiles(vals.bannerFile!);
  const docsIds   = await this.saveFiles(vals.documents!);
  const imgsIds   = await this.saveFiles(vals.images!);

  const carrouselImages = Array.isArray(imgsIds)
  ? imgsIds.map((id, i) => ({ 
      imageId: id,
      orderIndex: i + 1
    } as CarrouselImage))
  : undefined;

const dto: PostOrganizationDto = {
  name: vals.name ?? '',
  description: vals.description ?? '',
  ...(profileId ? { profileFileId: profileId as string } : {}), // <--- Asegurar el tipo
  ...(bannerId ? { bannerFileId: bannerId as string } : {}),   // <--- Asegurar el tipo
  ...(docsIds ? { documentsId: docsIds as string[] } : {}),    // <--- Asegurar el tipo
  ...(carrouselImages ? { images: carrouselImages } : {})
};

  this.organizationService.register(dto).pipe(finalize(() => this.isLoading.set(false))).subscribe({
    next: () => {
      this.toastService.open('Organización registrada con éxito', 'success', 3000, 'bottom-right');
      this.router.navigate(['/home']);
    },
    error: (err) => {
      this.toastService.open('Error al registrar la organización: ' + err.message, 'error', 3000, 'bottom-right');
    }
  });
}


  //subir archivos y devolver ids
  async saveFiles(file: File | File[] | null): Promise<string | string[] | null> {
    if (!file) return null;

    if (Array.isArray(file)) {
      //subida multiple devuelve ids
      const promises = file.map(f => this.uploadFileMock(f));
      return Promise.all(promises);
    }

    //subida simple devuelve id
    return this.uploadFileMock(file);
  }

  //mock de subida
  private async uploadFileMock(f: File): Promise<string> {
    await new Promise(r => setTimeout(r, 100)); // simula latencia
    return `${f.name.replace(/\s+/g,'_')}_${Date.now()}`;
  }
}
