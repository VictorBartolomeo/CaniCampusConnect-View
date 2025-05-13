import { Component } from '@angular/core';
import {DogSummaryComponent} from '../../components/dog-summary/dog-summary.component';

@Component({
  selector: 'app-manage-dogs-page',
  imports: [
    DogSummaryComponent
  ],
  templateUrl: './manage-dogs-page.component.html',
  styleUrl: './manage-dogs-page.component.scss'
})
export class ManageDogsPageComponent {

}
