import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationServiceServiceService } from '../services/authentication-service-service.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthenticationServiceServiceService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(user => {
      if (user) {
        console.log('Usuario autenticado:', user);
        return true;
      } else {
        router.navigate(['']);
        return false;
      }
    })
  );

  
};
