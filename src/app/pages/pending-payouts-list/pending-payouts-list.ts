import { Component, inject, OnInit, signal } from '@angular/core';
import { PayoutDto } from '../../models/api/payouts';
import { PayoutService } from '../../services/api/payout-service';
import { FileService } from '../../services/api/file-service';
import { ToastService } from '../../services/ui/toast-service';
import { finalize, forkJoin } from 'rxjs';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { PayStatusPipe } from '../../pipes/pay-status-pipe';
import { PayColorPipe } from '../../pipes/pay-status-color';
import { OrganizationService } from '../../services/api/organization-service';
import { GetOrganizationDto } from '../../models/api/organization';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pending-payouts-list',
  imports: [CurrencyPipe, DatePipe, NgClass, IconComponent, ButtonComponent, PayStatusPipe, PayColorPipe],
  templateUrl: './pending-payouts-list.html',
  styleUrl: './pending-payouts-list.scss'
})
export class PendingPayoutsList implements OnInit {
  payouts = signal<PayoutDto[]>([]);
  isLoading = signal<boolean>(false);
  uploadingFiles = signal<Map<string, boolean>>(new Map());
  selectedFiles = signal<Map<string, File>>(new Map());
  uploadedFileIds = signal<Map<string, string>>(new Map());
  approvingPayouts = signal<Map<string, boolean>>(new Map());
  organizationsMap = signal<Map<string, GetOrganizationDto>>(new Map());
  imageCache = new Map<string, SafeUrl>();

  payoutService = inject(PayoutService);
  fileService = inject(FileService);
  toastService = inject(ToastService);
  organizationService = inject(OrganizationService);
  sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.fetchPendingPayouts();
  }

  fetchPendingPayouts(): void {
    this.isLoading.set(true);
    
    this.payoutService.payoutsPending()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.payouts.set(data);
          console.log(data);
          this.loadOrganizations(data);
        },
        error: () => {
          //this.toastService.open('Error al cargar solicitudes pendientes', 'error', 3000);
        }
      });
  }

  loadOrganizations(payouts: PayoutDto[]): void {
    const uniqueNgoIds = [...new Set(payouts.map(p => p.ngo_id))];
    
    const organizationRequests = uniqueNgoIds.map(ngoId => 
      this.organizationService.getOrganizationById(ngoId)
    );

    if (organizationRequests.length === 0) return;

    forkJoin(organizationRequests).subscribe({
      next: (organizations) => {
        const orgMap = new Map<string, GetOrganizationDto>();
        organizations.forEach(org => {
          orgMap.set(org.ngoId, org);
          // Cargar imagen de perfil si existe
          if (org.profileFileId) {
            this.loadImage(org.profileFileId);
          }
        });
        this.organizationsMap.set(orgMap);
      },
      error: (error) => {
        console.error('Error al cargar organizaciones:', error);
      }
    });
  }

  loadImage(fileId: string): void {
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

  getOrganization(ngoId: string): GetOrganizationDto | undefined {
    return this.organizationsMap().get(ngoId);
  }

  getImageUrl(fileId: string | undefined): SafeUrl | null {
    if (!fileId) return null;
    return this.imageCache.get(fileId) || null;
  }

  onFileSelected(event: Event, payoutId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        this.toastService.open('Solo se permiten archivos PDF o imágenes JPG/PNG', 'error', 3000);
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.open('El archivo no debe superar los 5MB', 'error', 3000);
        return;
      }

      const filesMap = this.selectedFiles();
      filesMap.set(payoutId, file);
      this.selectedFiles.set(new Map(filesMap));

      // Auto-upload
      this.uploadProofFile(payoutId, file);
    }
  }

  uploadProofFile(payoutId: string, file: File): void {
    const uploadingMap = this.uploadingFiles();
    uploadingMap.set(payoutId, true);
    this.uploadingFiles.set(new Map(uploadingMap));

    this.fileService.uploadFile(file).subscribe({
      next: (fileId) => {
        const fileIdsMap = this.uploadedFileIds();
        fileIdsMap.set(payoutId, fileId);
        this.uploadedFileIds.set(new Map(fileIdsMap));
        
        const uploadingMap = this.uploadingFiles();
        uploadingMap.set(payoutId, false);
        this.uploadingFiles.set(new Map(uploadingMap));
        
        this.toastService.open('Comprobante subido correctamente', 'success', 2000);
      },
      error: () => {
        const uploadingMap = this.uploadingFiles();
        uploadingMap.set(payoutId, false);
        this.uploadingFiles.set(new Map(uploadingMap));
        
        this.toastService.open('Error al subir el comprobante', 'error', 3000);
      }
    });
  }

  approvePayout(payoutId: string): void {
    const fileId = this.uploadedFileIds().get(payoutId);
    
    if (!fileId) {
      this.toastService.open('Debe subir un comprobante antes de aprobar', 'warning', 3000);
      return;
    }

    const approvingMap = this.approvingPayouts();
    approvingMap.set(payoutId, true);
    this.approvingPayouts.set(new Map(approvingMap));

    this.payoutService.approvePayout(payoutId, fileId)
      .pipe(finalize(() => {
        const approvingMap = this.approvingPayouts();
        approvingMap.set(payoutId, false);
        this.approvingPayouts.set(new Map(approvingMap));
      }))
      .subscribe({
        next: () => {
          this.toastService.open('Solicitud aprobada exitosamente', 'success', 3000);
          this.fetchPendingPayouts();
          
          // Limpiar estados
          const filesMap = this.selectedFiles();
          filesMap.delete(payoutId);
          this.selectedFiles.set(new Map(filesMap));
          
          const fileIdsMap = this.uploadedFileIds();
          fileIdsMap.delete(payoutId);
          this.uploadedFileIds.set(new Map(fileIdsMap));
        },
        error: () => {
          this.toastService.open('Error al aprobar la solicitud', 'error', 3000);
        }
      });
  }

  isUploading(payoutId: string): boolean {
    return this.uploadingFiles().get(payoutId) || false;
  }

  isApproving(payoutId: string): boolean {
    return this.approvingPayouts().get(payoutId) || false;
  }

  hasUploadedFile(payoutId: string): boolean {
    return !!this.uploadedFileIds().get(payoutId);
  }

  getFileName(payoutId: string): string {
    const file = this.selectedFiles().get(payoutId);
    return file ? file.name : '';
  }
}
