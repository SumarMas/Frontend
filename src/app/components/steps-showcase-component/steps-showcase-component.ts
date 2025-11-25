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
  private animationFrameId?: number;
  private startTime?: number;
  private isPaused = false;
  private pausedProgress = 0;

  ngOnInit() { this.startAutoStep(); }
  ngOnDestroy() { this.clearAnimation(); }

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

  //auto avance con requestAnimationFrame (más suave)
  private startAutoStep() {
    this.clearAnimation();
    this.isPaused = false;
    this.startTime = performance.now();
    
    const animate = (currentTime: number) => {
      if (this.isPaused) return;
      
      const elapsed = currentTime - (this.startTime || currentTime);
      this.progress = Math.min(100, (elapsed / this.intervalMs) * 100);
      
      if (this.progress >= 100) {
        this.fadeTo((this.selected + 1) % this.steps.length);
        this.startTime = currentTime;
        this.progress = 0;
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private restartProgress() {
    this.progress = 0;
    this.pausedProgress = 0;
    this.startAutoStep();
  }

  //pausar sin resetear el progreso
  pause() {
    this.isPaused = true;
    this.pausedProgress = this.progress;
    this.clearAnimation();
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.startTime = performance.now() - (this.pausedProgress / 100) * this.intervalMs;
      this.startAutoStep();
    }
  }

  private clearAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
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
