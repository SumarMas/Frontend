import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'payStatus'
})

export class PayStatusPipe implements PipeTransform {
    transform(value: string): any {
        return value === 'APPROVED' ? 'Aprobado' : 'Pendiente';
    }
}