import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-reusable-modal-component',
  imports: [],
  templateUrl: './reusable-modal-component.html',
  styleUrl: './reusable-modal-component.scss'
})
export class ReusableModalComponent {
  //referencia al elemento <dialog>
  @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;
  @Output() closeModalEvent = new EventEmitter<void>();

  //metodos para abrir y cerrar el modal
  public open(): void {
    this.modalRef.nativeElement.showModal();
  }

  public close(): void {
    this.modalRef.nativeElement.close();
    this.closeModalEvent.emit();
  }
  
  //manejo del cierre
  onClose() {
    this.closeModalEvent.emit();
  }
}
