import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidatorService {
  
  //mostrar error si el control es inválido y fue tocado o modificado, o si el formulario fue enviado
  showError(form: FormGroup, controlName: string, submitted = false): boolean {
    const c = form.get(controlName);
    if (!c) return false;
    return !!c.invalid && (c.touched || (c as any).dirty || submitted);
  }

  //mensaje de error para el un control específico
  getValidationMessage(form: FormGroup, controlName: string): string {
    const c = form.get(controlName);
    if (!c || !c.errors) return '';
    const e = c.errors;

    //tomo el primer error
    const key = Object.keys(e)[0];

    switch (key) {
      case 'required':
        return `Este campo es obligatorio.`;
      case 'minlength':
        return `Mínimo ${e['minlength']?.requiredLength} caracteres (tiene ${e['minlength']?.actualLength}).`;
      case 'maxlength':
        return `Máximo ${e['maxlength']?.requiredLength} caracteres (tiene ${e['maxlength']?.actualLength}).`;
      case 'email':
        return 'El formato del correo electrónico es inválido.';
      case 'pattern':
        return 'El formato del campo es inválido.';
      case 'min':
        return `Mínimo ${e['min']?.min}.`;
      case 'max':
        return `Máximo ${e['max']?.max}.`;
      case 'emailTaken':
        return 'El correo electrónico ya está en uso.';
      default:
        return `Error desconocido: ${key} en ${controlName}.`;
    }
  }
}
