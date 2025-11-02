import { Component, inject, OnInit, signal } from '@angular/core';
import { InputComponent } from '../../components/input-component/input-component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../services/ui/toast-service';
import { ButtonComponent } from "../../components/button-component/button-component";

@Component({
  selector: 'app-campaign-register',
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './campaign-register.html',
  styleUrl: './campaign-register.scss'
})
export class CampaignRegister implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  campaignRegisterForm: FormGroup <{
    name: FormControl<string | null>,
    description: FormControl<string | null>,
    goalAmount: FormControl<number | null>,
    endDateTime: FormControl<Date | null>,
    categoryIds: FormControl<string[] | null>,
    tags: FormControl<string[] | null>,
    imagesId: FormControl<File[] | null>
  }>


  //agregar servicio

  isLoading = signal<boolean>(false);

  constructor() {
    this.campaignRegisterForm = this.fb.group({
      name: new FormControl<string | null>(null),
      description: new FormControl<string | null>(null),
      goalAmount: new FormControl<number | null>(null),
      endDateTime: new FormControl<Date | null>(null),
      categoryIds: new FormControl<string[] | null>(null),
      tags: new FormControl<string[] | null>(null),
      imagesId: new FormControl<File[] | null>(null)
    });
  }

  ngOnInit(): void {

  }

  fetchCategories() { }

  fetchTags() { }
}
