
export interface Price {
    current: number;
    currency: string;
    beforeDiscount:number;
    discountPercentage:number;
}

export interface Category {
   id: string;
   name: string;
   image: string;
}

export interface Rating {
   userId : string;
   value : number;
   createdAt : string;
}

export interface Product {
  _id:string;
  title:string;
  description:string;
  issueDate:string;
  thumbnail:string;
  stock: number;
  rating: number;
  ratings : Rating[];
  brand: string;
  warranty: number;
  images: string[];
  price: Price;
  category: Category;
}

export interface ProductsResponse{
    total:number;
    limit: number;
    page: number;
    skip: number;
    products: Product[]
}

