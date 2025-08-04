
import {Component, EventEmitter, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {BadgeModule} from 'primeng/badge';
import {TooltipModule} from 'primeng/tooltip';
import {Dog} from '../../../models/dog';
import {Subscription} from 'rxjs';
import {DogService} from '../../../service/dog.service';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faWeightScale} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import {DogAddFormComponent} from '../dog-add-form/dog-add-form.component';

@Component({
  selector: 'app-dog-summary',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FontAwesomeModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    DogAddFormComponent
  ],
  templateUrl: './dog-summary.component.html',
  styleUrl: './dog-summary.component.scss'
})
export class DogSummaryComponent implements OnInit, OnDestroy {
  @Input() dog: Dog | null = null;
  @Output() editRequested = new EventEmitter<void>();

  weightIcon = faWeightScale;
  private subscription!: Subscription;

  constructor(
    public dogService: DogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.dogService.activeDog$.subscribe(dog => {
      this.dog = dog;
      console.log('Dog summary updated for dog:', dog?.name);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getDogAvatarUrl(): string {
    if (!this.dog) {
      return "?";
    }

    const dogWithFirstBreedOnly = {
      ...this.dog,
      breeds: this.dog.breeds && this.dog.breeds.length > 0 ? [this.dog.breeds[0]] : []
    };

    return this.dogService.getDogAvatarUrl(dogWithFirstBreedOnly);
  }

  getGenderIcon(): { icon: any, color: string } {
    return this.dogService.getGenderIcon(this.dog?.gender);
  }

  getGenderLabel(): string {
    return this.dogService.getGenderLabel(this.dog?.gender);
  }

  getDogAge(): string {
    return this.dogService.getDogAge(this.dog?.birthDate);
  }

  getBreedNames(): string {
    return this.dogService.getBreedNames(this.dog?.breeds);
  }

  formatDate(): string {
    return this.dogService.formatDateForDisplay(this.dog?.birthDate);
  }

  getLatestWeight(): string {
    return this.dog ? this.dogService.getLatestWeight(this.dog) : 'Non enregistré';
  }

  getHealthStatus(): { label: string, color: string } {
    return this.dog ? this.dogService.getHealthStatus(this.dog) : { label: 'Inconnu', color: 'text-gray-500' };
  }

  getVaccinationStatus(): { label: string, color: string } {
    return this.dog ? this.dogService.getVaccinationStatus(this.dog) : { label: 'Non renseignée', color: 'text-gray-500' };
  }

}
