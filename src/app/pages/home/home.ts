import { Component } from '@angular/core';
import { ButtonComponent } from "../../components/button-component/button-component";
import { CollapseComponent } from "../../components/collapse-component/collapse-component";
import { StepsShowcaseComponent } from "../../components/steps-showcase-component/steps-showcase-component";

type Step = { title: string; status: 'completed' | 'failed' | 'pending' };

@Component({
  selector: 'app-home',
  imports: [ButtonComponent, CollapseComponent, StepsShowcaseComponent],
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

    steps= [
    {
      title: 'Crear cuenta',
      subtitle: 'Donante u ONG',
      body: 'Registrate gratis en Sumar+ con tu email y contraseña. Si tenés una ONG podés validarla luego.',
      img: '/user-create.jpeg'
    },
    {
      title: 'Verificar ONG',
      subtitle: 'Solo organizaciones',
      body: 'Subí la documentación necesaria en PDF o imágenes. Un administrador revisará y validará tu ONG.',
      img: '/verify-documents.jpeg'
    },
    {
      title: 'Publicar campaña',
      body: 'Definí un título, meta económica, fecha de cierre, imágenes y etiquetas para difundir tu causa.',
      img: '/publish-campaing.jpeg'
    },
    {
      title: 'Recibir donaciones',
      body: 'Comparte tu campaña. Los donantes podrán apoyarla de forma segura y transparente.',
      img: '/donations.jpeg'
    },
  ];
}
