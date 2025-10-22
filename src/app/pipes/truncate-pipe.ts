import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 400, ellipsis: string = '...'): string {
    //si no es un string, devolverlo tal cual
    if (!value || typeof value !== 'string') {
      return value;
    }

    //ver si excede el límite
    if (value.length > limit) {
      //truncar y añadir ellipsis
      return value.substring(0, limit) + ellipsis;
    }
    //si no excede, no hace nada
    return value;
  }

}
