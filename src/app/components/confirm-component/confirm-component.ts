import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconComponent } from "../icon-component/icon-component";
import { ButtonComponent } from "../button-component/button-component";
import { ConfirmVariant } from '../../models/ui/confirm';

@Component({
  selector: 'app-confirm-component',
  imports: [IconComponent, ButtonComponent],
  templateUrl: './confirm-component.html',
  styleUrl: './confirm-component.scss'
})
export class ConfirmComponent {
  @Input() title = 'Confirmación';
  @Input() message = '¿Seguro que deseas continuar?';
  @Input() confirmText = 'Aceptar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: ConfirmVariant = 'info';
  @Input() dismissible = true;
  @Input() backdropDismiss = true;
  @Input() escDismiss = true;

  //indica el resultado del modal
  @Output() closed = new EventEmitter<boolean>();

  get iconandColor() {
    switch (this.variant) {
      case 'success': return { icon: 'check', color: 'text-green-500' };
      case 'error': return { icon: 'error', color: 'text-red-500' };
      case 'warning': return { icon: 'warning', color: 'text-yellow-500' };
      case 'info': return { icon: 'info-circle', color: 'text-blue-500' };
      default: return { icon: 'question-circle', color: 'text-gray-500' };
    }
  }

  onConfirm() { this.closed.emit(true); }
  onCancel() { this.closed.emit(false); }

  onBackdrop() {
    if (this.backdropDismiss) this.onCancel();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.escDismiss) {
      e.preventDefault();
      this.onCancel();
    }
  }
}
