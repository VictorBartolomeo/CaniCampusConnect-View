import { Component } from '@angular/core';
import {DogSummaryComponent} from '../../components/dog-summary/dog-summary.component';
import {DogFormComponent} from '../../components/dog-form/dog-form.component';
import {Splitter} from 'primeng/splitter';

@Component({
  selector: 'app-manage-dogs-page',
  imports: [
    DogSummaryComponent,
    DogFormComponent,
    Splitter
  ],
  templateUrl: './manage-dogs-page.component.html',
  styleUrl: './manage-dogs-page.component.scss'
})
export class ManageDogsPageComponent {

}
