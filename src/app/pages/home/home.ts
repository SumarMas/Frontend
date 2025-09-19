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

  cardInfo: { title: string, icon:string}[] = [
    { title: 'Seguridad', icon: '🔒'},
    { title: 'Transparencia', icon: '🔍'},
    { title: 'Impacto Social', icon: '🌍'}
  ]

}
