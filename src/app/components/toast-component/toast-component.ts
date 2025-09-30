import { NgClass } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IconComponent } from "../icon-component/icon-component";
import { ICON_BY_TYPE, ALERT_CLASS_BY_TYPE, POS_CLASSES, ToastType } from '../../models/toast';

@Component({
  selector: 'app-toast-component',
  imports: [NgClass, IconComponent],
  templateUrl: './toast-component.html',
  styleUrl: './toast-component.scss'
})
export class ToastComponent implements OnInit, OnDestroy{
  @Input() message: string = 'This is a toast message';
  @Input() type: ToastType = 'info';
  @Input() duration: number = 3000;
  @Input() autoClose: boolean = true;
  @Input() position: keyof typeof POS_CLASSES = 'top-right';

  @Output() closed = new  EventEmitter<void>();

  show = true;
  hovered = false;

  private timeoutId: any = null;
  private startAt = 0;
  private remaining = this.duration;

  get positionClass(): string {
    return POS_CLASSES[this.position];
  }

  get alertClass(): string {
    return `alert alert-${ALERT_CLASS_BY_TYPE[this.type]}`;
  }

  get iconName(): string {
    return ICON_BY_TYPE[this.type];
  }

  ngOnInit(): void {
    if (this.autoClose && this.duration > 0) {
      this.startTimer(this.duration);
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  //----------------------------interactuar con el mouse---------------------------
  @HostListener('mouseenter') onEnter() { 
    this.hovered = true;
    this.pauseTimer(); 
  }

  @HostListener('mouseleave') onLeave()  { 
    this.hovered = false;
    this.resumeTimer(); 
  }

  private startTimer(ms: number) {
    this.clearTimer();
    this.remaining = ms;
    this.startAt = Date.now();
    this.timeoutId = setTimeout(() => this.close(), ms);
  }

  private pauseTimer() {
    if (!this.timeoutId) return;
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    const elapsed = Date.now() - this.startAt;
    this.remaining = Math.max(0, this.remaining - elapsed);
  }

  private resumeTimer() {
    if (this.timeoutId || this.remaining <= 0) return;
    this.startAt = Date.now();
    this.timeoutId = setTimeout(() => this.close(), this.remaining);
  }

  private clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  close() {
    this.show = false;
    setTimeout(() => {
      this.clearTimer();
      this.closed.emit();
    }, 300); //esperar a que termine la animación
  }
}
