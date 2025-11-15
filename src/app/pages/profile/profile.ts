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
import { AuthService } from '../../services/api/auth-service';

type Variant = 'white' | 'error'

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, ButtonComponent, IconComponent, InputComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  view: 'profile' | 'edit' = 'profile';
  isLoading = signal<boolean>(true);
  
  profileImageUrl: string | null = null;
  userRoles: string[] = [];
  userStatus: string = '';
  
  // Guardar datos originales para restaurar al cancelar
  originalUserData: {
    firstName: string;
    lastName: string;
    email: string;
  } | null = null;

  userData: FormGroup<{
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
    email: FormControl<string | null>
    //userName: FormControl<string | null>
  }>;

  constructor() {
    this.userData = this.fb.group({
      firstName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      lastName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }]
      //userName: [{ value: '', disabled: true }]
    });
  }

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
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
    if (this.view === 'profile') {
      // Al entrar en modo edición, guardar los datos actuales
      this.originalUserData = {
        firstName: this.userData.controls.firstName.value || '',
        lastName: this.userData.controls.lastName.value || '',
        email: this.userData.controls.email.value || ''
      };
      this.view = 'edit';
      this.userData.controls.firstName.enable();
      this.userData.controls.lastName.enable();
    } else {
      // Al cancelar, restaurar los datos originales
      if (this.originalUserData) {
        this.userData.patchValue({
          firstName: this.originalUserData.firstName,
          lastName: this.originalUserData.lastName,
          email: this.originalUserData.email
        });
      }
      this.view = 'profile';
      this.userData.controls.firstName.disable();
      this.userData.controls.lastName.disable();
    }
  }

  fetchUserData() {
    this.isLoading.set(true);
    this.userService.getById().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (user) => {
        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        };
        
        this.userData.patchValue(userData);
        
        // Guardar datos originales
        this.originalUserData = { ...userData };
        
        // Guardar roles y estado
        this.userRoles = user.roles || [];
        this.userStatus = user.status || 'ACTIVE';
        this.profileImageUrl = user.profileFileId || null;
      },
      error: (err) => {
        this.toastService.open('Error al cargar los datos del usuario', 'error', 3000);
      }
    });
  }

  saveChanges() {
    if (this.userData.valid) {
      this.userData.disable();
      // Actualizar los datos originales con los nuevos valores guardados
      this.originalUserData = {
        firstName: this.userData.controls.firstName.value || '',
        lastName: this.userData.controls.lastName.value || '',
        email: this.userData.controls.email.value || ''
      };

      const userId = this.authService.userId();

      this.isLoading.set(true);

      this.userService.updateUser(this.originalUserData, userId).pipe(finalize(() => {
        this.isLoading.set(false);
      })).subscribe({
        next: () => {
          this.toastService.open('Cambios guardados con éxito', 'success', 3000);
          this.toggleView();
        },
        error: () => {
          this.toastService.open('Error al guardar los cambios', 'error', 3000);
        }
      });
    }
  }

  //------------------------------------Helpers para roles y estados------------------------------------

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'ORGANIZATION': 'Organización',
      'DONOR': 'Donante'
    };
    return labels[role] || role;
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'ADMIN': 'admin',
      'ORGANIZATION': 'group',
      'DONOR': 'volunteer-activism'
    };
    return icons[role] || 'person';
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'ADMIN': 'badge badge-lg badge-error gap-1',
      'ORGANIZATION': 'badge badge-lg badge-info gap-1',
      'DONOR': 'badge badge-lg badge-success gap-1'
    };
    return classes[role] || 'badge badge-ghost gap-1';
  }

  // getStatusLabel(status: string): string {
  //   const labels: Record<string, string> = {
  //     'ACTIVE': 'Activo',
  //     'INACTIVE': 'Inactivo',
  //     'PENDING': 'Pendiente'
  //   };
  //   return labels[status] || status;
  // }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'badge badge-success',
      'INACTIVE': 'badge badge-error',
      'PENDING': 'badge badge-warning'
    };
    return classes[status] || 'badge badge-ghost';
  }
}
