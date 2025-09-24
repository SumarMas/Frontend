import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, input, Input, signal } from '@angular/core';

type size = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'icon',
  imports: [],
  templateUrl: './icon-component.html',
  styleUrl: './icon-component.scss'
})
export class IconComponent {
  name = input<string>('default-icon');
  nodes = signal<string[]>([]);
  size = input<size>('md');

  private readonly http = inject(HttpClient);

  constructor() {
    //cargar svg
    effect(() => {
      const path = `/icons/${this.name()}.svg`;
      this.http.get(path, { responseType: 'text' }).subscribe({
        next: (svgText) => {
          //Parseo del SVG (si tuvieses los nodos como string por json o algo entonces esto no haria falta)
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = svgDoc.querySelector('svg');

          const paths = svgDoc.querySelectorAll('path[d]');

          //vacio el array de nodos
          this.nodes.set([]);

          //agrego de 0 los nodos
          paths.forEach((pathEl: Element) => {
            this.nodes.set([...this.nodes(), pathEl.getAttribute('d') || '']);
          }
          );
        },
      });
    });
  }

  svgSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return '16';
      case 'md':
        return '24';
      case 'lg':
        return '32';
      case 'xl':
        return '48';
      default:
        return '24';
    }
  });
}
