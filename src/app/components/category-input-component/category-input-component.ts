import { Component, inject, input, model, OnInit, output } from '@angular/core';
import { IconComponent } from '../icon-component/icon-component';
import { CategoryService } from '../../services/api/category-service';
import { GetCategoryDto } from '../../models/ui/category';
import { ButtonComponent } from "../button-component/button-component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-input-component',
  imports: [IconComponent, ButtonComponent, FormsModule],
  templateUrl: './category-input-component.html',
  styleUrl: './category-input-component.scss'
})
export class CategoryInputComponent implements OnInit{
  // Two-way binding con el componente padre
  categoryIds = model<string[]>([]);
  categoryIdsChange = output<string[]>();
  
  categoriesIds: {id: string, name: string}[] = [];
  categories: GetCategoryDto[] = [];
  selectedCategory: string = '';
  
  categoryService = inject(CategoryService);

  get availableCategories(): GetCategoryDto[] {
    const selectedIds = new Set(this.categoriesIds.map(cat => cat.id));
    return this.categories.filter(cat => !selectedIds.has(cat.id));
  }

  fetchCategories() {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  ngOnInit() {
    this.fetchCategories();
  }

  removeCategory(index: number) {
    // 1. Remueve de la lista de seleccionadas.
    // El elemento ya no estará en el Set del getter, haciendo que aparezca en el select.
    this.categoriesIds.splice(index, 1);
    
    // Emitir cambio al padre
    this.emitChange();
  }

  addCategory() {
    // Buscamos en la lista MAESTRA
    const category = this.categories.find(cat => cat.id === this.selectedCategory);
    
    if (category) {
      // 2. Agrega SOLO si no ha sido agregada
      if (!this.categoriesIds.find(cat => cat.id === category.id)) {
        this.categoriesIds.push({id: category.id, name: category.name});
        
        // Emitir cambio al padre
        this.emitChange();
      }
      // 3. Resetea la selección, forzando la primera opción 'disabled' a ser seleccionada
      this.selectedCategory = ''; 
    }
  }

  private emitChange() {
    // Extraer solo los IDs y emitirlos al componente padre
    const ids = this.categoriesIds.map(cat => cat.id);
    this.categoryIds.set(ids);
    this.categoryIdsChange.emit(ids);
  }
}
