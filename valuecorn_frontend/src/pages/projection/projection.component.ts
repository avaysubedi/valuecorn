
// Angular standalone component for Projection Form
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {environment} from '../../environments/environment'
@Component({
  selector: 'app-projection',
  standalone: true,
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './projection.component.html',
  styleUrls: ['./projection.component.css']
})
export class ProjectionComponent {
  projectionForm: FormGroup;
  fields = ['revenues', 'cogs', 'employee_expense', 'sga_expense', 'depreciation', 'interest_expense', 'other_income'];
  userId = 1; // will be replaced with JWT-based userId

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.projectionForm = this.fb.group({
      company_code: ['', Validators.required],
      country: ['', Validators.required],
      actual_years: [3, Validators.required],
      projection_years: [2, Validators.required],
      discount_rate: [10, Validators.required],
      tax_rate: [15, Validators.required],
      terminal_growth_rate: [2.5, Validators.required],
      growth_rates: this.fb.group(
        this.fields.reduce((obj, field) => {
          obj[field] = [0];
          return obj;
        }, {} as Record<string, any>)
      ),
      data: this.fb.group(
        this.fields.reduce((obj, field) => {
          obj[field] = this.fb.array([100, 110, 120].slice(0, 3));
          return obj;
        }, {} as Record<string, any>)
      )
    });
  }

  getDataField(field: string): FormArray {
    return this.projectionForm.get('data')?.get(field) as FormArray<FormControl>;
  }

  addYear(): void {
    for (let field of this.fields) {
      const array = this.getDataField(field);
      array.push(this.fb.control(0));
    }
    this.projectionForm.patchValue({ actual_years: this.getDataField('revenues').length });
  }

  removeYear(): void {
    for (let field of this.fields) {
      const array = this.getDataField(field);
      if (array.length > 1) array.removeAt(array.length - 1);
    }
    this.projectionForm.patchValue({ actual_years: this.getDataField('revenues').length });
  }

  submit(): void {
    const payload = {
      user_id: this.userId,
      ...this.projectionForm.value
    };
    this.http.post(`${environment.apiBaseUrl}/projections`, payload).subscribe({
      next: (res) => alert('Projection Created!'),
      error: (err) => console.error(err)
    });
  }
}
