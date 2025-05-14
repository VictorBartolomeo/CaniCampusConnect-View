import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  connected = false
  role: string | null = null

  constructor() {
    const jwt = localStorage.getItem('jwt');
    if (jwt != null) {
      this.decodeJwt(jwt)
    }
  }

  decodeJwt(jwt: string) {
    localStorage.setItem('jwt', jwt);
    const jsonBody = atob(jwt.split('.')[1]);
    const body = JSON.parse(jsonBody);
    console.log(body)
    this.role = body.role;
    this.connected = true;

  }

  disconnection() {
    localStorage.removeItem('jwt');
    this.connected = false;
    this.role = null;
  }
}
