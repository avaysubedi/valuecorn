import { Component,OnInit  } from '@angular/core';
import { LookupService, Country, Industry, SyntheticRating } from '../../../services/lookup.service';
import { FormBuilder, FormGroup, FormsModule,ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../app/material.imports';
import { CompanyService, Company } from '../../../services/company.service';


@Component({
  selector: 'app-company-setup',
  imports: [FormsModule,CommonModule,MATERIAL_IMPORTS,ReactiveFormsModule],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.css'
})
export class CompanySetupComponent implements OnInit {
    countries: Country[] = [];
  industries: Industry[] = [];
  ratings: SyntheticRating[] = [];

  company: any = {}; // model for form
  basicInfoForm: FormGroup;
  companyId?: number;
  
  constructor(private lookupService: LookupService,private fb: FormBuilder,
     private companyService: CompanyService,
    ) {
  this.basicInfoForm = this.fb.group({
      companyCode: ['', Validators.required],
      companyName: ['', Validators.required],
      tradeName: [''],
      dateOfIncorporation: [''],
      countryCode: [''],
       industryCode: [''], 
      legalStructure: [''],
      businessLicenseNumber: [''],
      licenseExpiryDate: [''],
      officialPhone: [''],
      officialEmail: ['', Validators.email],
      website: [''],
      currency:['']
    });

  }

  ngOnInit(): void {
    this.lookupService.getCountries().subscribe(data => this.countries = data);
    this.lookupService.getIndustries().subscribe(data => this.industries = data);
  //  this.lookupService.getSyntheticRatings().subscribe(data => this.ratings = data);
  }

saveBasicInfo(): void {
    const company: Company = this.basicInfoForm.value;

    if (this.companyId) {
      this.companyService.updateCompany(this.companyId, company).subscribe({
        next: res => {
          this.companyId = res.companyId;
          console.log('✅ Company updated:', this.companyId);
        },
        error: err => console.error('❌ Update failed:', err)
      });
    } else {
      this.companyService.createCompany(company).subscribe({
        next: res => {
          this.companyId = res.companyId;
          console.log('✅ Company created:', this.companyId);
        },
        error: err => console.error('❌ Create failed:', err)
      });
    }
  }
}
