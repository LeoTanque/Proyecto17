import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';


export const routes: Routes = [

  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path:'',
    loadComponent:()=>import('../app/componentes/login/login.component') , canActivate: [LoginGuard]
    
  },
  {
    path:'productos',
    loadComponent:()=>import('../app/componentes/productos/productos.component'),  canActivate: [authGuard]
   },
  {
    path:'home',
    loadComponent: ()=>import('../app/componentes/home/home.component'),  canActivate: [authGuard]
  },
 
 

 {
  path:'crear',
  loadComponent:()=>import('../app/componentes/crear/crear.component'),  canActivate: [authGuard]
 },
 {
  path:'crear/:id',
  loadComponent:()=>import('../app/componentes/crear/crear.component'),  canActivate: [authGuard]
 }, 

 

 
];
