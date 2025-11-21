import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { PayoutDto } from '../../models/api/payouts';
import { PayStatusPipe } from '../../pipes/pay-status-pipe';
import { PayColorPipe } from '../../pipes/pay-status-color';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { PayoutService } from '../../services/api/payout-service';
import { ToastService } from '../../services/ui/toast-service';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../components/button-component/button-component';
import { ReusableModalComponent } from "../../components/reusable-modal-component/reusable-modal-component";
import { IconComponent } from '../../components/icon-component/icon-component';
import { FileService } from '../../services/api/file-service';

@Component({
  selector: 'app-my-payouts',
  imports: [PayStatusPipe, PayColorPipe, CurrencyPipe, 
    NgClass, ButtonComponent, DatePipe, ReusableModalComponent, IconComponent],
  templateUrl: './my-payouts.html',
  styleUrl: './my-payouts.scss'
})
export class MyPayouts implements OnInit {
  payouts = signal<PayoutDto[]>([]);
  isLoading = signal<boolean>(false);
  isRequestingPayout = signal<boolean>(false);
  
  // Datos mock para pruebas
  private mockPayouts: PayoutDto[] = [
    {
      payout_request_id: 'payout-mock-1',
      ngo_id: 'mock-1',
      amount: 125000,
      request_datetime: new Date('2025-11-15T10:30:00'),
      approval_datetime: null,
      status: 'APPROVED',
      proof_file_id: null,
      donations: [
        {
          payout_request_id: 'payout-mock-1',
          donation_id: 'donation-1',
          campaign_id: 'campaign-1',
          amount: 75000
        },
        {
          payout_request_id: 'payout-mock-1',
          donation_id: 'donation-2',
          campaign_id: 'campaign-1',
          amount: 50000
        }
      ]
    },
    {
      payout_request_id: 'payout-mock-2',
      ngo_id: 'mock-2',
      amount: 87500,
      request_datetime: new Date('2025-11-18T09:15:00'),
      approval_datetime: null,
      status: 'PENDING',
      proof_file_id: null,
      donations: [
        {
          payout_request_id: 'payout-mock-2',
          donation_id: 'donation-3',
          campaign_id: 'campaign-2',
          amount: 87500
        }
      ]
    }
  ];

  @ViewChild('requestPayoutModal') requestPayoutModal!: ReusableModalComponent;

  payoutService = inject(PayoutService);
  toastService = inject(ToastService);
  fileService = inject(FileService);

  totalAvailable = computed(()=> {
    let total = 0;
    this.payouts().forEach(payout => {
      if (payout.status === 'APPROVED') {
        total += payout.amount;
      }
    })
    return total;
  })

  ngOnInit(): void {
    this.fetchPayouts();
  }

  fetchPayouts(): void {
    this.isLoading.set(true);

    // Comentar para usar datos reales del backend
    // this.payoutService.getMyPayouts().pipe(finalize(() => this.isLoading.set(false))).subscribe({
    //   next: (data) => {
    //     this.payouts.set(data);
    //   },
    //   error: (error) => {
    //     this.toastService.open('Error al cargar las solicitudes de pago', 'error', 3000);
    //   }
    // })
    
    // Usar datos mock para pruebas
    setTimeout(() => {
      this.payouts.set(this.mockPayouts);
      this.isLoading.set(false);
    }, 500);
  }
  
  confirmPayoutRequest(): void {
    this.isRequestingPayout.set(true);
    
    this.payoutService.postRequest()
      .pipe(finalize(() => this.isRequestingPayout.set(false)))
      .subscribe({
        next: (data) => {
          this.toastService.open('Solicitud de pago creada con éxito', 'success', 3000);
          this.requestPayoutModal.close();
          this.fetchPayouts();
        },
        error: (error) => {
          this.toastService.open('Error al crear la solicitud de pago', 'error', 3000);
        }
      });
  }

  downloadProofFile(fileId: string): void {
    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante-${fileId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.toastService.open('Comprobante descargado', 'success', 2000);
      },
      error: () => {
        this.toastService.open('Error al descargar comprobante', 'error', 3000);
      }
    });
  }

  openModal(): void {
    this.requestPayoutModal.open();
  }
  
  closeModal(): void {
    this.requestPayoutModal.close();
  }
}
