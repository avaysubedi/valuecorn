import { Component, OnInit } from '@angular/core';
import { LookupService, Country, Industry, SyntheticRating } from '../../../services/lookup.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../app/material.imports';
import { CompanyService, Company } from '../../../services/company.service';
import { AddressService, CompanyAddress } from '../../../services/address.service';
import { CompanyInfoService } from '../../../services/companyfinancial.service';
import { ShareholdersService } from '../../../services/shareholder.service';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-company-setup',
  imports: [FormsModule, CommonModule, MATERIAL_IMPORTS, ReactiveFormsModule],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.css'
})
export class CompanySetupComponent implements OnInit {
  countries: Country[] = [];
  industries: Industry[] = [];
  ratings: SyntheticRating[] = [];

  company: any = {}; // model for form
  basicInfoForm: FormGroup;
  companyId: number=1003;
  registeredAddressForm: FormGroup;
  operationalAddressForm: FormGroup;
  addressFormGroup: FormGroup;
  financialTaxForm: FormGroup;
  shareholdersForm:FormGroup;
   shareholders: any[] = [];
   shareholdersData = new MatTableDataSource<FormGroup>();


columns = ['shareholderName','nationality','type','percentage','isUbo','uboId','actions'];

  userId: any;
  sameAsRegistered: boolean = false;

   months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  constructor(private lookupService: LookupService, private fb: FormBuilder,
    private addressService: AddressService,
    private companyService: CompanyService,
    private companyInfoService:CompanyInfoService,
    private shService:ShareholdersService
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
      currency: ['']
    });
    this.registeredAddressForm = this.fb.group({
      addressLine: [''],
      street: [''],
      city: ['', Validators.required],
      state: [''],
      postalCode: [''],
      poBox: [''],
      countryCode: ['', Validators.required]
    });
    this.operationalAddressForm = this.fb.group({
      addressLine: [''],
      street: [''],
      city: ['', Validators.required],
      state: [''],
      postalCode: [''],
      poBox: [''],
      countryCode: ['', Validators.required]
    });

    this.addressFormGroup = this.fb.group({
      registered: this.registeredAddressForm,
      operational: this.operationalAddressForm,
      sameAsRegistered: [false]
    });

    this.financialTaxForm = this.fb.group({
      financials: this.fb.group({
        financialId: [null],
        fiscalYearEnd: [null],
        accountingStandards: [''],
        externalAuditor: ['']
      }),
      tax: this.fb.group({
        taxId: [null],
        vatRegNo: [''],
        vatDate: [null],
        corporateTaxRegNo: [''],
        corporateTaxDate: [null],
        freeZoneBenefit: [''],
        exemptions: ['']
      })
    });

     this.shareholdersForm = this.fb.group({
         rows: this.fb.array([])

    });

    this.loadShareholders();


  }

  ngOnInit(): void {
    this.lookupService.getCountries().subscribe(data => this.countries = data);
    this.lookupService.getIndustries().subscribe(data => this.industries = data);
    this.lookupService.getCountries().subscribe(data => (this.countries = data));

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
        error: err => console.error('Update failed:', err)
      });
    } else {
      this.companyService.createCompany(company).subscribe({
        next: res => {
          this.companyId = res.companyId;
          console.log('✅ Company created:', this.companyId);
        },
        error: err => console.error('Create failed:', err)
      });
    }
  }


  toggleSameAsRegistered(): void {
    const same = this.addressFormGroup.get('sameAsRegistered')?.value;
    if (same) {
      this.operationalAddressForm.patchValue(this.registeredAddressForm.value);
      this.operationalAddressForm.disable();
    } else {
      this.operationalAddressForm.reset();
      this.operationalAddressForm.enable();
    }
  }

  saveAddresses(): void {
    // Save Registered
    const registered = {
      ...this.registeredAddressForm.value,
      companyId: this.companyId,
      addressType: 'Registered',
      userId: this.userId
    };

    this.addressService.upsertAddress(registered).subscribe({
      next: res => console.log('✅ Registered Address saved', res),
      error: err => console.error(err)
    });

    // Save Operational (only if not "same as registered")
    if (!this.sameAsRegistered) {
      const operational = {
        ...this.operationalAddressForm.value,
        companyId: this.companyId,
        addressType: 'Operational',
        userId: this.userId
      };

      this.addressService.upsertAddress(operational).subscribe({
        next: res => console.log('✅ Operational Address saved', res),
        error: err => console.error(err)
      });
    }
  }


  saveFinancialTax() {
const payload = {
    companyId: 1003, //this.companyId, // set from Step 1
    financials: this.financialTaxForm.value.financials,
    tax: this.financialTaxForm.value.tax
  };

  this.companyInfoService.upsertFinancialsTax(payload).subscribe({
    next: res => {
      console.log('Saved financials & tax', res);
      //this.stepper.next(); // move to Review step
    },
    error: err => console.error('Error saving financials & tax', err)
  });
}


get rows(): FormArray {
  return this.shareholdersForm.get('rows') as FormArray;
}
get rowsArray() {
  return this.rows.controls as FormGroup[];
}
addRow(sh?: any) {
  this.rows.push(this.fb.group({
    tempId: [sh?.tempId || null],
    shareholderName: [sh?.shareholderName || '', Validators.required],
    nationality: [sh?.nationality || ''],
    type: [sh?.type || 'Individual'],
    percentage: [sh?.percentage || 0],
    isUbo: [sh?.isUbo || false],
    uboId: [sh?.uboId || '']
  }));
  this.shareholdersData.data = this.rows.controls as FormGroup[];
}

saveRow(index: number) {
  const row = this.rows.at(index).value;

  // attach companyId
  const payload = { ...row, companyId: this.companyId };

  this.shService.addTemp(this.companyId, payload).subscribe({
    next: res => {
      console.log('Row saved to temp:', res);
      this.loadShareholders(); // reload table so tempId is populated
    },
    error: err => console.error('Error saving row:', err)
  });
}


deleteRow(index: number) {
  const row = this.rows.at(index).value;
  if (row.tempId) {
    this.shService.deleteTemp(this.companyId, row.tempId).subscribe(() => {
      this.rows.removeAt(index);
      this.shareholdersData.data = this.rows.controls as FormGroup[];
    });
  } else {
    this.rows.removeAt(index);
    this.shareholdersData.data = this.rows.controls as FormGroup[];
  }
}

loadShareholders() {
  this.shService.getTemp(this.companyId).subscribe(res => {
    this.rows.clear();
    res.forEach((s: any) => this.addRow(s));

    // 🔑 force refresh datasource
    this.shareholdersData.data = this.rows.controls as FormGroup[];
    console.log('Loaded rows', this.rows.value);
  });
}


commitShareholders() {
  const payload = this.rows.value;
  this.shService.commit(this.companyId).subscribe(() => {
    alert('Shareholders committed successfully!');
    this.loadShareholders();
  });
}




}
