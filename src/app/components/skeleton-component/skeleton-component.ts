import { Component, Input } from '@angular/core';

export interface Skeleton {
  object: 'input' | 'button' | 'card' | 'avatar' | 'text';
  classes?: string;
}

@Component({
  selector: 'app-skeleton-component',
  imports: [],
  templateUrl: './skeleton-component.html',
  styleUrl: './skeleton-component.scss'
})
export class SkeletonComponent {
  @Input() container: string = 'flex flex-col w-full';
  @Input() skeletons : Skeleton[] = [];
}
