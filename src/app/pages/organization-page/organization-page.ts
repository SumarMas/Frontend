import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { GetOrganizationDto, PutOrganizationDto } from '../../models/api/organization';
import { IconComponent } from '../../components/icon-component/icon-component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../../components/button-component/button-component";
import { AuthService } from '../../services/api/auth-service';
import { ApprovalDetailsComponent } from "../../components/approval-details-component/approval-details-component";
import { ReusableModalComponent } from '../../components/reusable-modal-component/reusable-modal-component';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../services/ui/toast-service';
import { OrganizationService } from '../../services/api/organization-service';
import { FileService } from '../../services/api/file-service';

@Component({
  selector: 'app-organization-page',
  imports: [IconComponent, CommonModule, ButtonComponent, ReusableModalComponent, ApprovalDetailsComponent, ReactiveFormsModule],
  templateUrl: './organization-page.html',
  styleUrl: './organization-page.scss'
})
export class OrganizationPage implements OnInit {
  ngoId: string | null = null;
  isEditMode = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  editForm: FormGroup<{
    documentsId: FormControl<string[] | null>,
    images: FormControl<File[] | null>
  }>;

  organization = signal<GetOrganizationDto | null>(null);

  // Cache de imágenes y documentos
  imageCache = new Map<string, SafeUrl>();
  documentCache = new Map<string, SafeUrl>();

  view: string = '';

  @ViewChild('approvalModal') approvalModalRef!: ReusableModalComponent;
  @ViewChild('approvalDetails') approvalDetailsRef!: ApprovalDetailsComponent;

  authService = inject(AuthService);
  organizationService = inject(OrganizationService);
  fileService = inject(FileService);
  sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  constructor() {
    this.editForm = this.fb.group({
      documentsId: new FormControl<string[] | null>(null),
      images: new FormControl<File[] | null>(null)
    });
  }

  ngOnInit(): void {
    // Obtener el ngoId de la ruta
    this.ngoId = this.route.snapshot.paramMap.get('ngoId')?.toString() || null;

    if (this.ngoId) {
      this.loadOrganization(this.ngoId);
    } else {
      this.toastService.open('ID de organización no válido', 'error', 3000);
      this.router.navigate(['/organizations/all']);
    }

    console.log(this.authService.roles());
    
  }

