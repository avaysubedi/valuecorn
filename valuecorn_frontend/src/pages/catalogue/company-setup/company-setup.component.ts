import { Component,OnInit  } from '@angular/core';
import { LookupService, Country, Industry, SyntheticRating } from '../../../services/lookup.service';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../app/material.imports';

@Component({
  selector: 'app-company-setup',
  imports: [FormsModule,CommonModule,MATERIAL_IMPORTS],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.css'
})
export class CompanySetupComponent implements OnInit {
    countries: Country[] = [];
  industries: Industry[] = [];
  ratings: SyntheticRating[] = [];

  company: any = {}; // model for form

  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {
    this.lookupService.getCountries().subscribe(data => this.countries = data);
    this.lookupService.getIndustries().subscribe(data => this.industries = data);
    this.lookupService.getSyntheticRatings().subscribe(data => this.ratings = data);
  }

  saveCompany(){
    
  }
}
