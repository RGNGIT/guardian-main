import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {LocalStorageService} from "@app/services/local-storage";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _localStorage: LocalStorageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.warn("interceptor: ", req)
    const token = this._localStorage.getItem('accessToken');
    if (!token) {
      return next.handle(req);
    }
    return next.handle(req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    }));
  }

}
