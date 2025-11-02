import { Component, effect, EventEmitter, inject, Input, Output, signal, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostMessageDto } from '../../models/api/message';
import { ButtonComponent } from '../button-component/button-component';
import { InputComponent } from '../input-component/input-component';
import { MessageService } from '../../services/api/message-service';
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-add-message-component',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './add-message-component.html',
  styleUrl: './add-message-component.scss'
})
export class AddMessageComponent {
  @Input() show: Signal<boolean> = signal(false);
  @Input() campaignId: string = '';
  @Output() messageSubmitted = new EventEmitter<PostMessageDto>();
  @Output() cancel = new EventEmitter<void>();

  isLoading = signal(false);
  messageService = inject(MessageService);
  toastService = inject(ToastService);

  messageForm: FormGroup<{
    title: FormControl<string | null>;
    description: FormControl<string | null>;
    fileId: FormControl<string | null>;
  }>;

  constructor(private fb: FormBuilder) {
    this.messageForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      fileId: ['']
    });

    //limpiar formulario cuando show pase a false
    effect(() => {
      if (!this.show()) {
        this.messageForm.reset();
      }
    });
  }


  onSubmit() {
    if (this.messageForm.valid && this.campaignId) {
      const dto: PostMessageDto = {
        title: this.messageForm.controls.title.value!.trim(),
        description: this.messageForm.controls.description.value!.trim(),
        fileId: this.messageForm.controls.fileId.value?.trim() || undefined
      };
      this.isLoading.set(true);
      this.messageService.postMessage(this.campaignId,dto).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.messageSubmitted.emit(dto);
          this.messageForm.reset();
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.messageForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
    this.messageForm.reset();
  }
}
