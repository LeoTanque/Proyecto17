import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Producto, ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, RouterModule, InputNumberModule, InputTextModule, InputTextareaModule, ButtonModule, RadioButtonModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export default class UpdateComponent {
  producto: Producto = {
    productName: '',
    selectedCategory: '',
    description: '',
    image: '',
    price: 0,
    id: ''
  };
  productId: string | null = null;
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage: Storage = inject(Storage);

  ngOnInit() {
   /* this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.productosService.getProductoById(this.productId).subscribe(producto => {
        this.producto = producto;
      });
    }*/
  }

  updateProduct() {
    if (this.productId) {
      const productData = { ...this.producto, id: this.productId };
      this.productosService.updateProducto(productData)
        .then(() => {
          console.log('Producto actualizado correctamente.');
          this.router.navigate(['/productos']);
        })
        .catch((error: any) => {
          console.error('Error al actualizar el producto:', error);
        });
    } else {
      console.log('Formulario inválido. Verifica los campos.');
    }
  }

 
}
