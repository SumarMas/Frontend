import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

type CollapseObj = { title: string, content: string, check: boolean };
type bg = 'dark' | 'light';

@Component({
  selector: 'app-collapse-component',
  imports: [NgClass, NgStyle],
  templateUrl: './collapse-component.html',
  styleUrl: './collapse-component.scss'
})
export class CollapseComponent {
  @Input() obj: CollapseObj[] = [{ title: 'Title', content: 'Content', check: false }, { title: 'Title', content: 'Content', check: false }];
  @Input() bg: bg = 'light';
  @Input() singleOpen: boolean = true;
  @Input() rounded: boolean = false;

  //personalizar
  @Input() activeTextColor: string = '#111827';
  @Input() activeBgColor?: string;

  get bgClass() {
    const classes = [this.bg === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'];
    if (this.rounded) classes.push('rounded-2xl');
    return classes;
  }

  isOpen(index: number): boolean {
    return this.obj[index].check;
  }

  //estilo para item activo
  activeStyle(index: number) {
    if (!this.activeBgColor || !this.isOpen(index)) return {};
    return {
      'background-color': this.activeBgColor,
      'color': this.activeTextColor,
    };
  }

  onToggle(index: number, checked: boolean) {
    if (this.singleOpen) {
      this.obj = this.obj.map((item, i) => ({ ...item, check: i === index ? checked : false }));
    } else {
      this.obj[index].check = checked;
    }
  }

}
