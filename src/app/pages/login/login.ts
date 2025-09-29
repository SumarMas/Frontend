import { Component, inject } from '@angular/core';
import { InputComponent } from "../../components/input-component/input-component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from "../../components/button-component/button-component";
import { FormValidatorService } from '../../services/form-validator-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm : FormGroup;

  private fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  get email() { return this.loginForm.get('email') as FormControl; }

  get password() { return this.loginForm.get('password') as FormControl; }

  onSubmit(){
    if(this.loginForm.valid){
      this.authService.fakeLogin();
      this.loginForm.reset();
    }
  }
}
