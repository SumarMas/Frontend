import { Component, inject, OnInit, signal } from '@angular/core';
import { InputComponent } from '../../components/input-component/input-component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/ui/toast-service';
import { ButtonComponent } from "../../components/button-component/button-component";
import { TagInputComponent } from "../../components/tag-input-component/tag-input-component";
import { IconComponent } from "../../components/icon-component/icon-component";
import { CategoryInputComponent } from "../../components/category-input-component/category-input-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { CampaignService } from '../../services/api/campaign-service';
import { PostCampaignDto } from '../../models/api/campaign';
import { FileService } from '../../services/api/file-service';
import { forkJoin, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-campaign-register',
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent, TagInputComponent, IconComponent, CategoryInputComponent],
  templateUrl: './campaign-register.html',
  styleUrl: './campaign-register.scss'
})
export class CampaignRegister implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private router = inject(Router);
  formValidator = inject(FormValidatorService);
  campaignService = inject(CampaignService);
  fileService = inject(FileService);

  campaignRegisterForm: FormGroup<{
    name: FormControl<string | null>,
    description: FormControl<string | null>,
    goalAmount: FormControl<number | null>,
    endDateTime: FormControl<string | null>,
    categoryIds: FormControl<string[] | null>,
    tags: FormControl<string[] | null>,
    imagesId: FormControl<FileList | null>
  }>


  tags: string[] = [];
  categoryIds: string[] = [];

  isLoading = signal<boolean>(false);

  constructor() {
    this.campaignRegisterForm = this.fb.group({
      name: new FormControl<string | null>(null, [Validators.required]),
      description: new FormControl<string | null>(null),
      goalAmount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      endDateTime: new FormControl<string | null>(null, [Validators.required, (control) => this.formValidator.dateMayorThanTodayValidator(control)]),
      categoryIds: new FormControl<string[] | null>(null, [Validators.required]),
      tags: new FormControl<string[] | null>(null),
      imagesId: new FormControl<FileList | null>(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    
  }

  onTagsChange(newTags: string[]) {
    this.tags = newTags;
    this.campaignRegisterForm.controls.tags.setValue(newTags);
    this.campaignRegisterForm.controls.tags.markAsTouched();
  }

  onCategoryIdsChange(newCategoryIds: string[]) {
    this.categoryIds = newCategoryIds;
    this.campaignRegisterForm.controls.categoryIds.setValue(newCategoryIds);
    this.campaignRegisterForm.controls.categoryIds.markAsTouched();
  }

  /**
   * Convierte una fecha en formato YYYY-MM-DD a formato ISO con hora
   * Ejemplo: "2025-10-29" -> "2025-10-29T16:52:10"
   */
  private formatDateToISO(dateString: string): string {
    // Si ya tiene formato ISO, devolverlo tal cual
    if (dateString.includes('T')) {
      return dateString;
    }
    
    // Agregar hora por defecto (23:59:59 del día seleccionado)
    return `${dateString}T23:59:59`;
  }

  onSubmit() {
    if (this.campaignRegisterForm.invalid) {
      this.toastService.open('Por favor complete todos los campos requeridos', 'error', 3000);
      this.campaignRegisterForm.markAllAsTouched();
      return;
    }

    this.campaignRegisterForm.disable();
    this.isLoading.set(true);
    
    const formValue = this.campaignRegisterForm.value;
    
    // Validar que hay categorías
    if (!formValue.categoryIds || formValue.categoryIds.length === 0) {
      this.toastService.open('Debe seleccionar al menos una categoría', 'error', 3000);
      this.campaignRegisterForm.enable();
      this.isLoading.set(false);
      return;
    }
    
    // Validar que hay imágenes
    if (!formValue.imagesId || formValue.imagesId.length === 0) {
      this.toastService.open('Debe seleccionar al menos una imagen', 'error', 3000);
      this.campaignRegisterForm.enable();
      this.isLoading.set(false);
      return;
    }

    // Convertir FileList a Array de Files
    const imageFiles = Array.from(formValue.imagesId);
    console.log(`Subiendo ${imageFiles.length} imágenes...`);
    
    // Subir todas las imágenes en paralelo
    const uploadObservables = imageFiles.map(file => {
      console.log(`Preparando upload de: ${file.name}`);
      return this.fileService.uploadFile(file);
    });
    
    forkJoin(uploadObservables).pipe(
      switchMap((imageIds: string[]) => {
        console.log('Imágenes subidas exitosamente. IDs:', imageIds);
        
        // Formatear la fecha al formato ISO requerido
        const formattedDate = this.formatDateToISO(formValue.endDateTime!);
        
        // Una vez que todas las imágenes se subieron, crear la campaña con los IDs
        const dto: PostCampaignDto = {
          title: formValue.name!,
          description: formValue.description || '',
          goalAmount: formValue.goalAmount!,
          endDateTime: formattedDate,
          categoryIds: formValue.categoryIds || [],
          tags: formValue.tags || [],
          imageIds: imageIds
        };

        console.log('DTO a enviar:', dto);
        
        return this.campaignService.createCampaign(dto);
      })
    ).subscribe({
      next: () => {
        this.toastService.open('Campaña creada con éxito', 'success', 3000);
        this.campaignRegisterForm.reset();
        this.isLoading.set(false);
        this.campaignRegisterForm.enable();
        
        // Navegar a la lista de campañas
        this.router.navigate(['/campaigns/all']);
      },
      error: (err) => {
        console.error('Error completo:', err);
        if (err.status === 0) {
          this.toastService.open('Error de conexión. Verifica tu conexión a internet', 'error', 3000);
        } else if (err.error?.message) {
          this.toastService.open(`Error: ${err.error.message}`, 'error', 3000);
        } else {
          this.toastService.open('Error al crear la campaña', 'error', 3000);
        }
        console.error('Error creando campaña:', err);
        this.isLoading.set(false);
        this.campaignRegisterForm.enable();
      }
    });
  }
}
