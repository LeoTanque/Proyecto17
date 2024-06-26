import { Component, OnInit, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from '../top-bar/top-bar.component';
import CrearComponent from '../crear/crear.component';
import { Producto, ProductosService } from '../../services/productos.service';
import { MessageService } from 'primeng/api/messageservice';
import { ToastrService } from 'ngx-toastr';


interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

@Component({
    selector: 'app-productos',
    standalone: true,
    templateUrl: './productos.component.html',
    styleUrl: './productos.component.scss',
    imports: [RouterModule, CommonModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule, TopBarComponent, 
      CrearComponent]
})
export default class ProductosComponent implements OnInit {
  private storage:Storage = inject(Storage)

    uploadProgress$!:Observable<number>
    dowmloadUrl$!:Observable<string>
    cantidadProductosEnCarrito: number = 0;
    carritoVisible = false;

    productos$!: Observable<Producto[]>;
   
    carritoProductos: CarritoItem[] = [];
    private productosService = inject(ProductosService);
    private router = inject(Router);

    constructor(private toastr: ToastrService) {
      this.productos$ = this.productosService.getProductos();
    
    }


  ngOnInit(): void {
    this.productos$.subscribe(productos => {
      console.log('Productos cargados:', productos);
    });

    
  }

 
  deleteProducto(id: string) {
    this.productosService.getProductoById(id).subscribe(producto => {
      if (producto && producto.image) {
        const imageRef = ref(this.storage, producto.image);
  
        // Elimina la imagen de Firebase Storage
        deleteObject(imageRef)
          .then(() => {
            console.log(`Imagen del producto con id ${id} eliminada exitosamente.`);
  
            // Luego elimina el documento del producto en Firestore
            this.productosService.deleteProducto(id)
              .then(() => {
                console.log(`Producto con id ${id} eliminado exitosamente.`);
                this.productos$ = this.productosService.getProductos();
                this.productos$.subscribe(productos => {
                  console.log('Productos cargados:', productos);
                  this.carritoProductos = this.carritoProductos.filter(item => item.producto.id !== id);
                  this.updateCarritoCounter();
                });
                this.toastr.success('Producto eliminado exitosamente', 'Éxito');
              })
              .catch(error => {
                console.error(`Error al eliminar el producto con id ${id}:`, error);
                this.toastr.error('Error al eliminar el producto', 'Error');
              });
          })
          .catch(error => {
            console.error(`Error al eliminar la imagen del producto con id ${id}:`, error);
            this.toastr.error('Error al eliminar la imagen del producto', 'Error');
          });
      } else {
        // Si el producto no tiene una imagen o no existe, elimina solo el documento
        this.productosService.deleteProducto(id)
          .then(() => {
            console.log(`Producto con id ${id} eliminado exitosamente.`);
            this.productos$ = this.productosService.getProductos();
            this.productos$.subscribe(productos => {
              console.log('Productos cargados:', productos);
              this.carritoProductos = this.carritoProductos.filter(item => item.producto.id !== id);
              this.updateCarritoCounter();
            });
            this.toastr.success('Producto eliminado exitosamente', 'Éxito');
          })
          .catch(error => {
            console.error(`Error al eliminar el producto con id ${id}:`, error);
            this.toastr.error('Error al eliminar el producto', 'Error');
          });
      }
    }, error => {
      console.error(`Error al obtener el producto con id ${id}:`, error);
      this.toastr.error('Error al obtener el producto', 'Error');
    });
  }
  

  editProducto(producto: Producto) {
    this.router.navigate(['/crear', producto.id]);
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
      this.toastr.error('Error al cargar el archivo', 'Error');
    }, 
    async ()=>{
      console.log('El archivo se subio correctamente')
      const url = await getDownloadURL(fileRef);
      console.log('url del archivo', url)
      this.toastr.success('Archivo subido correctamente', 'Éxito');
    }
    )
    }

    addToCart(producto: Producto) {
      const existingItem = this.carritoProductos.find(item => item.producto.id === producto.id);
  
      if (existingItem) {
       this.toastr.warning('Este producto ya está en el carrito', 'Producto Repetido');
     
      } else {
        
        this.carritoProductos.push({ producto, cantidad: 1 });
        this.toastr.info(`Producto '${producto.productName}' agregado con éxito`, 'Producto Agregado');
        this.cantidadProductosEnCarrito++;
      }
    }
  
    incrementQuantity(item: CarritoItem) {
      item.cantidad++;
      this.updateCarritoCounter();
    }
  

    decrementQuantity(item: CarritoItem) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        this.carritoProductos = this.carritoProductos.filter(i => i.producto.id !== item.producto.id);
        this.cantidadProductosEnCarrito--;
      }
      this.updateCarritoCounter();
    }
   

    removeFromCart(index: number) {
      this.carritoProductos.splice(index, 1);
      this.toastr.success('Producto eliminado del carrito', 'Éxito');
    }

  
    updateCarritoCounter() {
      this.cantidadProductosEnCarrito = this.carritoProductos.reduce((acc, item) => acc + item.cantidad, 0);
    }
  
    calcularTotal() {
      return this.carritoProductos.reduce((acc, item) => acc + item.producto.price * item.cantidad, 0);
    }
  
    purchase() {
      console.log('Compra realizada');
      this.toastr.success('Compra realizada con éxito', 'Éxito');
      // Lógica para completar la compra
    }


    toggleCarrito() {
      this.carritoVisible = !this.carritoVisible;
    }




}
