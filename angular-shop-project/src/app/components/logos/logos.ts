import { Component, inject, OnInit, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogosService } from '../../services/logos';

@Component({
  selector: 'app-logos',
  imports: [FormsModule, RouterModule],
  templateUrl: './logos.html',
  styleUrl: './logos.scss',
})
export class Logos implements OnInit {
  logosService = inject(LogosService);
  isOpen = signal(false);
  messages = signal<any[]>([]);
  isTyping = signal(false);
  inputText = '';
  showComparisonModal = signal(false);
  comparisonProducts = signal<{a: any, b: any} | null>(null);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(){
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 50);
    })
  }

  ngOnInit(){
    this.logosService.initLogos();
    this.addMessage({ role: 'ai', text: "Hi! I'm Logos, your AI shopping assistant 😊 How can I help?" });
  }

  toggleLogos(){ this.isOpen.update(v => !v); }

  addMessage(msg: any){
    this.messages.update(msgs => [...msgs, msg]);
  }

  async sendMessage(){
    const text = this.inputText.trim();
    if(!text || this.isTyping()) return;
    this.inputText = '';
    this.addMessage({ role: 'user', text });
    this.logosService.conversationHistory.update(h => [...h, { role: 'user', content: text }]);
    this.isTyping.set(true);
    try {
      const trimmed = this.logosService.trimHistory(this.logosService.conversationHistory());
      const response = await this.logosService.callClaude(trimmed);
      await this.handleResponse(response);
    } catch(e) {
      this.addMessage({ role: 'ai', text: "I'm having trouble connecting. Please try again." });
    } finally {
      this.isTyping.set(false);
    }
  }

  // ← quick reply from product card button!
  sendQuickReply(text: string){
    this.inputText = text;
    this.sendMessage();
  }

  async handleResponse(response: any){
    if(response.type === 'text'){
      this.addMessage({ role: 'ai', text: response.text });
      this.logosService.conversationHistory.update(h => [...h, { role: 'assistant', content: response.text }]);
      return;
    }

    if(response.type === 'search_products'){
      let products = await this.logosService.searchProducts(response.input.query, response.input);
      products = this.logosService.applyPriceFilter(products, response.input.price_min, response.input.price_max);
      products = this.logosService.applyStockFilter(products);
      products = this.logosService.applySort(products, 'rating', 'desc');
      await this.renderProductResponse(products, response.type, response.input);
      return;
    }

    if(response.type === 'get_products_by_category'){
      let products = await this.logosService.fetchByCategory(response.input.category_id, 40);
      products = this.logosService.applyPriceFilter(products, response.input.price_min, response.input.price_max);
      products = this.logosService.applyStockFilter(products);
      products = this.logosService.applySort(products, response.input.sort_by, response.input.sort_direction);
      await this.renderProductResponse(products, response.type, response.input);
      return;
    }

if(response.type === 'get_products_by_brand'){
  let products = await this.logosService.fetchByBrand(response.input.brand, 50);
  products = this.logosService.applyPriceFilter(products, response.input.price_min, response.input.price_max);
  products = this.logosService.applyStockFilter(products);
  products = this.logosService.applySort(products, response.input.sort_by, response.input.sort_direction);

  // filter by category_name if provided!
  if(response.input.category_name) {
    const keyword = response.input.category_name.toLowerCase();
    const filtered = products.filter((p: any) =>
      p.title.toLowerCase().includes(keyword) ||
      p.category?.name?.toLowerCase().includes(keyword)
    );
    if(filtered.length > 0) products = filtered;
  }

  await this.renderProductResponse(products, response.type, response.input);
  return;
}

if(response.type === 'compare_products'){
  const brands = this.logosService.storeBrands();
  const brandA = brands.find(b => response.input.query_a.toLowerCase().includes(b));
  const brandB = brands.find(b => response.input.query_b.toLowerCase().includes(b));

  const [rawA, rawB] = await Promise.all([
    brandA ? this.logosService.fetchByBrand(brandA, 50) : this.logosService.searchProducts(response.input.query_a),
    brandB ? this.logosService.fetchByBrand(brandB, 50) : this.logosService.searchProducts(response.input.query_b)
  ]);

  let filteredA = this.logosService.applyPriceFilter(rawA, response.input.price_min, response.input.price_max);
  let filteredB = this.logosService.applyPriceFilter(rawB, response.input.price_min, response.input.price_max);
  if(!filteredA.length && rawA.length) filteredA = rawA;
  if(!filteredB.length && rawB.length) filteredB = rawB;

  // ← check each query SEPARATELY!
  const getSortForQuery = (query: string) => {
    const q = query.toLowerCase();
    if(q.includes('most expensive') || q.includes('highest price')) return { by: 'price', dir: 'desc' };
    if(q.includes('cheapest') || q.includes('lowest price') || q.includes('most cheap')) return { by: 'price', dir: 'asc' };
    if(q.includes('best rated') || q.includes('highest rated')) return { by: 'rating', dir: 'desc' };
    return { by: 'rating', dir: 'desc' }; // default
  };

  // also check full conversation for context
  const lastMsg = this.logosService.conversationHistory()
    .slice(-2)
    .map((m: any) => typeof m.content === 'string' ? m.content : '')
    .join(' ')
    .toLowerCase();

  const sortA = getSortForQuery(response.input.query_a + ' ' + lastMsg.split('and')[0]);
  const sortB = getSortForQuery(response.input.query_b + ' ' + lastMsg.split('and')[1] || '');

  filteredA = this.logosService.applySort(filteredA, sortA.by, sortA.dir);
  filteredB = this.logosService.applySort(filteredB, sortB.by, sortB.dir);

  const bestA = filteredA[0] || null;
  const bestB = filteredB[0] || null;
  this.logosService.lastShownProducts.set([bestA, bestB].filter(Boolean));

  const summary = this.buildComparisonSummary(bestA, bestB, response.input.query_a, response.input.query_b);
  const followUp = await this.logosService.callClaudeWithToolResult(
    this.logosService.conversationHistory(), 'compare_products', response.input, summary
  );
  this.addMessage({ role: 'ai', text: followUp, comparison: { a: bestA, b: bestB } });
  this.logosService.conversationHistory.update(h => [...h, { role: 'assistant', content: followUp }]);
  return;
}
    if(response.type === 'add_to_cart'){
      const query = (response.input.product_title || '').toLowerCase().trim();
      const words = query.split(/\s+/).filter((w: string) => w.length > 0);
      const last = this.logosService.lastShownProducts();
      let match: any = null;
      if(last.length > 0 && words.length > 0){
        let bestScore = 0;
        last.forEach((p: any) => {
          const s = this.scoreProduct(words, p);
          if(s > bestScore){ bestScore = s; match = p; }
        });
        if(bestScore <= 0) match = null;
      }
      if(match){
        const result = await this.logosService.handleAddToCart(match._id, match.title);
        this.addMessage({ role: 'ai', text: result });
        this.logosService.conversationHistory.update(h => [...h, { role: 'assistant', content: result }]);
      } else {
        const products = await this.logosService.searchProducts(response.input.product_title || '');
        if(products.length > 0){
          let best = products[0]; let bestScore = -1;
          products.forEach((p: any) => {
            const s = this.scoreProduct(words, p);
            if(s > bestScore){ bestScore = s; best = p; }
          });
          const result = await this.logosService.handleAddToCart(best._id, best.title);
          this.addMessage({ role: 'ai', text: result });
          this.logosService.conversationHistory.update(h => [...h, { role: 'assistant', content: result }]);
        } else {
          this.addMessage({ role: 'ai', text: "I couldn't find that product. Could you be more specific?" });
        }
      }
    }
  }

