import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthenticationServiceServiceService, CredencialI } from '../../services/authentication-service-service.service';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../services/CustomValidators ';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent implements OnInit{

  signupForm!: FormGroup;
    loginForm!: FormGroup;
    private messageQueue: { message: string, title: string, type: 'error' | 'success' }[] = [];
    private isMessageShowing = false;
    private selectedFile: File | null = null;
    private storage:Storage = inject(Storage)

    uploadProgress$!:Observable<number>
    dowmloadUrl$!:Observable<string>
    constructor(
      private fb: FormBuilder,
      private authService: AuthenticationServiceServiceService,
      private toastr: ToastrService,
      private router: Router 
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required, CustomValidators.passwordsMatch('password', 'confirmPassword')]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    const archivoSeleccionado:File =  event.target.files[0] 
    console.log(archivoSeleccionado)
   
    this.uploadFile(archivoSeleccionado)
  }

  async uploadFile(file:File){
    const filePath = `archivos/${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadFile = uploadBytesResumable(fileRef, file);
    uploadFile.on('state_changed', (snapshot)=>{
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes)*100;
      console.log('Proceso de carga', progress)
    }, 
  (error)=>{
    console.error('Error al crear el archivo',error)
  }, 
  async ()=>{
    console.log('El archivo se subio correctamente')
    const url = await getDownloadURL(fileRef);
    console.log('url del archivo', url)
  }
  )
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;
      const userData: CredencialI = { email, password };
      this.authService.signUpWithEmailAndpassword(userData)
        .then(() => {
          this.toastr.success('Usuario registrado con éxito', 'Éxito');
          console.log('Usuario registrado con éxito',userData )
          this.signupForm.reset();
        })
        .catch(error => {
          this.queueMessage(error.message, 'Error', 'error');
        });
    } else {
      this.showSignupErrors();
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const loginData: CredencialI = this.loginForm.value;
      this.authService.logInWithEmailAndPassword(loginData)
        .then(() => {
          this.toastr.success('Inicio de sesión exitoso', 'Éxito');
          this.router.navigate(['/productos']); // Redirigir al home después de iniciar sesión
        })
        .catch(error => {
          this.handleLoginError(error);
        });
    } else {
      this.showLoginErrors();
    }
  }
  
  private handleLoginError(error: any): void {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      this.queueMessage('Credenciales incorrectas', 'Error', 'error');
    } else {
      this.queueMessage(error.message, 'Error', 'error');
    }
  }
  

  private showSignupErrors(): void {
    const controls = this.signupForm.controls;

    if (controls['username'].hasError('required')) {
      this.queueMessage('El nombre de usuario es obligatorio', 'Error', 'error');
    }
    else if (controls['email'].hasError('required')) {
      this.queueMessage('El correo electrónico es obligatorio', 'Error', 'error');
    }
    else if (controls['email'].hasError('email')) {
      this.queueMessage('Formato de correo electrónico inválido', 'Error', 'error');
    }
    else if (controls['password'].hasError('required')) {
      this.queueMessage('La contraseña es obligatoria', 'Error', 'error');
    }
    else if (controls['password'].hasError('minlength')) {
      this.queueMessage('La contraseña debe tener al menos 8 caracteres', 'Error', 'error');
    }
    else if (controls['password'].hasError('passwordStrength')) {
      this.queueMessage('La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número', 'Error', 'error');
    }
    else if (controls['confirmPassword'].hasError('required')) {
      this.queueMessage('La confirmación de la contraseña es obligatoria', 'Error', 'error');
    }
    else if (controls['confirmPassword'].hasError('passwordsMismatch')) {
      this.queueMessage('Las contraseñas no coinciden', 'Error', 'error');
    }
  }

  private showLoginErrors(): void {
    const controls = this.loginForm.controls;

    if (controls['email'].hasError('required')) {
      this.queueMessage('El correo electrónico es obligatorio', 'Error', 'error');
    }
    else if (controls['email'].hasError('email')) {
      this.queueMessage('Formato de correo electrónico inválido', 'Error', 'error');
    }
    else if (controls['password'].hasError('required')) {
      this.queueMessage('La contraseña es obligatoria', 'Error', 'error');
    }
  }

  private queueMessage(message: string, title: string, type: 'error' | 'success'): void {
    this.messageQueue.push({ message, title, type });
    this.showNextMessage();
  }
  
  private showNextMessage(): void {
    if (this.isMessageShowing || this.messageQueue.length === 0) {
      return;
    }
  
    const { message, title, type } = this.messageQueue.shift()!;
    this.isMessageShowing = true;
  
    if (type === 'error') {
      this.toastr.error(message, title).onHidden.subscribe(() => {
        this.isMessageShowing = false;
        this.showNextMessage();
      });
    } else {
      this.toastr.success(message, title).onHidden.subscribe(() => {
        this.isMessageShowing = false;
        this.showNextMessage();
      });
    }
  }
}
