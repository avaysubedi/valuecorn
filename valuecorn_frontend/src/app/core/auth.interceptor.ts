import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoadingService } from '../../services/spinner.service';
import { finalize } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loadingService:LoadingService){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    // 🔹 Show spinner before request
    this.loadingService.show();

    let cloned = req;
    if (token) {
      cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 🔹 Ensure spinner is hidden after request finishes (success or error)
    return next.handle(cloned).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
