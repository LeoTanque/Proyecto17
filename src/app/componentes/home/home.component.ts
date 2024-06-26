import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { AuthenticationServiceServiceService } from '../../services/authentication-service-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, ButtonModule, InputTextModule, FormsModule, TopBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements OnInit{

  constructor(private authService: AuthenticationServiceServiceService) { }
  ngOnInit(): void {
  

}

}
