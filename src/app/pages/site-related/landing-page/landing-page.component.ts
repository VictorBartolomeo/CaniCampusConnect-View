import {Component} from '@angular/core';
import {LandingNavbarComponent} from '../../../components/site-related/landing-navbar/landing-navbar.component';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {Divider} from 'primeng/divider';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {Avatar} from 'primeng/avatar';
import {Badge} from 'primeng/badge';
import {InputText} from 'primeng/inputtext';
import {InputTextarea} from 'primeng/inputtextarea';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  imports: [Button],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  // Sample courses data
  courses = [
    {
      title: 'Socialisation du chiot',
      description: 'Apprenez à votre chiot à interagir positivement avec d\'autres chiens et personnes.',
      level: 'Débutant',
      duration: '8 semaines',
      image: 'assets/images/placeholder-puppy.jpg'
    },
    {
      title: 'Obéissance de base',
      description: 'Maîtrisez les commandes essentielles comme assis, couché, reste et rappel.',
      level: 'Tous niveaux',
      duration: '10 semaines',
      image: 'assets/images/placeholder-obedience.jpg'
    },
    {
      title: 'Agility récréative',
      description: 'Initiez votre chien aux parcours d\'obstacles pour stimuler son corps et son esprit.',
      level: 'Intermédiaire',
      duration: '12 semaines',
      image: 'assets/images/placeholder-agility.jpg'
    },
    {
      title: 'Comportement avancé',
      description: 'Résolvez les problèmes comportementaux et renforcez la relation avec votre chien.',
      level: 'Avancé',
      duration: '8 semaines',
      image: 'assets/images/placeholder-behavior.jpg'
    }
  ];

  // Coaches data
  coaches = [
    {
      name: 'Tetiana Lombardi',
      description: 'Éducatrice canine certifiée avec plus de 15 ans d\'expérience, Tetiana est spécialisée dans la rééducation comportementale et l\'approche positive. Sa patience et sa compréhension profonde de la psychologie canine font d\'elle une coach très appréciée par les chiens les plus anxieux.',
      image: 'assets/images/placeholder-coach-female.jpg'
    },
    {
      name: 'Stéphane Scheeres',
      description: 'Ancien vétérinaire reconverti en éducateur canin, Stéphane combine ses connaissances médicales avec une approche ludique de l\'apprentissage. Passionné par les sports canins, il excelle particulièrement dans les cours d\'agility et d\'obéissance avancée.',
      image: 'assets/images/placeholder-coach-male.jpg'
    }
  ];
}
