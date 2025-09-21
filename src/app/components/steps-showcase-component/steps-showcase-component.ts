import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

type Step = { title: string; subtitle?: string; body: string; img?: string };
type Accent = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-steps-showcase-component',
  imports: [NgClass],
  templateUrl: './steps-showcase-component.html',
  styleUrl: './steps-showcase-component.scss'
})
export class StepsShowcaseComponent {
  @Input() steps: Step[] = [];
  @Input() title = 'Cómo funciona';
  @Input() accent: Accent = 'primary';

  get activeStepClass(): string {
    return `step-${this.accent}`;
  }

  selected = 0;
}
