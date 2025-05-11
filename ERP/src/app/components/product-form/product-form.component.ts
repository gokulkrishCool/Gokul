import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Product } from '../../product';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null; // Input for editing
  @Input() isVisible: boolean = false;
  @Output() save = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();

  currentProduct: Product = this.getEmptyProduct();
  isEditMode: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.currentProduct = { ...this.product };
      this.isEditMode = true;
    } else if (changes['product'] && !this.product) {
      this.resetForm();
    }
  }

  private getEmptyProduct(): Product {
    return { id: 0, name: '', description: '', price: 0, imageUrl: '' };
  }

  resetForm(form?: NgForm): void {
    if (form) {
      form.resetForm();
    }
    this.currentProduct = this.getEmptyProduct();
    this.isEditMode = false;
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const productToSave: Product = { ...this.currentProduct };
      if (!this.isEditMode) {
        // For new products, the service will assign an ID.
        // We can remove the id or set it to a placeholder if the service handles it.
        // For this example, the service assigns the ID, so we can pass it without an ID or with 0.
        const { id, ...newProductData } = productToSave;
        this.save.emit({ ...newProductData, id: 0 } as Product);
      } else {
        this.save.emit(productToSave);
      }
      this.resetForm(form);
      this.close.emit();
    }
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }
}