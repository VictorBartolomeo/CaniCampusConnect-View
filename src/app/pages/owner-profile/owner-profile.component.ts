import { Component } from '@angular/core';
import {DogCardComponent} from '../../components/dog-card/dog-card.component';

@Component({
  selector: 'app-owner-profile',
  imports: [
    DogCardComponent
  ],
  templateUrl: './owner-profile.component.html',
  styleUrl: './owner-profile.component.scss'
})
export class OwnerProfileComponent {

}
