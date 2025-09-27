import { Component, inject } from '@angular/core';
import { InputComponent } from "../../components/input-component/input-component";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from "../../components/button-component/button-component";

@Component({
  selector: 'app-login',
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm : FormGroup;

  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: new FormControl(''),
      password: new FormControl('')
    });
  }

  get email() { return this.loginForm.get('email') as FormControl; }

  get password() { return this.loginForm.get('password') as FormControl; }
}
