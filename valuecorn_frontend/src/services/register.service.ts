// src/app/services/register.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRegisterPayload } from '../app/models/register-payload';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = `${environment.apiBaseUrl}/register`;

  constructor(private http: HttpClient) {}

  register(payload: UserRegisterPayload): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}
