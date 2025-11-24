import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GetCampaignDto, PutCampaignDto } from '../../models/api/campaign';
import { ButtonComponent } from '../../components/button-component/button-component';
import { IconComponent } from "../../components/icon-component/icon-component";
import { CommentaryDisplayComponent } from "../../components/commentary-display-component/commentary-display-component";
import { MessageDisplayComponent } from "../../components/message-display-component/message-display-component";
import { AuthService } from '../../services/api/auth-service';
import { AddMessageComponent } from "../../components/add-message-component/add-message-component";
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '../../services/api/campaign-service';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastService } from '../../services/ui/toast-service';
import { ReusableModalComponent } from '../../components/reusable-modal-component/reusable-modal-component';
import { DonationRegister } from "../donation-register/donation-register";
import { InputComponent } from '../../components/input-component/input-component';
import { CategoryService } from '../../services/api/category-service';
import { CategoryDto } from '../../models/api/category';
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { TagInputComponent } from '../../components/tag-input-component/tag-input-component';

@Component({
  selector: 'app-campaign-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, IconComponent, ReusableModalComponent,
    CommentaryDisplayComponent, MessageDisplayComponent, AddMessageComponent,
    CurrencyPipe, DonationRegister, InputComponent, TagInputComponent],
  templateUrl: './campaign-page.html',
  styleUrl: './campaign-page.scss'
})
export class CampaignPage implements OnInit, OnDestroy {
  campaign: GetCampaignDto | null = null;
  isOpen = signal(false);
  campaignImageUrl = signal<SafeUrl | null>(null);
  currentImageIndex = signal<number>(0);
  carouselImages = signal<SafeUrl[]>([]);
  private carouselInterval: any = null;
  isEditMode = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  imagesToKeep = signal<string[]>([]);
  categories = signal<CategoryDto[]>([]);
  editTags = signal<string[]>([]);
  ngoProfileImage = signal<SafeUrl | null>(null);
  
  // Cache de imágenes para edición
  imageCache = new Map<string, SafeUrl>();

  @ViewChild(MessageDisplayComponent) messageDisplayComponent!: MessageDisplayComponent;

  editForm: FormGroup<{
    title: FormControl<string | null>,
    description: FormControl<string | null>,
    goalAmount: FormControl<number | null>,
    endDateTime: FormControl<string | null>,
    categoryIds: FormControl<string[] | null>,
    images: FormControl<FileList | null>
  }>;

  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  campaignService = inject(CampaignService);
  fileService = inject(FileService);
  sanitizer = inject(DomSanitizer);
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  validateFormService = inject(FormValidatorService);

  showAddMessage = signal(false);

  campaignId: string = '';

  @ViewChild('donateModal') donateModalRef!: ReusableModalComponent;

  constructor() {
    this.editForm = this.fb.group({
      title: new FormControl<string | null>(null),
      description: new FormControl<string | null>(null),
      goalAmount: new FormControl<number | null>(null),
      endDateTime: new FormControl<string | null>(null, [this.validateFormService.dateMayorThanTodayValidator]),
      categoryIds: new FormControl<string[] | null>(null),
      images: new FormControl<FileList | null>(null)
    });
  }

  toggleAddMessage() {
    this.showAddMessage.set(!this.showAddMessage());
  }

  handleCancel() {
    this.showAddMessage.set(false);
  }

