import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TokenManagerService } from '../services/token-manager';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenManager: TokenManagerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ensure token is valid (refresh if needed)
    return from(this.tokenManager.checkToken()).pipe(
      switchMap(() => {
        const idToken = this.tokenManager.getIdToken();

        if (idToken) {
          // Clone request with Authorization header
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          return next.handle(authReq);
        }

        // Proceed without token if not available
        return next.handle(req);
      })
    );
  }
}
