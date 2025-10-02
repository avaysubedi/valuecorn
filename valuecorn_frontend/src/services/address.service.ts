import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface CompanyAddress {
  addressId?: number;
  companyId: number;
  addressType: string;
  addressLine?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  poBox?: string;
  countryCode?: string;
  userId?: number;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = `${environment.apiBaseUrl}/address`;

  constructor(private http: HttpClient) {}

  upsertAddress(address: CompanyAddress): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upsert`, address);
  }
}
