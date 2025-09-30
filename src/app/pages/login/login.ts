import { Component, inject, signal } from '@angular/core';
import { InputComponent } from "../../components/input-component/input-component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from "../../components/button-component/button-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-login',
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  isLoading = signal(false);

  private fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  constructor() {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  get email() { return this.loginForm.get('email') as FormControl; }

  get password() { return this.loginForm.get('password') as FormControl; }

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
