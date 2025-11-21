import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'payColor'
})

export class PayColorPipe implements PipeTransform {
    transform(value: string): any {
        return value === 'APPROVED' ? 'badge-success' : 'badge-warning';
    }
}