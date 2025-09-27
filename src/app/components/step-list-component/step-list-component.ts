import { NgClass } from '@angular/common';
import { Component, input, Input, Signal } from '@angular/core';

type Accent = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'warning' | 'error';
type Step = { title: string; status: 'completed' | 'failed' | 'pending' };

@Component({
  selector: 'app-step-list-component',
  imports: [NgClass],
  templateUrl: './step-list-component.html',
  styleUrl: './step-list-component.scss'
})
export class StepListComponent {
  steps = input<Step[]>([]);
  @Input() accent: Accent = 'primary';

  get activeStepClass(): string {
    return `step-${this.accent}`;
  }
  private readonly completedIcon = '✔️';
  private readonly failedIcon = '❌';

  selected = 0;

  dataContent(i: number, step: Step): string {
    if (step.status === 'completed') return this.completedIcon;
    if (step.status === 'failed') return this.failedIcon;

    //si es pendiente, muestro el numero del paso
    return String(i + 1);
  }

  //pinta de rojo el fallo, lo hecho y el actual con el color seleccionado por la persona
  stepClass(i: number, step: Step) {
    if (step.status === 'failed') {
      return { 'step-error': true };
    }
    if (step.status === 'completed') {
      return { [this.activeStepClass]: true };
    }

    //pendiente, si el anterior es completed o failed, es el paso actual
    const prevStatus = this.steps()[i - 1]?.status;
    const isCurrent = prevStatus === 'completed' || prevStatus === 'failed';
    if (step.status === 'pending' && isCurrent) {
      return { [this.activeStepClass]: true };
    }
    return {};
  }
}
