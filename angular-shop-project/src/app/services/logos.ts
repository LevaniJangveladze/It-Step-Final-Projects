import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CartService } from './cart';
import { firstValueFrom, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogosService {
  conversationHistory = signal<any[]>([]);
  lastShownProducts = signal<any[]>([]);
  storeCategories = signal<any[]>([]);
  storeBrands = signal<string[]>([]);

  http = inject(HttpClient);
  cartService = inject(CartService);

  private baseUrl = 'https://api.everrest.educata.dev';

  private apiKey = 'YOUR_API_KEY_HERE';  

  private maxHistoryTurns = 10;

  trimHistory(history: any[]): any[] {
    const max = this.maxHistoryTurns * 2;
    if (history.length <= max) return history;
    return history.slice(history.length - max);
  }

  async initLogos(){
   try{
     const [cats, brands] = await Promise.all([
      firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/shop/products/categories`)),
      firstValueFrom(this.http.get<string[]>(`${this.baseUrl}/shop/products/brands`))
    ])
     this.storeCategories.set(cats || []);
    this.storeBrands.set(brands || []);
   } catch(e) {
    console.warn('Logos: could not load store metadata')
   }
  }

buildSystemPrompt(): string {
  const categoryList = this.storeCategories().map(c => `id="${c.id}" name="${c.name}"`).join(' | ');
  const brandList = this.storeBrands().join(', ');

  return `
You are Logos - a sophisticated AI shopping assistant for Digital Store, a premium electronics e-commerce platform.

STORE KNOWLEDGE:
- Products: phones, laptops, smartwatches, tablets, accessories and all tech electronics
- Available categories (use EXACT IDs): ${categoryList || 'laptops id=1, phones id=2'}
- Available brands (use EXACT names, lowercase): ${brandList || 'samsung, apple, asus, hp, dell'}
- Shipping: Free worldwide on all orders
- Returns: 30-day return policy, no questions asked
- Payments: Visa, Mastercard, Amex, PayPal, UnionPay, JCB, Diners Club, Discover
- Warranty: 3 years on all products
- Support: Available 24/7

PRICE RANGES (apply automatically):
- budget / cheap / affordable = price_max: 300
- mid-range = price_min: 300, price_max: 800
- premium / high-end / expensive / top = price_min: 800

STRICT RULES:
1. NEVER INVENT PRODUCTS. Always use a tool.
2. CATEGORY SEARCH - use get_products_by_category with EXACT id.
3. BRAND SEARCH - use get_products_by_brand with exact lowercase name.
4. KEYWORD SEARCH - only use search_products when no category/brand mentioned.
5. PRICE + CATEGORY - phones under $500 means get_products_by_category with price_max: 500.
6. COMPARE - call compare_products. Always give a verdict.
7. ADD TO CART - immediately call add_to_cart when user says: add, buy, purchase, I want this, get this, order this.
8. RESPONSE LENGTH - under 3 sentences. Let product cards speak.
9. PERSONALITY - Elegant, expert. No filler phrases.
10. STORE QUESTIONS - answer from store knowledge, don't call API.
11. LANGUAGE - always respond in same language as user.
12. PREMIUM EXAMPLE - premium Samsung laptop = get_products_by_brand brand=samsung price_min=800
  `;
}

getTools(): any[] {
  return [
    {
     name: "search_products",
     description: "Search by keywords. Use ONLY when no specific category or brand is mentioned.",
     input_schema: {
      type: "object",
      properties: {
        query: {type: "string"},
        price_min: {type: "number"},
        price_max: {type: "number"},
        sort_by: {type: "string", enum: ["price", "rating"]},
        sort_direction: { type: "string", enum: ["asc", "desc"] }

      },
      required: ["query"]
     } 
    },
    {
  name: "get_products_by_category",
  description: "Fetch products by category ID when user mentions phones, laptops etc.",
  input_schema: {
    type: "object",
    properties: {
      category_id: { type: "string" },
      category_name: { type: "string" },
      price_min: { type: "number" },
      price_max: { type: "number" },
      sort_by: { type: "string", enum: ["price", "rating"] },
      sort_direction: { type: "string", enum: ["asc", "desc"] }
    },
    required: ["category_id", "category_name"]
  }
},
{
  name: "get_products_by_brand",
  description: "Fetch products from a specific brand. Pass category_name to filter by product type (e.g. 'iphone', 'macbook', 'laptop').",
  input_schema: {
    type: "object",
    properties: {
      brand: { type: "string" },
      category_name: { type: "string" }, 
      price_min: { type: "number" },
      price_max: { type: "number" },
      sort_by: { type: "string", enum: ["price", "rating"] },
      sort_direction: { type: "string", enum: ["asc", "desc"] }
    },
    required: ["brand"]
  }
},
{
  name: "compare_products",
  description: "Compare two products or brands. Always give a verdict.",
  input_schema: {
    type: "object",
    properties: {
      query_a: { type: "string" },
      query_b: { type: "string" },
      price_min: { type: "number" },
      price_max: { type: "number" }
    },
    required: ["query_a", "query_b"]
  }
},
{
  name: "add_to_cart",
  description: "Add a product to cart immediately when user says add, buy, I want this.",
  input_schema: {
    type: "object",
    properties: {
      product_title: { type: "string" }
    },
    required: ["product_title"]
  }
}
  ]
}

async callClaude(history: any[]): Promise<any>{
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: this.buildSystemPrompt(),
      tools: this.getTools(),
      messages: history
    })
  })
  if (!res.ok) throw new Error('Claude API error');
  const data = await res.json();

  const toolUse = data.content.find((b: any) => b.type === 'tool_use');
  if(toolUse) return {type: toolUse.name, input: toolUse.input};

  const textBlock = data.content.find((b: any) => b.type === 'text');
  return { type: 'text', text: textBlock?.text || "I couldn't respond." };
}

 async callClaudeWithToolResult(
  history: any[],       
  toolName: string,      
  toolInput: any,        
  resultContent: string  
): Promise<string> {
const messages = this.trimHistory(history).concat([
  {
    role: "assistant",
    content: [{
      type: "tool_use",
      id: "tool_1",        // ← unique id
      name: toolName,      // ← which tool was used
      input: toolInput     // ← what we sent to tool
    }]
  },
  {
    role: "user",
    content: [{
      type: "tool_result",
      tool_use_id: "tool_1",    // ← matches id above!
      content: resultContent     // ← actual results from API
    }]
  }
])

const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': this.apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: this.buildSystemPrompt(),
    tools: this.getTools(),
    messages 
  })
})

const data = await res.json();
const textBlock = data.content?.find((b: any) => b.type === 'text');
return textBlock?.text || 'Here are the results.';
}

async searchProducts(query: string, filters: any = {}): Promise<any[]> {
  try {
    const params = new URLSearchParams({ 
      keywords: query, 
      page_size: '20' 
    });
    if(filters.sort_by) params.set('sort_by', filters.sort_by);
    if(filters.sort_direction) params.set('sort_direction', filters.sort_direction);

    const res = await fetch(`${this.baseUrl}/shop/products/search?${params}`);
    const data = await res.json();
    return data.products || [];
  } catch(e) { return []; }
}

async fetchByCategory(categoryId: string, pageSize = 40): Promise<any[]> {
  try {
    const res = await fetch(
      `${this.baseUrl}/shop/products/category/${categoryId}?page_size=${pageSize}`
    );
    const data = await res.json();
    return data.products || [];
  } catch(e) { return []; }
}

async fetchByBrand(brand: string, pageSize = 50): Promise<any[]> {
  try {
    const res = await fetch(
      `${this.baseUrl}/shop/products/brand/${brand}?page_size=${pageSize}`
    );
    const data = await res.json();
    return data.products || [];
  } catch(e) { return []; }
}

 applyPriceFilter(products: any[], priceMin?: number, priceMax?: number): any[]{
 return products.filter(p => {
  const price = p.price?.current ?? 0;
  if(priceMin != null && price < priceMin) return false;
  if(priceMax != null && price > priceMax) return false;
  return true;
 })
}

applySort(products: any[], sortBy?: string, sortDirection?: string): any[] {
  if(!sortBy) return products; 
  return [...products].sort((a, b) => {
    const valA = sortBy === 'price' ? a.price?.current ?? 0 : a.rating ?? 0;
    const valB = sortBy === 'price' ? b.price?.current ?? 0 : b.rating ?? 0;
    return sortDirection === 'asc' ? valA - valB : valB - valA;
  })
}

applyStockFilter(products: any[]): any[] {
 const inStock = products.filter(p =>
  p.stock == null || p.stock > 0
 );
 return inStock.length > 0 ? inStock : products;
}

async handleAddToCart(productId: string, productTitle: string): Promise<string> {
  const token = localStorage.getItem('accessToken');
  if(!token) return 'You need to be signed in to add items to your cart!';

  try {
    const postRes = await fetch(`${this.baseUrl}/shop/cart/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: productId, quantity: 1 })
    });

    if(postRes.ok) {
      this.cartService.loadCart();
      return `<strong>${productTitle}</strong> added to cart ✓`;
    }

    if(postRes.status === 400) {
      const cartRes = await fetch(`${this.baseUrl}/shop/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cartData = cartRes.ok ? await cartRes.json() : null;
      const existing = cartData?.products?.find((p: any) => p.productId === productId);

      const patchRes = await fetch(`${this.baseUrl}/shop/cart/product`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: productId, quantity: existing ? existing.quantity + 1 : 1 })
      });

      if(patchRes.ok) {
        this.cartService.loadCart();
        return `<strong>${productTitle}</strong> added to cart ✓`;
      }
    }

    return 'Could not add to cart. Please try again.';
  } catch(e) {
    return 'Something went wrong while adding to cart.';
  }
}
}