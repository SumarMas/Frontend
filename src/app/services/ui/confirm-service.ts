import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable, signal } from '@angular/core';
import { ConfirmOptions } from '../../models/ui/confirm';
import { ConfirmComponent } from '../../components/confirm-component/confirm-component';

interface Pending {
  message: string;
  opts: ConfirmOptions;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private queue: Pending[] = [];
  private activeRef: ComponentRef<ConfirmComponent> | null = null;
  private prevOverflow: string | null = null;

  constructor(private appRef: ApplicationRef, private env: EnvironmentInjector) {}

  // muestra un diálogo de confirmación y devuelve una promesa que se resuelve con true/false
  ask(message: string, opts: ConfirmOptions = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.queue.push({ message, opts, resolve });
      if (!this.activeRef) this.openNext();
    });
  }

  private openNext() {
    const next = this.queue.shift();
    if (!next) return;

    const ref = createComponent(ConfirmComponent, { environmentInjector: this.env });
    this.activeRef = ref;

    //seterr inputs
    ref.setInput('message', next.message);
    ref.setInput('title', next.opts.title ?? 'Confirmación');
    ref.setInput('confirmText', next.opts.confirmText ?? 'Aceptar');
    ref.setInput('cancelText', next.opts.cancelText ?? 'Cancelar');
    ref.setInput('variant', next.opts.variant ?? 'info');
    ref.setInput('dismissible', next.opts.dismissible ?? true);
    ref.setInput('backdropDismiss', next.opts.backdropDismiss ?? true);
    ref.setInput('escDismiss', next.opts.escDismiss ?? true);

    // montar
    this.appRef.attachView(ref.hostView);
    document.body.appendChild(ref.location.nativeElement);

    //bloquear scroll
    this.prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    //gestionar cierre
    const sub = ref.instance.closed.subscribe((ok) => {
      sub.unsubscribe();
      this.appRef.detachView(ref.hostView);
      ref.destroy();
      this.activeRef = null;

      document.body.style.overflow = this.prevOverflow ?? '';
      this.prevOverflow = null;

      next.resolve(ok);
      this.openNext(); //abrir siguiente en la cola
    });
  }
}