  loadOrganization(ngoId: string) {
    this.isLoading.set(true);
    this.organizationService.getOrganizationById(ngoId).subscribe({
      next: (org) => {
        this.organization.set(org);
        this.isLoading.set(false);

        // Configurar el título de la página
        const baseTitle = this.route.snapshot.data['title'] || 'Organización';
        const newTitle = `${baseTitle} - ${org.name}`;
        this.titleService.setTitle(newTitle);

        // Cargar imágenes del carrusel
        if (org.images && org.images.length > 0) {
          org.images.forEach(img => {
            if (img.imageId) {
              this.loadImage(img.imageId);
            }
          });
        }

        // Cargar imagen de perfil y banner
        if (org.profileFileId) {
          this.loadImage(org.profileFileId);
        }
        if (org.bannerFileId) {
          this.loadImage(org.bannerFileId);
        }

        // Cargar documentos
        if (org.documentsId && org.documentsId.length > 0) {
          org.documentsId.forEach(docId => {
            this.loadDocument(docId);
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar organización:', error);
        this.isLoading.set(false);
        this.toastService.open('Error al cargar la organización', 'error', 3000);
        this.router.navigate(['/organizations/all']);
      }
    });
  }

  loadImage(fileId: string) {
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

  loadDocument(fileId: string) {
    if (this.documentCache.has(fileId)) return;

    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        // Almacenamos tanto la URL como el tipo de archivo
        this.documentCache.set(fileId, safeUrl);
        this.documentCache.set(`${fileId}_type`, blob.type as any);
      },
      error: (error) => {
        console.error('Error al cargar documento:', error);
      }
    });
  }

  getImageUrl(fileId: string | undefined): SafeUrl | null {
    if (!fileId) return null;
    return this.imageCache.get(fileId) || null;
  }

  getDocumentUrl(fileId: string | undefined): SafeUrl | null {
    if (!fileId) return null;
    return this.documentCache.get(fileId) || null;
  }

  // Obtener imágenes del carrusel
  getCarouselImages(): { url: SafeUrl | null, alt: string, imageId: string }[] {
    const org = this.organization();
    if (!org || !org.images || org.images.length === 0) return [];
    
    return org.images
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(img => ({
        url: this.getImageUrl(img.imageId),
        alt: `${org.name} - Imagen ${img.orderIndex}`,
        imageId: img.imageId
      }));
  }

  // Obtener documentos con nombres y tipos
  getDocuments(): { name: string, url: SafeUrl | null, fileId: string, type: string, icon: string }[] {
    const org = this.organization();
    if (!org || !org.documentsId || org.documentsId.length === 0) return [];
    
    return org.documentsId.map((docId, index) => {
      const fileType = this.documentCache.get(`${docId}_type`) as string || '';
      let type = 'Archivo';
      let icon = 'description'; // icono por defecto
      let extension = '';
      
      if (fileType.includes('pdf')) {
        type = 'PDF';
        icon = 'picture_as_pdf';
        extension = '.pdf';
      } else if (fileType.includes('image')) {
        type = 'Imagen';
        icon = 'image';
        const imageExt = fileType.split('/')[1];
        extension = `.${imageExt}`;
      }
      
      return {
        name: `Documento Legal ${index + 1}${extension}`,
        url: this.getDocumentUrl(docId),
        fileId: docId,
        type: type,
        icon: icon
      };
    });
  }

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
  openApprovalModal() {
    this.approvalModalRef.open();
    this.approvalDetailsRef.resetForm();
  }

  onApprovalSuccess() {
    this.approvalModalRef.close();
    this.approvalDetailsRef.resetForm();
  }

  //------------------------------------Files para descargar------------------------------------

  downloadFile(file: { name: string; url: SafeUrl | null; fileId: string; type: string }) {
    if (!file.url) {
      this.toastService.open('El archivo no está disponible', 'error', 3000);
      return;
    }

    // Convertir SafeUrl de vuelta a string para descargar
    const url = (file.url as any).changingThisBreaksApplicationSecurity || file.url.toString();
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        
        // Usar el nombre del archivo que ya incluye la extensión
        a.download = file.name;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Limpiar la URL después de un tiempo
        setTimeout(() => window.URL.revokeObjectURL(objectUrl), 100);
        
        this.toastService.open(`Descargando ${file.type}...`, 'success', 2000);
      })
      .catch(err => {
        console.error('Error al descargar', err);
        this.toastService.open('Error al descargar el archivo', 'error', 3000);
      });
  }

  //------------------------------------Edición de organización------------------------------------

  toggleEditMode() {
    this.isEditMode.set(!this.isEditMode());
    if (!this.isEditMode()) {
      // Si se cancela, resetear el formulario
      this.editForm.reset();
    }
  }

  onFileSelect(event: Event, type: 'documents' | 'images') {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      if (type === 'documents') {
        // Por ahora solo guardamos los archivos, en producción subirías a servidor
        console.log('Documentos seleccionados:', files);
      } else {
        this.editForm.patchValue({ images: files });
      }
    }
  }

  async saveChanges() {
    if (this.editForm.valid && this.ngoId) {
      this.isSaving.set(true);

      // TODO: Implementar lógica de actualización cuando esté disponible en el backend
      // Por ahora solo mostramos un mensaje
      setTimeout(() => {
        this.toastService.open('Funcionalidad de edición en desarrollo', 'info', 3000);
        this.isEditMode.set(false);
        this.isSaving.set(false);
        this.editForm.reset();
      }, 1000);
    }
  }
}