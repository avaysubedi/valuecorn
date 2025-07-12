import { Component, inject,OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
  import { CommonModule } from '@angular/common';        // for *ngIf, *ngFor etc.
  import { FormsModule } from '@angular/forms';          // for [(ngModel)]
import { Router } from '@angular/router';
import { ValuationService } from '../../services/valuation.service';
import { AuthStateService } from '../../app/core/auth-state.service';

@Component({
  selector: 'app-profile',
  templateUrl:'./profile.component.html',
  imports: [CommonModule, FormsModule], // 👈 ADD THIS

  standalone: true
})
export class ProfileComponent {
  constructor(private router: Router,
    private valuationService: ValuationService,
    private authState: AuthStateService
  ) {}

  private profileService = inject(ProfileService);
  user = this.profileService.user;

  goToValuation(){
    this.router.navigate(['/valuation']);
  }

  goToProjection(){
    this.router.navigate(['/projection']);
  }

  ngOnInit() {
    this.fetchValuations();
  }
  valuations: any[] = [];
  selectedValuation: any = [];
  selectedValuationDetails: any = [];
  
  fetchValuations() {
    this.valuationService.getAllValuations().subscribe({
      next: (data) => {this.valuations = data},
      error: (err) => console.error('Error fetching valuations', err)
    });
  }

  openValuationDetails(valuation: any) {
    this.selectedValuation = valuation;
    this.fetchbyId(valuation.Id)
  }

  fetchbyId(valuationid:number){
this.valuationService.getValuationById(valuationid).subscribe({

  next:(data)=>{this.selectedValuationDetails=data;},
  error:(err)=>console.error('Error fetching valuations', err)
  });
}


  closeModal() {
    this.selectedValuation = null;
  }

}


