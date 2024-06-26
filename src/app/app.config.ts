import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideToastr } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),provideAnimations(),provideToastr({timeOut: 1000, preventDuplicates:true}) ,
    provideFirebaseApp(() => initializeApp({"projectId":"basedatos-1b881",
      "appId":"1:795089391675:web:47f195c1672574e3bd4c1e",
      "storageBucket":"basedatos-1b881.appspot.com",
      "apiKey":"AIzaSyCmL3CppcNNx3Y2LLdhWa98O4k0mO_g5Tk",
      "authDomain":"basedatos-1b881.firebaseapp.com",
      "messagingSenderId":"795089391675"})),
     provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()), BrowserModule, BrowserAnimationsModule
   
    ]
};




