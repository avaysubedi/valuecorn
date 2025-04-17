import { Component, inject } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
  import { CommonModule } from '@angular/common';        // for *ngIf, *ngFor etc.
  import { FormsModule } from '@angular/forms';          // for [(ngModel)]
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl:'./profile.component.html',
  imports: [CommonModule, FormsModule], // 👈 ADD THIS

  standalone: true
})
export class ProfileComponent {
  constructor(private router: Router) {}

  private profileService = inject(ProfileService);
  user = this.profileService.user;

  goToValuation(){
    this.router.navigate(['/valuation']);
  }


}


