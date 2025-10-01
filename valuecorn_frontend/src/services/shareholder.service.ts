import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Shareholder {
  tempId?: number;       // Only exists in temp
  companyId?: number;
  shareholderName: string;
  nationality?: string;
  percentage?: number;
  isUBO?: boolean;
  uboId?: string;
  type?: string;         // Individual / Corporate
  createdAt?: string;    // For temp rows
}

@Injectable({
  providedIn: 'root'
})
export class ShareholdersService {
      private apiUrl = `${environment.apiBaseUrl}/shareholders`;


  constructor(private http: HttpClient) {}

  // 1. Add to Temp
  addTemp(companyId: number, sh: Shareholder): Observable<any> {
    return this.http.post(`${this.apiUrl}/temp/add?companyId=${companyId}`, sh);
  }

  // 2. Delete from Temp
  deleteTemp(companyId: number, tempId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/temp/delete/${companyId}/${tempId}`);
  }

  // 3. Get Temp rows
  getTemp(companyId: number): Observable<Shareholder[]> {
    return this.http.get<Shareholder[]>(`${this.apiUrl}/temp/${companyId}`);
  }

  // 4. Commit Temp -> Main
  commit(companyId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/commit/${companyId}`, {});
  }
}
