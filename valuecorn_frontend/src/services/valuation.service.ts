import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValuationService {
  private baseUrl = 'http://localhost:5000/api/valuations';

  constructor(private http: HttpClient) {}

  getAllValuations(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getValuationById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}/years`);
  }
}
