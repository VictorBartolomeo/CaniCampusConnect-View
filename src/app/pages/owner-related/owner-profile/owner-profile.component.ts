import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DogCardComponent } from '../../../components/owner-related/dog-card/dog-card.component';
import { OwnerCardComponent } from '../../../components/owner-related/owner-card/owner-card.component';
import { DogService } from '../../../service/dog.service';
import { Dog } from '../../../models/dog';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [
    CommonModule,
    DogCardComponent,
    OwnerCardComponent,
    ButtonModule,
    RouterModule,
    DividerModule,
    Card
  ],
  templateUrl: './owner-profile.component.html',
  styleUrl: './owner-profile.component.scss'
})
export class OwnerProfileComponent implements OnInit, OnDestroy {
  userDogs: Dog[] = [];
  private subscription!: Subscription;

  constructor(public dogService: DogService) {}

  ngOnInit() {
    this.subscription = this.dogService.userDogsSubject.subscribe(dogs => {
      this.userDogs = dogs;
    });

    // Recharger les chiens pour s'assurer d'avoir les données les plus récentes
    this.dogService.loadUserDogs();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
