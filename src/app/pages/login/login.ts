import { Component, inject, signal } from '@angular/core';
import { InputComponent } from "../../components/input-component/input-component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from "../../components/button-component/button-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { AuthService } from '../../services/api/auth-service';
import { ToastService } from '../../services/ui/toast-service';
import { Router, RouterLink } from '@angular/router';

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
  router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.loginForm.disable();
      const email = this.loginForm.value.email ?? '';
      const password = this.loginForm.value.password ?? '';

      this.authService.login(email, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastService.open('Has iniciado sesión con éxito', 'success', 3000, 'bottom-right');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loginForm.enable();
          if (err.status === 500 || err.status === 503) {
            this.toastService.open('Algo salió mal, intente nuevamente más tarde', 'error', 4000, 'bottom-right');
          } else {
            this.toastService.open('Error al iniciar sesión', 'error', 3000, 'bottom-right');
          }
        }
      });
    }
  }
}
