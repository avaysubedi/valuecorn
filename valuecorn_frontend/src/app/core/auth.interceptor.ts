import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { LoadingService } from '../../services/spinner.service';
import { catchError, finalize } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';


@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loadingService:LoadingService,
    private notification: NotificationService){}

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    this.loadingService.show();

    let cloned = req;
    if (token) {
      cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'Unexpected server error';

        if (error.error?.message) {
          message = error.error.message;  // API-provided error
        } else if (error.status === 0) {
          message = 'Unable to connect to server';
        } else {
          message = `Error ${error.status}: ${error.statusText}`;
        }

        this.notification.error(message);
        return throwError(() => error);
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}
