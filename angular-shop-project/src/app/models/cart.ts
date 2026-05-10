import { Price } from "./product";

export interface CartItem {
productId: string;
quantity: number;
pricePerQuantity: number;
}

export interface CartResponse {
    products: CartItem[];
    total: {
        price: Price
    }
}
