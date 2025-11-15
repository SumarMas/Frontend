import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IconComponent } from '../icon-component/icon-component';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'error' | 'white' | 'violet';
type Size = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-button-component',
  imports: [CommonModule, IconComponent],
  templateUrl: './button-component.html',
  styleUrl: './button-component.scss'
})
export class ButtonComponent {
  // Inputs usando signal-based API
  label = input<string>('');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  variant = input<Variant>('primary');
  outline = input<boolean>(false);
  rounded = input<boolean>(false);
  block = input<boolean>(false);
  size = input<Size>('md');
  icon = input<string | undefined>(undefined);
  colorIcon = input<string | undefined>(undefined);
  tooltip = input<string | null>(null);
  tooltipPosition = input<'top' | 'right' | 'bottom' | 'left'>('top');

  // Output para el evento de click controlado
  onClick = output<void>();

  get classes(): string[] {
    const classes = ['btn', `btn-${this.variant()}`, `btn-${this.size()}`];
    if (this.outline()) classes.push('btn-outline');
    if (this.rounded()) classes.push('btn-pill');
    if (this.block()) classes.push('w-full');
    return classes;
  }

  get tooltipClasses(): string[] {
    if (!this.tooltip()) return [];
    const classes = [`tooltip`, `tooltip-${this.tooltipPosition()}`];
    if(this.block()) classes.push('w-full');
    return classes;
  }

  // Método para manejar el click interno
  handleClick(): void {
    // Solo emitir el evento si el botón no está disabled ni loading
    if (!this.disabled() && !this.isLoading()) {
      this.onClick.emit();
    }
  }
}