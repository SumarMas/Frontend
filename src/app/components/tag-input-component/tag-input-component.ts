import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { IconComponent } from '../icon-component/icon-component';

@Component({
  selector: 'app-tag-input-component',
  imports: [FormsModule, IconComponent],
  templateUrl: './tag-input-component.html',
  styleUrl: './tag-input-component.scss'
})
export class TagInputComponent {
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  tagValue: string = '';

  addTag() {
    if (this.tagValue) {
      this.tags.push(this.tagValue.toLowerCase());
      this.tagValue = '';
      
      this.tagsChange.emit(this.tags);
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.tagsChange.emit(this.tags);
  }
}
