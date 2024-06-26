import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { CollectionReference, Firestore } from '@angular/fire/firestore';
import { Producto, ProductosService } from '../../services/productos.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, InputTextModule, ButtonModule, InputTextareaModule,RadioButtonModule, FormsModule,
    ReactiveFormsModule, InputNumberModule
   ], 
  templateUrl: './crear.component.html',
  styleUrl: './crear.component.scss'
})
export default class CrearComponent implements OnInit {

  private storage:Storage = inject(Storage)
  private firestore = inject(Firestore);
  private route= inject(ActivatedRoute);
  private productosService = inject(ProductosService);
  private auth: Auth = inject(Auth);
  productos$!: Observable<any[]>;
  productosCollection!: CollectionReference;
  uploadProgress$!:Observable<number>
    dowmloadUrl$!:Observable<string>

  ingredient!: string;
  categories: any[] = [
    { name: 'Accounting', key: 'A' },
    { name: 'Marketing', key: 'M' },
    { name: 'Production', key: 'P' },
    { name: 'Research', key: 'R' }
];

  productForm: FormGroup;
  userId: string | null = null;
  productId: string | null = null;
  imageUrl: string | null = null;
  imageName: string | null = null;
  selectedCategoryName: string | null = null;

  constructor(private fb: FormBuilder, public router:Router, private toastr: ToastrService) {

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      selectedCategory: ['', Validators.required],
      description: [''],
      image: [''],
      price: ['', [Validators.required, Validators.min(0)]]
    });



    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }


  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.loadProductData(this.productId);
    }

    this.productForm.get('selectedCategory')?.valueChanges.subscribe(value => {
      const category = this.categories.find(cat => cat.key === value);
      this.selectedCategoryName = category ? category.name : null;
    });
  }

  loadProductData(productId: string) {
    this.productosService.getProductoById(productId).subscribe(producto => {
     this.productForm.patchValue(producto);
     this.imageUrl = producto.image; 
    console.log('jkkg',producto)
    console.log('url', this.imageUrl)
    
    });
  }

 


 


  saveProduct() {
    if (this.productForm.valid && this.userId) {
      const productData = this.productForm.value;
      if (this.productId) {
        this.updateProduct(productData);
      } else {
        this.addProduct(productData);
      }
    } else {
      console.log('Formulario inválido. Verifica los campos.');
    }
  }


  addProduct(productData: Producto) {
    this.productosService.addProducto(productData)
      .then(() => {
        console.log('Producto guardado en Firestore correctamente.', productData);
        this.productForm.reset();
        this.router.navigate(['productos']);
      })
      .catch((error) => {
        console.error('Error al guardar el producto en Firestore:', error);
      });
  }

  updateProduct(productData: Producto) {
    const updatedProduct = { ...productData, id: this.productId };
    this.productosService.updateProducto(updatedProduct)
      .then(() => {
        console.log('Producto actualizado correctamente.', updatedProduct);
        this.productForm.reset();
        this.router.navigate(['productos']);
      })
      .catch((error) => {
        console.error('Error al actualizar el producto en Firestore:', error);
      });
  }





  onFileSelected1(event: any): void {
    const archivoSeleccionado:File =  event.target.files[0] 
    console.log(archivoSeleccionado)
    
   
    this.uploadFile(archivoSeleccionado)

  }

  async uploadFile1(file:File){
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

  async uploadFile2(file: File) {
    const filePath = `archivos/${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
  
    // Evento para actualizar el progreso de carga
    uploadTask.on('state_changed',
      (snapshot) => {
        // Aquí puedes obtener el progreso y actualizar la interfaz si lo necesitas
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Progreso de carga:', progress);
      },
      (error) => {
        console.error('Error al cargar el archivo:', error);
      },
      async () => {
        // La carga se completó exitosamente
        console.log('El archivo se cargó correctamente');
  
        // Obtener la URL de descarga después de que la carga sea exitosa
        try {
          const downloadURL = await getDownloadURL(fileRef);
  
          // Actualizar el formulario con la URL de la imagen
          this.productForm.patchValue({ image: downloadURL });
          console.log('URL del archivo subido:', downloadURL);
  
          // Aquí podrías guardar otros datos del producto en Firestore junto con la URL
          // this.saveProductData(downloadURL);
  
        } catch (error) {
          console.error('Error al obtener la URL de descarga:', error);
        }
      }
    );
  }
  
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imageName = file.name;
      this.uploadFile(file);
    }
  }

  async uploadFile(file: File) {
    const filePath = `archivos/${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Progreso de carga:', progress);
      },
      (error) => {
        console.error('Error al cargar el archivo:', error);
      },
      async () => {
        const downloadURL = await getDownloadURL(fileRef);
        this.productForm.patchValue({ image: downloadURL });
        this.imageUrl = downloadURL;  // Actualizar la URL de la imagen para la vista previa
        console.log('URL del archivo subido:', downloadURL);
      }
    );
  }

}
