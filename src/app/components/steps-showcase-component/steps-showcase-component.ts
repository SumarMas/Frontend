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
  @Input() accent: Accent = 'primary';
  @Input() intervalMs = 5000;

  get activeStepClass(): string { return `step-${this.accent}`; }

  selected = 0;

  //animación y progreso
  animating = false;
  progress = 0;
  private tickId?: number;
  private nextId?: number;

  ngOnInit() { this.startAutoStep(); }
  ngOnDestroy() { this.clearTimers(); }

  changeStep(index: number) {
    if (index === this.selected) return;
    this.fadeTo(index);
    this.restartProgress();
  }

  get progressClass() {
  const m: Record<Accent,string> = {
    primary:'progress-primary', secondary:'progress-secondary', neutral:'progress-neutral',
    info:'progress-info', success:'progress-success', warning:'progress-warning', error:'progress-error'
  };
  return m[this.accent];
}

  //auto avance
  private startAutoStep() {
    this.clearTimers();
    
    const step = 16;
    const inc = (100 / (this.intervalMs / step));
    this.tickId = window.setInterval(() => {
      this.progress = Math.min(100, this.progress + inc);
    }, step);

    this.nextId = window.setInterval(() => {
      this.fadeTo((this.selected + 1) % this.steps.length);
      this.progress = 0;
    }, this.intervalMs);
  }

  private restartProgress() {
    this.progress = 0;
    this.startAutoStep();
  }

  //no resetea el profreso
  pause() { this.clearTimers(false); }

  resume() { this.startAutoStep(); }

  private clearTimers(resetProgress = false) {
    if (this.tickId) { clearInterval(this.tickId); this.tickId = undefined; }
    if (this.nextId) { clearInterval(this.nextId); this.nextId = undefined; }
    if (resetProgress) this.progress = 0;
  }

  //animacion cambio imagen
  private fadeTo(nextIndex: number) {
    this.animating = true;
    setTimeout(() => {
      this.selected = nextIndex;
      this.animating = false;
    }, 150);
  }
}