  handleMessageSubmitted() {
    // Cerrar el formulario y recargar los mensajes
    this.showAddMessage.set(false);
    // Recargar solo los mensajes sin recargar toda la campaña
    if (this.messageDisplayComponent) {
      this.messageDisplayComponent.fetchMessages();
    }
  }

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('campaignId') || '';
    if (this.campaignId) {
      this.loadCampaign();
      this.loadCategories();
      console.log('CAMAPAÑA ', this.campaign);
      
    } else {
      this.toastService.open('ID de campaña inválido', 'error', 3000);
      this.router.navigate(['/campaigns']);
    }
  }

  loadCampaign(): void {
    this.campaignService.getCampaignById(this.campaignId).subscribe({
      next: (campaign) => {
        this.campaign = campaign;
        console.log('Campaign loaded:', campaign);
        
        // Cargar foto de perfil de la organización
        if (campaign.ngo.profileFileId) {
          this.loadNgoProfileImage(campaign.ngo.profileFileId);
        }
        
        // Inicializar imagesToKeep con las imágenes actuales
        if (campaign.images) {
          this.imagesToKeep.set([...campaign.images]);
          
          // Inicializar el array de carrusel con nulls para mantener el orden
          this.carouselImages.set(new Array(campaign.images.length).fill(null));
          
          // Cargar todas las imágenes en el cache y en el carrusel con su índice
          campaign.images.forEach((imageId, index) => {
            this.loadImageToCache(imageId);
            this.loadImageForCarousel(imageId, index);
          });
          
          // Iniciar el carrusel después de cargar las imágenes
          if (campaign.images.length > 1) {
            this.startCarousel();
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar campaña:', error);
        this.toastService.open('Error al cargar la campaña', 'error', 3000);
        this.router.navigate(['/campaigns']);
      }
    });
  }

  loadImageForCarousel(imageId: string, index: number): void {
    this.fileService.getFile(imageId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        
        // Actualizar el array en la posición correcta
        this.carouselImages.update(images => {
          const newImages = [...images];
          newImages[index] = safeUrl;
          return newImages;
        });
        
        // Establecer la primera imagen como actual
        if (index === 0) {
          this.campaignImageUrl.set(safeUrl);
        }
      },
      error: (err) => {
        console.error('Error al cargar imagen de campaña:', err);
      }
    });
  }

  loadNgoProfileImage(fileId: string): void {
    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.ngoProfileImage.set(safeUrl);
      },
      error: (err) => {
        console.error('Error al cargar imagen de perfil de la organización:', err);
      }
    });
  }

  /**
   * Obtiene el porcentaje de progreso de la campaña.
   * @returns number
   */
  getProgressPercentage(): number {
    if (!this.campaign || !this.campaign.goal_amount || !this.campaign.current_amount) return 0;
    return (this.campaign.current_amount / this.campaign.goal_amount) * 100;
  }

  /**
   * Obtiene los días restantes para la campaña.
   * @returns number
   */
  getRemainingDays(): number {
    if (!this.campaign) return 0;
    const endDate = this.campaign.end_date_time;
    if (!endDate) return 0;
    
    // Crear fechas sin considerar la hora para comparación de días completos
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  /** Formatea una fecha al formato local. */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Fecha no disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    return dateObj.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /** Formatea un monto al formato de moneda local. */
  formatCurrency(amount: number): string {
    if (!amount || amount == 0) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  //Cambia la visibilidad del panel de comentarios
  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Navega a una URL con parámetros opcionales.
   * @param url - dirección a la que se quiere navegar
   * @param params {[key: string]: string} - parámetros adicionales para la navegación
   * @examples
   * this.navigate('/my-profile');
   * this.navigate('/campaigns/:id', { id: '123' });
   * this.navigate('/campaigns/:id/donations/:donationId', { id: '123', donationId: '456' });
   */
  navigate(url: string, params?: { [key: string]: string }): void {
    if (params) {
      Object.keys(params).forEach(key => {
        //reemplaza solo coincidencias exactas de :key seguidas por / o fin de string
        url = url.replace(new RegExp(`:${key}(?=/|$)`, 'g'), params[key]);
      });
    }

    this.router.navigate([url]);
    console.log('Navegando a:', url);
  }

  // ========== MÉTODOS DE EDICIÓN ==========

  startCarousel(): void {
    // Limpiar cualquier intervalo existente
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    
    // Cambiar de imagen cada 5 segundos
    this.carouselInterval = setInterval(() => {
      const images = this.carouselImages();
      if (images.length > 0) {
        const nextIndex = (this.currentImageIndex() + 1) % images.length;
        this.currentImageIndex.set(nextIndex);
        this.campaignImageUrl.set(images[nextIndex]);
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruya
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadImageToCache(imageId: string): void {
    this.fileService.getFile(imageId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.imageCache.set(imageId, safeUrl);
      },
      error: (err) => {
        console.error('Error al cargar imagen:', err);
      }
    });
  }

  getImageUrl(imageId: string): SafeUrl | null {
    return this.imageCache.get(imageId) || null;
  }

  getImagesToEdit(): { imageId: string, url: SafeUrl | null }[] {
    return this.imagesToKeep().map(imageId => ({
      imageId,
      url: this.getImageUrl(imageId)
    }));
  }

  toggleEditMode(): void {
    const newEditMode = !this.isEditMode();
    this.isEditMode.set(newEditMode);
    
    if (newEditMode && this.campaign) {
      // Al activar el modo edición, cargar valores actuales
      const endDate = this.campaign.end_date_time;
      const endDateString = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
      
      this.editForm.patchValue({
        title: this.campaign.title,
        description: this.campaign.description,
        goalAmount: this.campaign.goal_amount || 0,
        endDateTime: endDateString,
        categoryIds: this.campaign.categories.map(c => c.id)
      });
      
      // Cargar las tags existentes en el signal
      this.editTags.set([...this.campaign.tags]);
    } else {
      // Si se cancela, resetear el formulario y las tags
      this.editForm.reset();
      this.editTags.set([]);
      if (this.campaign?.images) {
        this.imagesToKeep.set([...this.campaign.images]);
      }
    }
  }

  removeImage(imageId: string): void {
    const current = this.imagesToKeep();
    this.imagesToKeep.set(current.filter(id => id !== imageId));
  }

  isCategorySelected(categoryId: string): boolean {
    const selectedIds = this.editForm.controls.categoryIds.value || [];
    return selectedIds.includes(categoryId);
  }

  toggleCategory(categoryId: string): void {
    const current = this.editForm.controls.categoryIds.value || [];
    if (current.includes(categoryId)) {
      this.editForm.controls.categoryIds.setValue(current.filter(id => id !== categoryId));
    } else {
      this.editForm.controls.categoryIds.setValue([...current, categoryId]);
    }
  }

  onTagsChange(tags: string[]): void {
    this.editTags.set(tags);
  }

  async saveChanges(): Promise<void> {
    if (!this.campaignId) return;

    this.isSaving.set(true);

    try {
      const formValue = this.editForm.value;
      
      // Array para almacenar los IDs finales de imágenes
      let finalImageIds: string[] = [...this.imagesToKeep()];

      // Subir nuevas imágenes si hay
      if (formValue.images && formValue.images.length > 0) {
        const imageFiles = Array.from(formValue.images);
        const imageUploadPromises = imageFiles.map(file => 
          this.fileService.uploadFile(file).toPromise()
        );
        
        const newImageIds = await Promise.all(imageUploadPromises);
        finalImageIds = [...finalImageIds, ...newImageIds.filter(id => id !== undefined) as string[]];
        
        this.toastService.open(`${imageFiles.length} imagen(es) subida(s) exitosamente`, 'success', 2000);
      }

      // Crear el DTO de actualización
      const updateDto: PutCampaignDto = {
        imageIds: finalImageIds
      };

      // Agregar campos solo si fueron modificados
      if (formValue.title && formValue.title.trim() !== '') {
        updateDto.title = formValue.title.trim();
      }
      if (formValue.description && formValue.description.trim() !== '') {
        updateDto.description = formValue.description.trim();
      }
      if (formValue.goalAmount && formValue.goalAmount > 0) {
        updateDto.goalAmount = formValue.goalAmount;
      }
      if (formValue.endDateTime) {
        updateDto.endDateTime = new Date(formValue.endDateTime);
      }
      if (formValue.categoryIds && formValue.categoryIds.length > 0) {
        updateDto.categoryIds = formValue.categoryIds;
      }
      if (this.editTags().length > 0) {
        updateDto.tags = this.editTags();
      }

      await this.campaignService.updateCampaign(this.campaignId, updateDto).toPromise();

      this.toastService.open('Campaña actualizada exitosamente', 'success', 3000);
      this.isEditMode.set(false);
      this.editForm.reset();
      
      // Recargar la campaña para ver los cambios
      this.loadCampaign();
      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      this.toastService.open('Error al actualizar la campaña', 'error', 3000);
    } finally {
      this.isSaving.set(false);
    }
  }
}
