import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  loggedIn = signal(!!localStorage.getItem('token')); // ← initialize from token

  setLoginState(state: boolean) {
    this.loggedIn.set(state);
  }

  isLoggedIn() {
    return this.loggedIn();
  }
}
