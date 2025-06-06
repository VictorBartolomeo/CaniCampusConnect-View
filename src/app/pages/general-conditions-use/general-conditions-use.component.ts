import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ScrollTopModule } from 'primeng/scrolltop';

@Component({
  selector: 'app-general-conditions-use',
  standalone: true,
  imports: [
    RouterLink,
    CardModule,
    ButtonModule,
    DividerModule,
    ScrollTopModule
  ],
  templateUrl: './general-conditions-use.component.html',
  styleUrl: './general-conditions-use.component.scss'
})
export class GeneralConditionsUseComponent {

}
