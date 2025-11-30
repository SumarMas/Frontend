import { Component, EventEmitter, Input, Output, signal, SimpleChanges, OnChanges } from '@angular/core';
import { IconComponent } from "../icon-component/icon-component";
import { CategoryDto } from '../../models/api/category';
import { NgClass } from '@angular/common';

export interface SelectionEvent{
  categoryId: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-category-filter-chip',
  imports: [IconComponent, NgClass],
  templateUrl: './category-filter-chip.html',
  styleUrl: './category-filter-chip.scss'
})
export class CategoryFilterChip implements OnChanges {
  @Input() category: CategoryDto | null = { id: '', name: 'Community Development', description: '' };
  @Input() isSelectedFromParent: boolean = false;
  @Output() selectionChange: EventEmitter<SelectionEvent> = new EventEmitter<SelectionEvent>();

  isSelected = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    // Sincronizar el estado cuando el padre cambia selectedIds
    if (changes['isSelectedFromParent']) {
      this.isSelected.set(this.isSelectedFromParent);
    }
  }

  get iconName(): string {
    switch (this.category?.name.toLowerCase()) {
      case 'animal welfare':
        return 'animal';
      case 'community development':
        return 'community';
      case 'education':
        return 'school';
      case 'environment':
        return 'eco';
      case 'health':
        return 'health-cross';
      default:
        return 'default';
    }
  }

  toggleSelection() {
    this.isSelected.set(!this.isSelected());
    
    this.selectionChange.emit({
      categoryId: this.category!.id,
      isSelected: this.isSelected()
    });
  }
}
