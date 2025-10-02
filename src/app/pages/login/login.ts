import { Component, inject, signal } from '@angular/core';
import { InputComponent } from "../../components/input-component/input-component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from "../../components/button-component/button-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { AuthService } from '../../services/api/auth-service';
import { ToastService } from '../../services/ui/toast-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [InputComponent, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup<{ email: FormControl<string | null>; password: FormControl<string | null> }>;
  isLoading = signal(false);

  private fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authService.fakeLogin().subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastService.open('Has iniciado sesión con éxito', 'success', 3000, 'bottom-right');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toastService.open('Error al iniciar sesión: ' + err.message, 'error', 3000, 'bottom-right');
        }
      });
      this.loginForm.reset();
    }
  }
}
