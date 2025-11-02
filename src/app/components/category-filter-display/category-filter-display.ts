import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CategoryFilterChip, SelectionEvent } from "../category-filter-chip/category-filter-chip";
import { GetCategoryDto } from '../../models/ui/category';
import { CategoryService } from '../../services/api/category-service';
import { SkeletonComponent } from '../skeleton-component/skeleton-component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-filter-display',
  imports: [CategoryFilterChip, SkeletonComponent],
  templateUrl: './category-filter-display.html',
  styleUrl: './category-filter-display.scss'
})
export class CategoryFilterDisplay implements OnInit{
  categories: GetCategoryDto[] = []; 

  @Output() selectedIdsChange: EventEmitter<string[]> = new EventEmitter<string[]>(); 

  selectedIdsSet: Set<string> = new Set<string>();

  categoriesService = inject(CategoryService);

  readonly _SKELETON_COUNT = 5;
  isLoading = signal<boolean>(true);
  
    get skeletonArray() {
      const skeletonObj = { object: 'card', classes: 'w-32 h-32 rounded-2xl' }
      return Array(this._SKELETON_COUNT)
        .fill(skeletonObj)
        .map(item => ({ ...item }));
    }

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.categoriesService.getAllCategories().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar las categorias:', error);
      }
    });
  }

  changeList(event: SelectionEvent) {
    const id = String(event.categoryId); 
    
    if (!id || id === 'null' || id === 'undefined') return;

    if (event.isSelected) {
      this.selectedIdsSet.add(id);
    } else {
      this.selectedIdsSet.delete(id);
    }

    this.selectedIdsChange.emit(Array.from(this.selectedIdsSet));
  }
}
