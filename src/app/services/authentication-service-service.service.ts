import { Injectable, inject } from '@angular/core';
import { Auth, UserCredential, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';

export interface CredencialI {
  email:string,
  password:string
  }

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceServiceService {
  private auth = inject(Auth);
readonly authState$ =  authState(this.auth)


  constructor() { }

  signUpWithEmailAndpassword(credencial:CredencialI): Promise<UserCredential>{
    return createUserWithEmailAndPassword(
      this.auth, 
      credencial.email, 
      credencial.password
    )
   }
  
  
  logInWithEmailAndPassword(credencial: CredencialI): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, credencial.email, credencial.password);
  }

  logOut(): Promise<void> {
    return signOut(this.auth);
  }
  

  isLoggedIn(): Observable<boolean> {
    return this.authState$.pipe(
      map((user: any) => !!user)
    );
  }
  
}
