
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Dog } from '../../../models/dog';
import { DogService } from '../../../service/dog.service';
import { Subscription } from 'rxjs';
import {DogSummaryComponent} from '../../../components/owner-related/dog-summary/dog-summary.component';
import {DogFormComponent} from '../../../components/owner-related/dog-form/dog-form.component';
import {DogAddFormComponent} from '../../../components/owner-related/dog-add-form/dog-add-form.component';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-manage-dogs-page',
  imports: [
    DogSummaryComponent,
    DogFormComponent,
    DogAddFormComponent,
    Card
  ],
  templateUrl: './manage-dogs-page.component.html',
  styleUrl: './manage-dogs-page.component.scss'
})
export class ManageDogsPageComponent implements OnInit, OnDestroy {
  currentDog: Dog | null = null;
  private subscription!: Subscription;

  constructor(private dogService: DogService) {}

  ngOnInit() {
    // ✅ Pas besoin du LayoutService - la CSS variable gère tout !
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
