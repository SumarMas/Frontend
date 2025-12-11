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
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

type Variant = 'white' | 'error'

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, ButtonComponent, IconComponent, InputComponent, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  view: 'profile' | 'edit' = 'profile';
  isLoading = signal<boolean>(true);
  isSavingAvatar = signal<boolean>(false);
  showAvatarSelector = signal<boolean>(false);

  profileImageUrl: SafeUrl | string | null = null;
  selectedAvatarFile: File | null = null;
  profileFileId: string | null = null;
  userRoles: string[] = [];
  userStatus: string = '';

  // Avatares predefinidos
  predefinedAvatars = [
    { name: 'Oso', path: '/images/profile-icons/bear-icon.png' },
    { name: 'Toro', path: '/images/profile-icons/bull-icon.png' },
    { name: 'Ratón', path: '/images/profile-icons/mouse-icon.png' },
    { name: 'Mapache', path: '/images/profile-icons/racoon-icon.png' },
    { name: 'Ardilla', path: '/images/profile-icons/squirrel-icon.png' },
    { name: 'Tigre', path: '/images/profile-icons/tiger-icon.png' }
  ];

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
  private fileService = inject(FileService);
  private sanitizer = inject(DomSanitizer);
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
      this.showAvatarSelector.set(false);
      this.selectedAvatarFile = null;
    }
  }

  fetchUserData() {
    this.isLoading.set(true);
    this.userService.getById().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (user) => {
        console.log('FOTO DE PERFIL ' + user.profileFileId);

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
        this.profileFileId = user.profileFileId || null;

        // Cargar imagen de perfil si existe
        if (user.profileFileId) {
          this.loadProfileImage(user.profileFileId);
        }
      },
      error: (err) => {
        this.toastService.open('Error al cargar los datos del usuario', 'error', 3000);
      }
    });
  }

  async saveChanges() {
    if (this.userData.valid) {
      this.userData.disable();
      this.isLoading.set(true);

      try {
        // Si hay un avatar seleccionado, subirlo primero
        if (this.selectedAvatarFile) {
          const uploadedFileId = await this.fileService.uploadFile(this.selectedAvatarFile).toPromise();
          if (uploadedFileId) {
            this.profileFileId = uploadedFileId;
          }
        }

        // Actualizar los datos originales con los nuevos valores guardados
        const updateData = {
          firstName: this.userData.controls.firstName.value || '',
          lastName: this.userData.controls.lastName.value || '',
          profileFileId: this.profileFileId || undefined
        };

        this.originalUserData = {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: this.userData.controls.email.value || ''
        };

        const userId = this.authService.userId();

        await this.userService.updateUser(updateData, userId).pipe(
          finalize(() => this.isLoading.set(false))
        ).toPromise();

        this.toastService.open('Cambios guardados con éxito', 'success', 3000);

        this.authService._userName.set(updateData.firstName + ' ' + updateData.lastName);
        localStorage.setItem('user_name', updateData.firstName + ' ' + updateData.lastName);

        this.selectedAvatarFile = null;
        this.showAvatarSelector.set(false);
        this.toggleView();

        // Recargar los datos del usuario
        this.fetchUserData();
      } catch (error) {
        this.isLoading.set(false);
        this.toastService.open('Error al guardar los cambios', 'error', 3000);
      }
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

  //------------------------------------Métodos para manejo de avatares------------------------------------

  toggleAvatarSelector() {
    this.showAvatarSelector.set(!this.showAvatarSelector());
  }

  loadProfileImage(fileId: string) {
    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error('Error al cargar imagen de perfil:', err);
      }
    });
  }

  async selectPredefinedAvatar(avatarPath: string) {
    try {
      this.isSavingAvatar.set(true);

      // Descargar la imagen predefinida como blob
      const response = await fetch(avatarPath);
      const blob = await response.blob();

      // Convertir blob a File
      const fileName = avatarPath.split('/').pop() || 'avatar.png';
      const file = new File([blob], fileName, { type: blob.type });

      this.selectedAvatarFile = file;

      // Mostrar preview
      const objectUrl = URL.createObjectURL(blob);
      this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

      this.showAvatarSelector.set(false);
      this.toastService.open('Avatar seleccionado', 'success', 2000);
    } catch (error) {
      console.error('Error al seleccionar avatar:', error);
      this.toastService.open('Error al cargar el avatar', 'error', 3000);
    } finally {
      this.isSavingAvatar.set(false);
    }
  }

  onCustomAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.toastService.open('Por favor selecciona una imagen', 'error', 3000);
        return;
      }

      this.selectedAvatarFile = file;

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      this.showAvatarSelector.set(false);
      this.toastService.open('Imagen seleccionada', 'success', 2000);
    }
  }
}
