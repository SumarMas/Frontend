import { Component, inject, OnInit, signal } from '@angular/core';
import { PayoutDto } from '../../models/api/payouts';
import { PayoutService } from '../../services/api/payout-service';
import { FileService } from '../../services/api/file-service';
import { ToastService } from '../../services/ui/toast-service';
import { finalize } from 'rxjs';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { IconComponent } from '../../components/icon-component/icon-component';
import { ButtonComponent } from '../../components/button-component/button-component';
import { PayStatusPipe } from '../../pipes/pay-status-pipe';
import { PayColorPipe } from '../../pipes/pay-status-color';

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

  payoutService = inject(PayoutService);
  fileService = inject(FileService);
  toastService = inject(ToastService);

  // Datos mock para pruebas
  private mockPayouts: PayoutDto[] = [
    {
      payout_request_id: 'payout-pending-1',
      ngo_id: 'ngo-fundacion-esperanza',
      amount: 450000,
      request_datetime: new Date('2025-11-18T14:30:00'),
      approval_datetime: null,
      status: 'PENDING',
      proof_file_id: null,
      donations: [
        {
          payout_request_id: 'payout-pending-1',
          donation_id: 'donation-1',
          campaign_id: 'campaign-educacion',
          amount: 250000
        },
        {
          payout_request_id: 'payout-pending-1',
          donation_id: 'donation-2',
          campaign_id: 'campaign-educacion',
          amount: 150000
        },
        {
          payout_request_id: 'payout-pending-1',
          donation_id: 'donation-3',
          campaign_id: 'campaign-salud',
          amount: 50000
        }
      ]
    },
    {
      payout_request_id: 'payout-pending-2',
      ngo_id: 'ngo-ayuda-solidaria',
      amount: 320000,
      request_datetime: new Date('2025-11-19T09:15:00'),
      approval_datetime: null,
      status: 'PENDING',
      proof_file_id: null,
      donations: [
        {
          payout_request_id: 'payout-pending-2',
          donation_id: 'donation-4',
          campaign_id: 'campaign-alimentos',
          amount: 200000
        },
        {
          payout_request_id: 'payout-pending-2',
          donation_id: 'donation-5',
          campaign_id: 'campaign-alimentos',
          amount: 120000
        }
      ]
    },
    {
      payout_request_id: 'payout-pending-3',
      ngo_id: 'ngo-manos-unidas',
      amount: 580000,
      request_datetime: new Date('2025-11-19T16:45:00'),
      approval_datetime: null,
      status: 'PENDING',
      proof_file_id: null,
      donations: [
        {
          payout_request_id: 'payout-pending-3',
          donation_id: 'donation-6',
          campaign_id: 'campaign-vivienda',
          amount: 350000
        },
        {
          payout_request_id: 'payout-pending-3',
          donation_id: 'donation-7',
          campaign_id: 'campaign-vivienda',
          amount: 150000
        },
        {
          payout_request_id: 'payout-pending-3',
          donation_id: 'donation-8',
          campaign_id: 'campaign-educacion',
          amount: 80000
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.fetchPendingPayouts();
  }

  fetchPendingPayouts(): void {
    this.isLoading.set(true);
    
    // Comentar para usar datos reales del backend
    // this.payoutService.payoutsPending()
    //   .pipe(finalize(() => this.isLoading.set(false)))
    //   .subscribe({
    //     next: (data) => {
    //       this.payouts.set(data);
    //     },
    //     error: () => {
    //       this.toastService.open('Error al cargar solicitudes pendientes', 'error', 3000);
    //     }
    //   });

    // Usar datos mock para pruebas
    setTimeout(() => {
      this.payouts.set(this.mockPayouts);
      this.isLoading.set(false);
    }, 800);
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
