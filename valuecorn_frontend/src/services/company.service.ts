import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Company {
  companyId?: number;
  companyCode: string;
  companyName: string;
  tradeName?: string;
  dateOfIncorporation?: string;
  countryCode?: string;
  currency?:string;
  industryCode?: string;   // ✅ Added
  legalStructure?: string;
  businessLicenseNumber?: string;
  licenseExpiryDate?: string;
  officialPhone?: string;
  officialEmail?: string;
  website?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiBaseUrl}/company`; // adjust for your backend

  constructor(private http: HttpClient) {}

  createCompany(company: Company): Observable<{ companyId: number }> {
    return this.http.post<{ companyId: number }>(this.apiUrl, company);
  }

  updateCompany(id: number, company: Company): Observable<{ companyId: number }> {
    return this.http.put<{ companyId: number }>(`${this.apiUrl}/${id}`, company);
  }
}
