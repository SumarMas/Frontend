import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type Type = 'text' | 'search' | 'password' | 'file';
type Variant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-input-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-component.html',
  styleUrl: './input-component.scss'
})
export class InputComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() placeholder = '';
  @Input() disabled = false;

  @Input() type: Type = 'text';
  @Input() variant: Variant = 'primary';
  @Input() block = false;

  //solo par file
  @Input() multiple = false;
  @Input() accept?: string;
  @ViewChild('fileInput') fileEl?: ElementRef<HTMLInputElement>;

  showPassword = false;


  get base(): 'input' | 'file-input' { return this.type === 'file' ? 'file-input' : 'input'; }
  get classes(): string[] {
    const b = this.base; const out = [b, `${b}-${this.variant}`];
    if (this.block) out.push('w-full');
    return out;
  }
  get inputType(): string {
    if (this.type === 'password') return this.showPassword ? 'text' : 'password';
    return this.type === 'file' ? 'file' : this.type;
  }

  //file helpers
  private isFileList(v: unknown): v is FileList {
    return typeof FileList !== 'undefined' && v instanceof FileList;
  }
  get files(): File[] {
    const v = this.control?.value;
    return this.isFileList(v) ? Array.from(v) : [];
  }
  get fileCount(): number { return this.files.length; }

  private uniqKey(f: File) { return `${f.name}__${f.size}__${f.lastModified}`; }

  //reemplaza o acumula archivos
  private setFiles(next: File[] | null) {
    if (!this.fileEl) return;
    const input = this.fileEl.nativeElement;
    const dt = new DataTransfer();
    (next ?? []).forEach(f => dt.items.add(f));
    (input as HTMLInputElement & { files: FileList }).files = dt.files;

    const val = input.files && input.files.length ? input.files : null;
    this.control.setValue(val);
    this.control.markAsDirty();
  }

  onFileChange(ev: Event) {
    const selected = Array.from((ev.target as HTMLInputElement).files ?? []);
    if (!this.multiple) {
      //single -> toma el primero
      this.setFiles(selected.length ? [selected[0]] : null);
      return;
    }
    //multiple -> acumula sin repetir
    const merged = [...this.files, ...selected];
    const seen = new Set<string>();
    const unique: File[] = [];
    for (const f of merged) {
      const k = this.uniqKey(f);
      if (!seen.has(k)) { seen.add(k); unique.push(f); }
    }
    this.setFiles(unique);
  }

  removeFile(index: number) {
    if (!this.files.length) return;
    const next = this.files.filter((_, i) => i !== index);
    this.setFiles(next.length ? next : null);
  }

  clearFiles() { this.setFiles(null); }
}
