import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; // Pour l'effet de vague sur le bouton

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [ButtonModule, RippleModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {

  constructor(private router: Router) {}

  navigateToDashboard(): void {
    // Redirige l'utilisateur vers une page sûre, comme le tableau de bord.
    this.router.navigate(['/dashboard']);
  }
}
