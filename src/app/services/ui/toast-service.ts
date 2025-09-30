import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable } from '@angular/core';
import { ToastComponent } from '../../components/toast-component/toast-component';
import { DEFAULT_DURATION_MS, Pos, POS_CLASSES, ToastType } from '../../models/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private containers = new Map<Pos, HTMLDivElement>();

  constructor(private appRef: ApplicationRef, private env: EnvironmentInjector) {}

  open(message: string, type: ToastType = 'info', duration = DEFAULT_DURATION_MS, position: Pos = 'bottom-right') {
    const host = this.getOrCreateContainer(position);

    const ref: ComponentRef<ToastComponent> = createComponent(ToastComponent, { environmentInjector: this.env });
    ref.setInput('message', message);
    ref.setInput('type', type);
    ref.setInput('position', position);
    ref.setInput('duration', duration);
    ref.setInput('autoClose', true);

    this.appRef.attachView(ref.hostView);
    host.appendChild(ref.location.nativeElement);

    const sub = ref.instance.closed.subscribe(() => {
      sub.unsubscribe();
      this.appRef.detachView(ref.hostView);
      ref.destroy();
      if (!host.hasChildNodes()) {
        host.remove();
        this.containers.delete(position);
      }
    });
  }

  private getOrCreateContainer(position: Pos) {
  const existing = this.containers.get(position);
  if (existing) return existing;
  const el = document.createElement('div');
  el.className = `${POS_CLASSES[position]}`;
  //fondo transparente para evitar línea blanca
  document.body.appendChild(el);
  this.containers.set(position, el);
  return el;
  }
}
