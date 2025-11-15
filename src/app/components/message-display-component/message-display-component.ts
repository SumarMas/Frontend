import { Component, inject, Input, OnInit, Signal, signal } from '@angular/core';
import { GetMessageDto } from '../../models/api/message';
import { MessageComponent } from "../message-component/message-component";
import { MessageService } from '../../services/api/message-service';

@Component({
  selector: 'app-message-display-component',
  imports: [MessageComponent],
  templateUrl: './message-display-component.html',
  styleUrl: './message-display-component.scss'
})
export class MessageDisplayComponent implements OnInit {
  @Input() campaignId: string = '';
  @Input() isOpen : Signal<boolean> = signal(false);
  messages: GetMessageDto[] = [];

  private messageService = inject(MessageService);

  // Para consultar el valor:
  checkValue(): void {
    const value = this.isOpen(); // Lee el valor
    console.log(value); // false
  }

  ngOnInit(): void {
    this.fetchMessages();
  }

  fetchMessages(): void {
    this.messageService.getAllMessages(this.campaignId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.orderDescByDate();
      },
      error: (error) => {
        console.error('No se han podido cargar los mensajes:', error);
      }
    });
  }

  orderDescByDate(): void {
    this.messages.sort((a, b) => b.creationDateTime.getTime() - a.creationDateTime.getTime());
  }
}
