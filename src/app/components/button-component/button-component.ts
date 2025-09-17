import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'error' | 'white' | 'violet';

@Component({
  selector: 'app-button-component',
  imports: [CommonModule],
  templateUrl: './button-component.html',
  styleUrl: './button-component.scss'
})
export class ButtonComponent {
  @Input() label: string = 'Click me';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() variant: Variant = 'primary';
  @Input() outline: boolean = false;
  @Input() rounded: boolean = false;

  get classes(): string[] {
    const classes = ['btn', `btn-${this.variant}`];
    if (this.outline) classes.push('btn-outline');
    if (this.rounded) classes.push('btn-pill');
    return classes;
  }
}