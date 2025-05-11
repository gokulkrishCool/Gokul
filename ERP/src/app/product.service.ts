import { Injectable } from '@angular/core';
import { Product } from './product';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 1200, imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Laptop' },
    { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 25, imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=Mouse' },
    { id: 3, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 75, imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?Text=Keyboard' },
    { id: 4, name: '4K Monitor', description: '27-inch 4K UHD Monitor', price: 300, imageUrl: 'https://via.placeholder.com/150/008000/FFFFFF?Text=Monitor' }
  ];
  private nextId = 5;

  constructor() { }

  getProducts(): Observable<Product[]> {
    return of([...this.products]); // Return a copy
  }

  getProductById(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct: Product = { ...product, id: this.nextId++ };
    this.products.push(newProduct);
    return of(newProduct);
  }

  updateProduct(product: Product): Observable<Product> {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.products[index] = product;
      return of(product);
    }
    return throwError(() => new Error('Product not found for update'));
  }

  deleteProduct(id: number): Observable<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return of(undefined);
    }
    return throwError(() => new Error('Product not found for deletion'));
  }
}