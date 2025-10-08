import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/api/user-service';
import { ButtonComponent } from "../../components/button-component/button-component";
import { ToastService } from '../../services/ui/toast-service';
import { IconComponent } from '../../components/icon-component/icon-component';
import { SkeletonComponent } from '../../components/skeleton-component/skeleton-component';
import { finalize } from 'rxjs';
import { InputComponent } from "../../components/input-component/input-component";
import { FormValidatorService } from '../../services/validations/form-validator-service';

type Variant = 'white' | 'error'

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, ButtonComponent, IconComponent, SkeletonComponent, InputComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  view: 'profile' | 'edit' = 'profile';
  isLoading = signal<boolean>(true);

  userData: FormGroup<{
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
    email: FormControl<string | null>,
    username: FormControl<string | null>
  }>;

  constructor() {
    this.userData = this.fb.group({
      firstName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      lastName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }]
    });
  }

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  formValidator = inject(FormValidatorService);

  ngOnInit(): void {
    this.fetchUserData();
  }

  get buttonData() {
    return this.view === 'profile'
      ? { text: '', icon: 'edit', variant: 'white' as Variant }
      : { text: '', icon: 'close', variant: 'error' as Variant };
  }

  toggleView() {
    this.view = this.view === 'profile' ? 'edit' : 'profile';
    this.userData.controls.firstName.disabled ? this.userData.controls.firstName.enable() : this.userData.controls.firstName.disable();
    this.userData.controls.lastName.disabled ? this.userData.controls.lastName.enable() : this.userData.controls.lastName.disable();
  }

  fetchUserData() {
    this.isLoading.set(true);
    this.userService.fakeGetById().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (user) => {
        this.userData.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username
        });
      },
      error: (err) => {
        this.toastService.open('Error al cargar los datos del usuario', 'error', 3000);
      }
    });
  }

  saveChanges() {
    if (this.userData.valid) {
      //llamar api
      this.toastService.open('Cambios guardados con éxito', 'success', 3000);
      this.toggleView();
    }
  }
}
