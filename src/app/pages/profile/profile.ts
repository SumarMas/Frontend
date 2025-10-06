import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../../services/api/user-service';
import { ButtonComponent } from "../../components/button-component/button-component";

type Variant = 'white' | 'error'

@Component({
  selector: 'app-profile',
  imports: [ButtonComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  view: 'profile' | 'edit' = 'profile';

  userData: FormGroup<{
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
    email: FormControl<string | null>,
    username: FormControl<string | null>
  }>;

  constructor() {
    this.userData = this.fb.group({
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }]
    });
  }

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.fetchUserData();
  }

  get buttonData() {
    return this.view === 'profile'
      ? { text: 'Editar', icon: 'edit', variant: 'white' as Variant }
      : { text: 'Cancelar', icon: 'close', variant: 'error' as Variant };
  }

  toggleView() {
    this.view = this.view === 'profile' ? 'edit' : 'profile';
  }

  fetchUserData() {
    //llamar api

    this.userData.patchValue({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      username: 'juanp'
    });
  }
}
