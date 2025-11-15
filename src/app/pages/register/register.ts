import { Component, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../components/input-component/input-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { ButtonComponent } from "../../components/button-component/button-component";
import { Router, RouterLink } from '@angular/router';
import { PostUserDto } from '../../models/api/user';
import { UserService } from '../../services/api/user-service';
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup<{
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
    email: FormControl<string | null>,
    userName: FormControl<string | null>,
    password: FormControl<string | null>,
    confirmPassword: FormControl<string | null>,
  }>;

  isLoading = signal(false);

  private fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  userService = inject(UserService);
  toastService = inject(ToastService);
  router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32),]],
      confirmPassword: ['', []]
    },
      {
        validators: (control: AbstractControl) => {
          return this.formValidator.passwordMatchValidator(
            control.get('password')!,
            control.get('confirmPassword')!
          );
        }
      });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.registerForm.disable();
      this.isLoading.set(true);

        const userData: PostUserDto = this.registerForm.value as PostUserDto;
        console.log('Registrando usuario:', userData);
        this.userService.register(userData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.toastService.open('Cuenta creada con éxito, ¡Bienvenido/a!', 'success', 3000, 'bottom-right');
            this.registerForm.reset();
            this.router.navigate(['/profile']);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.toastService.open('Error al crear cuenta', 'error', 3000, 'bottom-right');
          }
        })
        this.registerForm.enable();
    }
  }
}
