import { Component } from '@angular/core';
import { ButtonComponent } from "../../components/button-component/button-component";
import { CollapseComponent } from "../../components/collapse-component/collapse-component";

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, CollapseComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  cardInfo: { title: string, icon: string }[] = [
    { title: 'Seguridad', icon: '🔒' },
    { title: 'Transparencia', icon: '🔍' },
    { title: 'Impacto Social', icon: '🌍' }
  ]

  collapseInfo = [
    {
      title: '¿Cómo se verifican las ONGs?',
      content: 'Las organizaciones deben registrar su información y subir documentación legal. Un administrador revisa y aprueba antes de que puedan crear campañas.',
      check: false
    },
    {
      title: '¿Puedo donar de forma anónima?',
      content: 'Sí, al realizar tu donación puedes elegir no mostrar tu nombre públicamente en los comentarios de la campaña.',
      check: false
    },
    {
      title: '¿Qué sucede cuando una campaña alcanza su meta?',
      content: 'La campaña se cierra automáticamente al cumplir la meta económica o al llegar a la fecha de finalización. La ONG puede luego solicitar el pago de los fondos recaudados.',
      check: false
    },
  ];
}
