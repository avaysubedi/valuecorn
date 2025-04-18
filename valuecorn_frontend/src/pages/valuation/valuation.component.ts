import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-valuation',
  templateUrl: './valuation.component.html',
  imports:[ReactiveFormsModule,CommonModule ]
})
export class ValuationComponent {
  valuationForm: FormGroup;
  yearsArray: FormArray;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.valuationForm = this.fb.group({
      companyCode: ['', Validators.required],
      country: ['UAE'],
      discountRate: [8, Validators.required],
      taxRate: [20, Validators.required],
      actualYears: [2, Validators.required],
      years: this.fb.array([])
    });

    this.yearsArray = this.valuationForm.get('years') as FormArray;
  }

  generateYears() {
    this.yearsArray.clear();
    const actualYears = this.valuationForm.value.actualYears;
    let startYear = new Date().getFullYear();

    for (let i = 0; i < actualYears; i++) {
      this.yearsArray.push(this.fb.group({
        year: [startYear + i],
        isProjected: [false],
        revenues: [0, Validators.required],
        cogs: [0, Validators.required],
        employeeExpense: [0, Validators.required],
        sgaExpense: [0, Validators.required],
        depreciation: [0, Validators.required],
        interestExpense: [0, Validators.required],
        otherIncome: [0, Validators.required],
        ebitda: [0],
        ebit: [0],
        nopat: [0],
        fcff: [0],
        discountedFcff: [0]
      }));
    }
  }

  submitValuation() {
    const form = this.valuationForm.value;
    const payload = {
      valuation: {
        companyCode: form.companyCode,
        country: form.country,
        discountRate: form.discountRate / 100,
        taxRate: form.taxRate / 100,
        terminalGrowthRate: 0.03, // or from a map
        terminalValue: 0,
        discountedTerminalValue: 0,
        dcfValuation: 0
      },
      years: form.years
    };

    this.http.post('http://localhost:5000/api/valuations', payload).subscribe({
      next: (res) => console.log('Valuation success', res),
      error: (err) => console.error('Valuation error', err)
    });
  }
}
