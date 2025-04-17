// src/app/services/register.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRegisterPayload } from '../app/models/register-payload';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:5000/api/register';

  constructor(private http: HttpClient) {}

  register(payload: UserRegisterPayload): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}
