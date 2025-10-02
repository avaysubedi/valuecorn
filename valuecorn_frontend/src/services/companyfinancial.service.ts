import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
// DTOs matching backend
export interface CompanyFinancialDto {
  financialId?: number;
  companyId: number;
  fiscalYearEnd?: number;
  accountingStandards?: string;
  externalAuditor?: string;
}

export interface CompanyTaxDto {
  taxId?: number;
  companyId: number;
  vatRegNo?: string;
  vatDate?: string; // ISO string (backend expects DateTime)
  corporateTaxRegNo?: string;
  corporateTaxDate?: string;
  freeZoneBenefit?: string;
  exemptions?: string;
}

// Combined request object
export interface CompanyInfoRequest {
  companyId: number;
  financials: CompanyFinancialDto;
  tax: CompanyTaxDto;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {
  private apiUrl = `${environment.apiBaseUrl}/companyinfo`; // adjust for your backend

  constructor(private http: HttpClient) {}

  // Save (insert/update) financial + tax
  upsertCompanyInfo(payload: CompanyInfoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/upsert-financials-tax`, payload);
  }

  // Load existing company financial + tax info
  getCompanyInfo(companyId: number): Observable<CompanyInfoRequest> {
    return this.http.get<CompanyInfoRequest>(`${this.apiUrl}/${companyId}`);
  }

  upsertFinancialsTax(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/upsert-financials-tax`, data);
}

}
