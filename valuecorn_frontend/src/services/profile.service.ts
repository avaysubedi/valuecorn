import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private userSignal = signal<any>(null);

  setUser(user: any) {
    this.userSignal.set(user);
  }

  get user() {
    return this.userSignal.asReadonly();
  }
}
