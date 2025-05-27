import { Component } from '@angular/core';
import {DogSummaryComponent} from '../../../components/owner-related/dog-summary/dog-summary.component';
import {DogFormComponent} from '../../../components/owner-related/dog-form/dog-form.component';
import {Splitter} from 'primeng/splitter';
import {DogAddFormComponent} from '../../../components/owner-related/dog-add-form/dog-add-form.component';
import {DogService} from '../../../service/dog.service';
import {Subscription} from 'rxjs';
import {Dog} from '../../../models/dog';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-manage-dogs-page',
  imports: [
    DogSummaryComponent,
    DogFormComponent,
    Splitter,
    DogAddFormComponent,
    NgStyle
  ],
  templateUrl: './manage-dogs-page.component.html',
  styleUrl: './manage-dogs-page.component.scss'
})
export class ManageDogsPageComponent {
  currentDog: Dog | null = null;
  private subscription!: Subscription;

  constructor(private dogService: DogService) {}

  ngOnInit() {
    // S'abonner aux changements du chien actif
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.currentDog = dog;
      console.log('Manage Dogs page updated for dog:', dog?.name);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
