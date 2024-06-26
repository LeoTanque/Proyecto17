import { Injectable } from '@angular/core';

import { Firestore, collectionData, docData, addDoc, updateDoc, deleteDoc, doc, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Producto {
 // imageUrl: any;
    id: string;
    productName: string;
    selectedCategory: any;
    description: string;
    image:string;
    price:number
  }
@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private productosCollection = collection(this.firestore, 'productos');


  
  constructor(private firestore: Firestore) { }



  getProductos(): Observable<Producto[]> {
    return collectionData(this.productosCollection, { idField: 'id' }) as Observable<Producto[]>;
  }

  getProductoById(id: string): Observable<Producto> {
    const productoDocRef = doc(this.firestore, `productos/${id}`);
    return docData(productoDocRef, { idField: 'id' }) as Observable<Producto>;
  }

  addProducto(producto: Producto) {
    return addDoc(this.productosCollection, producto);
  }

  updateProducto(producto: any) {
    const productoDocRef = doc(this.firestore, `productos/${producto.id}`);
    return updateDoc(productoDocRef, { ...producto });
  }

  deleteProducto(id: string) {
    const productoDocRef = doc(this.firestore, `productos/${id}`);
    return deleteDoc(productoDocRef);
  }

}
