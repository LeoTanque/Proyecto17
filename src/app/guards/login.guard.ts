import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationServiceServiceService } from '../services/authentication-service-service.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthenticationServiceServiceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Si el usuario está autenticado, redirige al home
          this.router.navigate(['/home']);
          return false;
        } else {
          // Si no está autenticado, permite el acceso
          return true;
        }
      })
    );
  }
}



