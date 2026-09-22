export interface IntakeItem {
  _id: string;
  quantity: number;
  batch?: string;
  expirationDate: string;

  productId: {
    _id: string;
    name: string;
    barcode: string;
    brand?: string;
    imageUrl?: string;
    unit?: string;
    product_quantity?: string;
  };
}
