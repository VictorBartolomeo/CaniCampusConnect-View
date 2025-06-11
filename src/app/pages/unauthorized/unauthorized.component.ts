import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {AuthStateService} from '../../service/auth-state.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [ButtonModule, RippleModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {

  router = inject(Router);
  authStateService = inject(AuthStateService)


  navigateToDashboard(): void {
    const userRole = this.authStateService.getRole();

    if (userRole === "ROLE_COACH") {
      this.router.navigateByUrl('/coach/dashboard');
    } else if (userRole === "ROLE_OWNER") {
      this.router.navigateByUrl('/dashboard');

    } else if (userRole === "ROLE_CLUBOWNER") {
      // this.router.navigate(['/clubowner/dashboard']);
      console.log("A FAIRE")
    } else {
      this.router.navigateByUrl('/login')
    }
  }
}
