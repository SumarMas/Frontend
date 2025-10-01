import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from "../../components/input-component/input-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm : FormGroup<{name : FormControl<string | null>,
    lastname : FormControl<string | null>,
    email : FormControl<string | null>,
    username : FormControl<string | null>,
    password : FormControl<string | null>,
    confirmPassword : FormControl<string | null>
  }>;

  private fb = inject(FormBuilder);
  formValidator = inject(FormValidatorService);
  
  constructor() {
    this.registerForm = this.fb.group({
      name: ['', []],
      lastname: ['', []],
      email: ['', []],
      username: ['', []],
      password: ['', []],
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

  toggleOrganizationFields(){
    
  }
}
