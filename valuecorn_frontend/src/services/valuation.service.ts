import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValuationService {
  private baseUrl = `${environment.apiBaseUrl}/valuations`;;

  constructor(private http: HttpClient) {}

  getAllValuations(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getValuationById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}/years`);
  }
}