async renderProductResponse(products: any[], toolName: string, toolInput: any){
  if(products.length > 0) this.logosService.lastShownProducts.set(products.slice(0, 6));

  // detect if user asked for single product
  const lastMessages = this.logosService.conversationHistory().slice(-2);
  const isSingleQuery = lastMessages.some((m: any) => {
    const text = (typeof m.content === 'string' ? m.content : '').toLowerCase();
    return text.includes('most expensive') ||
           text.includes('cheapest') ||
           text.includes('most cheap') ||
           text.includes('best rated') ||
           text.includes('highest rated') ||
           text.includes('lowest price') ||
           text.includes('highest price');
  });

  const displayProducts = isSingleQuery ? products.slice(0, 1) : products.slice(0, 6);

  const resultText = products.length > 0
    ? `Found ${products.length} products:\n` + products.slice(0, 8).map((p: any) =>
        `- ${p.title} | $${p.price?.current ?? 0} | Rating: ${(p.rating ?? 0).toFixed(1)}`
      ).join('\n')
    : 'No products found.';

  const followUp = await this.logosService.callClaudeWithToolResult(
    this.logosService.conversationHistory(), toolName, toolInput, resultText
  );

  this.addMessage({ 
    role: 'ai', 
    text: followUp, 
    products: displayProducts.length > 0 ? displayProducts : undefined 
  });
  this.logosService.conversationHistory.update(h => [...h, { role: 'assistant', content: followUp }]);
}

  scoreProduct(words: string[], product: any): number {
    const title = product.title?.toLowerCase() || '';
    const brand = product.brand?.toLowerCase() || '';
    let score = 0;
    words.forEach((w: string) => {
      if(!w) return;
      if(brand === w){ score += 5; return; }
      if(title.includes(w)) score += 2;
      else if(brand.includes(w)) score += 1;
      else score -= 1; // ← penalize wrong matches!
    });
    return score;
  }

  buildComparisonSummary(a: any, b: any, labelA: string, labelB: string): string {
    const fmt = (p: any) => !p ? 'No products available' :
      `${p.title} | $${p.price?.current ?? 'N/A'} | Rating: ${p.rating?.toFixed(1) ?? 'N/A'}/5`;
    return `${labelA}: ${fmt(a)}\n${labelB}: ${fmt(b)}\nGive a clear 1-2 sentence verdict.`;
  }

  onKeydown(e: KeyboardEvent){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); this.sendMessage(); }
  }

  scrollToBottom(){
    if(this.messagesContainer){
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  openComparison(a: any, b: any){
  this.comparisonProducts.set({a, b});
  this.showComparisonModal.set(true);
}


closeComparison(){
  this.showComparisonModal.set(false);
}
}