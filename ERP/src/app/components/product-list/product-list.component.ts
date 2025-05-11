import { Component, OnInit } from '@angular/core';
import { Product } from '../../product';
import { ProductService } from '../../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isPopupVisible: boolean = false;
  selectedProduct: Product | null = null; // For editing

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (data) => this.products = data,
      (error) => console.error('Error fetching products:', error)
    );
  }

  openAddProductPopup(): void {
    this.selectedProduct = null; // Ensure it's for adding
    this.isPopupVisible = true;
  }

  openEditProductPopup(product: Product): void {
    this.selectedProduct = { ...product }; // Pass a copy to avoid direct mutation
    this.isPopupVisible = true;
  }

  closeProductPopup(): void {
    this.isPopupVisible = false;
    this.selectedProduct = null;
  }

  handleSaveProduct(productData: Omit<Product, 'id'> | Product): void {
    if (this.selectedProduct && 'id' in productData && productData.id > 0) { // Editing existing product
      this.productService.updateProduct(productData as Product).subscribe({
        next: () => {
          this.loadProducts();
          this.closeProductPopup();
          // Add success notification if desired
        },
        error: (err) => console.error('Error updating product:', err)
      });
    } else { // Adding new product
      this.productService.addProduct(productData as Omit<Product, 'id'>).subscribe({
        next: () => {
          this.loadProducts();
          this.closeProductPopup();
          // Add success notification if desired
        },
        error: (err) => console.error('Error adding product:', err)
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.loadProducts();
          // Add success notification if desired
        },
        (error) => console.error('Error deleting product:', error)
      );
    }
  }
}