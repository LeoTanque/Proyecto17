import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AuthenticationServiceServiceService } from '../../services/authentication-service-service.service';
import { Producto } from '../../services/productos.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarModule, ButtonModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  private router = inject(Router);
  constructor(private authService: AuthenticationServiceServiceService) { } 


 crear(){
  this.router.navigate(['crear'])
 }


logout() {
  this.authService.logOut().then(() => {
    console.log('Usuario desautenticado');
    this.router.navigate(['']);
  }).catch(error => {
    console.error('Error al desautenticar:', error);
  });
}

}
