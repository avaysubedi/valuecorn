import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private apiUrl = `${environment.apiBaseUrl}/lookups`; // adjust for your backend

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/countries`);
  }

  getIndustries(): Observable<Industry[]> {
    return this.http.get<Industry[]>(`${this.apiUrl}/industries`);
  }

  getSyntheticRatings(): Observable<SyntheticRating[]> {
    return this.http.get<SyntheticRating[]>(`${this.apiUrl}/ratings`);
  }
}

// Models
export interface Country {
  CountryCode: string;
  CountryName: string;
  ERP: number;
  updatedOn: string;
}

export interface Industry {
  IndustryCode: string;
  IndustryName: string;
  Region: string;
  UnleveredBeta: number;
  LeveredBeta: number;
  AfterTaxROC: number;
  PretaxMargin: number;
  RevenueGrowth5Y: number;
  EffectiveTaxRate: number;
  CostOfEquity: number;
  StdDeviation: number;
  updatedOn: string;
}

export interface SyntheticRating {
  RatingCode: string;
  DefaultSpread: number;
  TypicalInterestRate: number;
  Notes: string;
  updatedOn: string;
}
