import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from "../../components/input-component/input-component";
import { ButtonComponent } from '../../components/button-component/button-component';

@Component({
  selector: 'app-organization-register',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './organization-register.html',
  styleUrl: './organization-register.scss'
})
export class OrganizationRegister {
  registerOrganizationForm: FormGroup<{
    name: FormControl<string | null>,
    description: FormControl<string | null>,
    profileFile: FormControl<File | null>,
    bannerFile: FormControl<File | null>,
    documents: FormControl<File[] | null>,
    images: FormControl<File[] | null>
  }>;

  private fb = inject(FormBuilder);

  constructor() {
    this.registerOrganizationForm = this.fb.group({
      name: new FormControl<string | null>(''),
      description: new FormControl<string | null>(''),
      profileFile: new FormControl<File | null>(null),
      bannerFile: new FormControl<File | null>(null),
      documents: new FormControl<File[] | null>(null),
      images: new FormControl<File[] | null>(null)
    });
  }
}
