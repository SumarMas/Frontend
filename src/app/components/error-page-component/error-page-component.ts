import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type ErrorCode = 401 | 403 | 404 | 500;

interface ErrorInfo {
  title: string;
  subtitle: string;
  image: string;
}

@Component({
  selector: 'app-error-page-component',
  imports: [],
  templateUrl: './error-page-component.html',
  styleUrl: './error-page-component.scss'
})
export class ErrorPageComponent {
  @Input() code: ErrorCode = 404;

  private readonly route = inject(ActivatedRoute);

  private readonly errorMessages: Record<ErrorCode, ErrorInfo> = {
    401: {
      title: 'No autorizado',
      subtitle: 'Lo sentimos, no tienes permiso para acceder a esta página.',
      image: '/401robot.png'
    },
    403: {
      title: 'Acceso denegado',
      subtitle: 'No contás con permisos suficientes.',
      image: '/401robot.png'
    },
    404: {
      title: 'Página no encontrada',
      subtitle: 'Lo sentimos, la página que buscas no existe.',
      image: '/404robot.png'
    },
    500: {
      title: 'Error del servidor',
      subtitle: 'Actualmente no podemos procesar tu solicitud, intenta de nuevo más tarde.',
      image: '/500robot.png'
    }
  };

  get image(): string { return this.errorMessages[this.code]?.image ?? this.errorMessages[404].image; }
  get title(): string { return this.errorMessages[this.code]?.title ?? this.errorMessages[404].title; }
  get subtitle(): string { return this.errorMessages[this.code]?.subtitle ?? this.errorMessages[404].subtitle; }

  ngOnInit(): void {
    const initial = this.route.snapshot.data['code'] as ErrorCode | undefined;
    if (initial !== undefined) this.code = initial;

    this.route.data.subscribe(d => {
      const c = d['code'] as ErrorCode | undefined;
      if (c !== undefined) this.code = c;
    });
  }
}
