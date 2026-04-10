
const LOGOS_API_KEY   = ""; 
const LOGOS_STORE_URL = "https://api.everrest.educata.dev";


const MAX_HISTORY_TURNS = 10;



const logosBtn      = document.getElementById("logos-btn");
const logosDrawer   = document.getElementById("logos-drawer");
const logosClose    = document.getElementById("logos-close");
const logosOverlay  = document.getElementById("logos-overlay");
const logosMessages = document.getElementById("logos-messages");
const logosInput    = document.getElementById("logos-input");
const logosSend     = document.getElementById("logos-send");



let conversationHistory = [];
let STORE_CATEGORIES    = [];
let STORE_BRANDS        = [];
let lastShownProducts   = []; 



async function initLogos() {
  try {
    const [catRes, brandRes] = await Promise.all([
      fetch(LOGOS_STORE_URL + "/shop/products/categories"),
      fetch(LOGOS_STORE_URL + "/shop/products/brands")
    ]);
    STORE_CATEGORIES = catRes.ok   ? await catRes.json()   : [];
    STORE_BRANDS     = brandRes.ok ? await brandRes.json() : [];
  } catch (e) {
    console.warn("Logos: could not load store metadata");
  }
}

initLogos();



function trimHistory(history) {

  var maxEntries = MAX_HISTORY_TURNS * 2;
  if (history.length <= maxEntries) return history;
  return history.slice(history.length - maxEntries);
}



function buildSystemPrompt() {
  var categoryList = STORE_CATEGORIES.map(function(c) { return 'id="' + c.id + '" name="' + c.name + '"'; }).join(" | ");
  var brandList    = STORE_BRANDS.join(", ");

  return [
    "You are Logos - a sophisticated AI shopping assistant for Digital Store, a premium electronics e-commerce platform.",
    "",
    "STORE KNOWLEDGE:",
    "- Products: phones, laptops, smartwatches, tablets, accessories and all tech electronics",
    "- Available categories (use EXACT IDs): " + (categoryList || "laptops id=1, phones id=2"),
    "- Available brands (use EXACT names, lowercase): " + (brandList || "samsung, apple, asus, hp, dell"),
    "- Shipping: Free worldwide on all orders",
    "- Returns: 30-day return policy, no questions asked",
    "- Payments: Visa, Mastercard, Amex, PayPal, UnionPay, JCB, Diners Club, Discover",
    "- Warranty: 3 years on all products",
    "- Support: Available 24/7",
    "",
    "PRICE RANGES (apply automatically):",
    "- budget / cheap / affordable = price_max: 300",
    "- mid-range = price_min: 300, price_max: 800",
    "- premium / high-end / expensive / top = price_min: 800",
    "",
    "STRICT RULES:",
    "1. NEVER INVENT PRODUCTS. Always use a tool. Never make up names, prices, or specs.",
    "2. CATEGORY SEARCH - If user mentions a category (phones, laptops, smartwatches) use get_products_by_category with the EXACT id. Pass price_min/price_max if budget mentioned.",
    "3. BRAND SEARCH - If user mentions a brand use get_products_by_brand with exact lowercase name. Pass price_min/price_max if budget mentioned.",
    "4. KEYWORD SEARCH - Only use search_products when no specific category or brand is mentioned. EXCEPTION: if user asks for all premium/budget/cheap products with no category, call get_products_by_category for each main category (laptops id=1, phones id=2) separately, not search_products.",
    "5. PRICE + CATEGORY - phones under $500 means get_products_by_category with phones id AND price_max: 500.",
    "6. COMPARE - For any comparison call compare_products. Pass price_min/price_max if user mentions premium/budget. Always give a verdict even if only one brand has matching products.",
    "7. ADD TO CART - Immediately call add_to_cart whenever user says any of these: add to cart, buy, purchase, I want this, I want it, I will take it, I want to buy, get this, order this, add it, add samsung, add apple, add the first one, add this one. Use the product_title from the most recent results. Never ask for confirmation — just add it.",
    "8. RESPONSE LENGTH - Under 3 sentences. Let product cards speak.",
    "9. PERSONALITY - Elegant, expert. No filler phrases like Great question or Sure thing.",
    "10. STORE QUESTIONS - Answer from store knowledge. Do not search the API for shipping/returns/payments.",
    "11. LANGUAGE - Always respond in the same language the user writes in.",
    "12. PREMIUM EXAMPLE - premium Samsung laptop means get_products_by_brand brand=samsung price_min=800"
  ].join("\n");
}



const LOGOS_TOOLS = [
  {
    name: "search_products",
    description: "Search by keywords. Use ONLY when no specific category or brand is mentioned.",
    input_schema: {
      type: "object",
      properties: {
        query:          { type: "string" },
        price_min:      { type: "number" },
        price_max:      { type: "number" },
        sort_by:        { type: "string", enum: ["price", "rating"] },
        sort_direction: { type: "string", enum: ["asc", "desc"] }
      },
      required: ["query"]
    }
  },
  {
    name: "get_products_by_category",
    description: "Fetch products by category ID. Use whenever user mentions phones, laptops, smartwatches etc. Supports price filtering.",
    input_schema: {
      type: "object",
      properties: {
        category_id:    { type: "string" },
        category_name:  { type: "string" },
        price_min:      { type: "number" },
        price_max:      { type: "number" },
        sort_by:        { type: "string", enum: ["price", "rating"] },
        sort_direction: { type: "string", enum: ["asc", "desc"] }
      },
      required: ["category_id", "category_name"]
    }
  },
  {
    name: "get_products_by_brand",
    description: "Fetch products from a specific brand. Supports price filtering.",
    input_schema: {
      type: "object",
      properties: {
        brand:          { type: "string" },
        price_min:      { type: "number" },
        price_max:      { type: "number" },
        sort_by:        { type: "string", enum: ["price", "rating"] },
        sort_direction: { type: "string", enum: ["asc", "desc"] }
      },
      required: ["brand"]
    }
  },
  {
    name: "compare_products",
    description: "Compare two products or brands. Pass price_min/price_max if user mentioned premium/budget/price. Always give a verdict even if only one side has matching products.",
    input_schema: {
      type: "object",
      properties: {
        query_a:   { type: "string" },
        query_b:   { type: "string" },
        price_min: { type: "number" },
        price_max: { type: "number" }
      },
      required: ["query_a", "query_b"]
    }
  },
  {
    name: "add_to_cart",
    description: "Add a product to cart. Pass the exact product_title from the most recent search results shown to the user.",
    input_schema: {
      type: "object",
      properties: {
        product_title: { type: "string", description: "The exact product title shown in the last search results" }
      },
      required: ["product_title"]
    }
  }
];



logosBtn && logosBtn.addEventListener("click", function() {
  logosDrawer.classList.add("open");
  logosOverlay.classList.add("show");
  logosInput.focus();
});

logosClose   && logosClose.addEventListener("click", closeLogos);
logosOverlay && logosOverlay.addEventListener("click", closeLogos);

function closeLogos() {
  logosDrawer.classList.remove("open");
  logosOverlay.classList.remove("show");
}

logosInput && logosInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
logosSend && logosSend.addEventListener("click", sendMessage);



async function sendMessage() {
  var text = logosInput.value.trim();
  if (!text) return;

  logosInput.value    = "";
  logosInput.disabled = true;
  logosSend.disabled  = true;

  appendMessage("user", text);
  conversationHistory.push({ role: "user", content: text });


  conversationHistory = trimHistory(conversationHistory);

  var typingEl = showTyping();

  try {
    var response = await callClaude(conversationHistory);
    typingEl.remove();
    await handleResponse(response);
  } catch (error) {
    try { typingEl.remove(); } catch(e) {}
    appendMessage("ai", "I'm having trouble connecting right now. Please try again in a moment.");
    console.error("Logos error:", error);
  } finally {
    logosInput.disabled = false;
    logosSend.disabled  = false;
    logosInput.focus();
  }
}



function scoreProduct(words, product) {
  var title = product.title ? product.title.toLowerCase() : "";
  var brand = product.brand ? product.brand.toLowerCase() : "";
  var score = 0;
  words.forEach(function(w) {
    if (!w) return;
    if (brand === w)            { score += 5; return; } 
    if (title.indexOf(w) !== -1)  score += 2;           
    else if (brand.indexOf(w) !== -1) score += 1;       
  });
  return score;
}



async function handleResponse(response) {


  if (response.type === "text") {
    appendMessage("ai", response.text);
    conversationHistory.push({ role: "assistant", content: response.text });
    return;
  }


  if (response.type === "search_products") {
    var priceMin = response.input.price_min;
    var priceMax = response.input.price_max;
    var query    = (response.input.query || "").toLowerCase();

    
    var vagueTerms = ["premium", "budget", "cheap", "affordable", "expensive", "all products", "all items", "everything"];
    var isVague    = vagueTerms.some(function(t) { return query.indexOf(t) !== -1; }) && (priceMin || priceMax);

    var products;
    if (isVague && STORE_CATEGORIES.length > 0) {
      var allResults = await Promise.all(
        STORE_CATEGORIES.map(function(cat) { return fetchByCategory(cat.id, 50); })
      );
      products = allResults.reduce(function(acc, arr) { return acc.concat(arr); }, []);
    } else {
      products = await searchProducts(response.input.query, response.input);
    }

    products = applyPriceFilter(products, priceMin, priceMax);
    products = applyStockFilter(products);
    products = applySort(products, "rating", "desc");
    await renderProductResponse(products, "search_products", response.input);
    return;
  }

  
  if (response.type === "get_products_by_category") {
    var products = await fetchByCategory(response.input.category_id, 40);
    products = applyPriceFilter(products, response.input.price_min, response.input.price_max);
    products = applyStockFilter(products);
    products = applySort(products, response.input.sort_by, response.input.sort_direction);
    await renderProductResponse(products, "get_products_by_category", response.input);
    return;
  }

  
  if (response.type === "get_products_by_brand") {
    var products = await fetchByBrand(response.input.brand, 50);
    products = applyPriceFilter(products, response.input.price_min, response.input.price_max);
    products = applyStockFilter(products);
    products = applySort(products, response.input.sort_by, response.input.sort_direction);
    await renderProductResponse(products, "get_products_by_brand", response.input);
    return;
  }

  
  if (response.type === "compare_products") {
    var priceMin = response.input.price_min;
    var priceMax = response.input.price_max;

    var compTyping = showTyping(); 

    var brandA = STORE_BRANDS.find(function(b) { return response.input.query_a.toLowerCase().indexOf(b) !== -1; });
    var brandB = STORE_BRANDS.find(function(b) { return response.input.query_b.toLowerCase().indexOf(b) !== -1; });

    var results = await Promise.all([
      brandA ? fetchByBrand(brandA, 50) : searchProducts(response.input.query_a, {}),
      brandB ? fetchByBrand(brandB, 50) : searchProducts(response.input.query_b, {})
    ]);

    compTyping.remove();

    var rawA = results[0];
    var rawB = results[1];

    var filteredA = applyPriceFilter(rawA, priceMin, priceMax);
    var filteredB = applyPriceFilter(rawB, priceMin, priceMax);

    if (filteredA.length === 0 && rawA.length > 0) filteredA = rawA;
    if (filteredB.length === 0 && rawB.length > 0) filteredB = rawB;

    filteredA = applySort(filteredA, "rating", "desc");
    filteredB = applySort(filteredB, "rating", "desc");

    var bestA = filteredA[0] || null;
    var bestB = filteredB[0] || null;

    lastShownProducts = [bestA, bestB].filter(Boolean);

    var summary  = buildComparisonSummary(bestA, bestB, response.input.query_a, response.input.query_b);
    var followUp = await callClaudeWithToolResult(conversationHistory, "compare_products", response.input, summary);
    appendMessage("ai", followUp);
    if (bestA || bestB) appendComparisonCards(bestA, bestB);
    conversationHistory.push({ role: "assistant", content: followUp });
    return;
  }

  
  if (response.type === "add_to_cart") {
    var query = (response.input.product_title || "").toLowerCase().trim();
    var words  = query.split(/\s+/).filter(function(w) { return w.length > 0; });

   
    var match = null;
    if (lastShownProducts.length > 0 && words.length > 0) {
      var bestScore = 0;
      lastShownProducts.forEach(function(p) {
        var s = scoreProduct(words, p);
        if (s > bestScore) { bestScore = s; match = p; }
      });
      if (bestScore === 0) match = null;
    }

    if (match) {
      console.log("Logos cart: memory match ->", match.title, "| stock:", match.stock);
      if (match.stock !== undefined && match.stock !== null && match.stock <= 0) {
        appendMessage("ai", "<strong>" + match.title + "</strong> is currently out of stock.");
        conversationHistory.push({ role: "assistant", content: match.title + " is out of stock." });
      } else {
        await handleAddToCart(match._id, match.title);
      }
    } else {
      
      var typingEl2 = showTyping();
      var products  = await searchProducts(response.input.product_title || "");
      typingEl2.remove();

      if (products.length > 0) {
        var bestApiScore = -1;
        var found = products[0];
        products.forEach(function(p) {
          var s = scoreProduct(words, p);
          if (s > bestApiScore) { bestApiScore = s; found = p; }
        });
        console.log("Logos cart: API match ->", found.title, "| stock:", found.stock);
        if (found.stock !== undefined && found.stock !== null && found.stock <= 0) {
          appendMessage("ai", "<strong>" + found.title + "</strong> is currently out of stock.");
          conversationHistory.push({ role: "assistant", content: found.title + " is out of stock." });
        } else {
          await handleAddToCart(found._id, found.title);
        }
      } else {
        appendMessage("ai", "I couldn't find that product in our store. Could you be more specific?");
        conversationHistory.push({ role: "assistant", content: "Product not found for cart." });
      }
    }
  }
}



async function renderProductResponse(products, toolName, toolInput) {
  if (products.length > 0) lastShownProducts = products.slice(0, 6);

  
  var resultText = products.length > 0
    ? "Found " + products.length + " matching products:\n" + products.slice(0, 8).map(function(p) {
        var price  = (p.price && p.price.current  != null) ? p.price.current  : 0;
        var rating = (p.rating != null)                    ? p.rating          : 0;
        var stock  = (p.stock  == null || p.stock  > 0)    ? "In Stock"        : "Out of Stock";
        return "- " + p.title + " | $" + price + " | Rating: " + rating.toFixed(1) + " | " + stock;
      }).join("\n")
    : "No products found matching those filters.";

  var followUp = await callClaudeWithToolResult(conversationHistory, toolName, toolInput, resultText);
  appendMessage("ai", followUp);
  if (products.length > 0) appendProductCards(products.slice(0, 6));
  conversationHistory.push({
    role: "assistant",
    content: followUp + (products.length > 0 ? " [Showed " + Math.min(products.length, 6) + " products]" : "")
  });
}



function applyPriceFilter(products, priceMin, priceMax) {
  return products.filter(function(p) {
    var price = (p.price && p.price.current != null) ? p.price.current : 0;
    if (priceMin != null && price < priceMin) return false;
    if (priceMax != null && price > priceMax) return false;
    return true;
  });
}

function applySort(products, sortBy, sortDirection) {
  if (!sortBy) return products;
  return products.slice().sort(function(a, b) {
    var valA = sortBy === "price" ? ((a.price && a.price.current != null) ? a.price.current : 0) : (a.rating || 0);
    var valB = sortBy === "price" ? ((b.price && b.price.current != null) ? b.price.current : 0) : (b.rating || 0);
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });
}


function applyStockFilter(products) {
  var inStock = products.filter(function(p) {
    return p.stock == null || p.stock > 0;
  });
  return inStock.length > 0 ? inStock : products;
}



async function handleAddToCart(productId, productTitle) {
  var token = (typeof getToken === "function") ? getToken() : localStorage.getItem("accessToken");

  if (!token) {
    appendMessage("ai", "You need to be signed in to add items to your cart. Please log in first.");
    conversationHistory.push({ role: "assistant", content: "User not logged in." });
    return;
  }

  try {
    var postRes = await fetch(LOGOS_STORE_URL + "/shop/cart/product", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ id: productId, quantity: 1 })
    });

    var postBody = null;
    try { postBody = await postRes.json(); } catch(e) {}
    console.log("Logos cart: POST", postRes.status, postBody);

    if (postRes.ok) {
      appendMessage("ai", "<strong>" + productTitle + "</strong> has been added to your cart. \u2713");
      if (typeof loadCart === "function") loadCart();
      conversationHistory.push({ role: "assistant", content: "Added " + productTitle + " to cart." });
      return;
    }

    if (postRes.status === 400) {
      var errText = (postBody && postBody.error) ? postBody.error.toLowerCase() : "";

     
      if (errText.indexOf("expired") !== -1) {
        appendMessage("ai", "Your session has expired. Please log out and log back in, then try again.");
        conversationHistory.push({ role: "assistant", content: "Token expired." });
        return;
      }

      
      if (errText.indexOf("stock") !== -1) {
        appendMessage("ai", "<strong>" + productTitle + "</strong> is currently out of stock.");
        conversationHistory.push({ role: "assistant", content: productTitle + " is out of stock." });
        return;
      }

      
      var cartRes  = await fetch(LOGOS_STORE_URL + "/shop/cart?_=" + Date.now(), {
        headers: { "Authorization": "Bearer " + token }
      });
      var cartData = cartRes.ok ? await cartRes.json() : null;
      var existing = cartData && cartData.products
        ? cartData.products.find(function(p) { return p.productId === productId; })
        : null;
      var newQty = existing ? existing.quantity + 1 : 1;

      var patchRes = await fetch(LOGOS_STORE_URL + "/shop/cart/product", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ id: productId, quantity: newQty })
      });

      var patchBody = null;
      try { patchBody = await patchRes.json(); } catch(e) {}
      console.log("Logos cart: PATCH", patchRes.status, patchBody);

      if (patchRes.ok) {
        appendMessage("ai", "<strong>" + productTitle + "</strong> has been added to your cart. \u2713");
        if (typeof loadCart === "function") loadCart();
        conversationHistory.push({ role: "assistant", content: "Added " + productTitle + " to cart." });
        return;
      }

      var patchErr = (patchBody && patchBody.error) ? patchBody.error : ("status " + patchRes.status);
      if (patchErr.toLowerCase().indexOf("stock") !== -1) {
        appendMessage("ai", "<strong>" + productTitle + "</strong> is currently out of stock.");
      } else if (patchErr.toLowerCase().indexOf("expired") !== -1) {
        appendMessage("ai", "Your session has expired. Please log out and log back in, then try again.");
      } else {
        appendMessage("ai", "Couldn't add to cart: " + patchErr);
      }
      conversationHistory.push({ role: "assistant", content: "Cart failed: " + patchErr });
      return;
    }

    
    var otherErr = (postBody && postBody.error) ? postBody.error : ("status " + postRes.status);
    appendMessage("ai", "Couldn't add to cart: " + otherErr);
    conversationHistory.push({ role: "assistant", content: "Cart failed: " + otherErr });

  } catch(e) {
    console.error("Logos cart exception:", e);
    appendMessage("ai", "Something went wrong while adding to cart.");
  }
}



async function callClaude(history) {
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LOGOS_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: buildSystemPrompt(),
      tools: LOGOS_TOOLS,
      messages: history
    })
  });

  if (!res.ok) {
    var err = await res.json();
    throw new Error((err.error && err.error.message) ? err.error.message : "API error");
  }

  var data     = await res.json();
  var toolUse  = data.content.find(function(b) { return b.type === "tool_use"; });
  if (toolUse) return { type: toolUse.name, input: toolUse.input };

  var textBlock = data.content.find(function(b) { return b.type === "text"; });
  return { type: "text", text: (textBlock && textBlock.text) ? textBlock.text : "I couldn't generate a response." };
}



async function callClaudeWithToolResult(history, toolName, toolInput, resultContent) {
  var messages = trimHistory(history).concat([
    {
      role: "assistant",
      content: [{ type: "tool_use", id: "tool_1", name: toolName, input: toolInput }]
    },
    {
      role: "user",
      content: [{ type: "tool_result", tool_use_id: "tool_1", content: resultContent }]
    }
  ]);

  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LOGOS_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: buildSystemPrompt(),
      tools: LOGOS_TOOLS,
      messages: messages
    })
  });

  var data = await res.json();
  var textBlock = data.content ? data.content.find(function(b) { return b.type === "text"; }) : null;
  return (textBlock && textBlock.text) ? textBlock.text : "Here are the results.";
}



async function searchProducts(query, filters) {
  filters = filters || {};
  try {
    var params = new URLSearchParams({ keywords: query, page_size: 20 });
    if (filters.sort_by)        params.set("sort_by", filters.sort_by);
    if (filters.sort_direction) params.set("sort_direction", filters.sort_direction);
    var res  = await fetch(LOGOS_STORE_URL + "/shop/products/search?" + params.toString());
    var data = await res.json();
    return data.products || [];
  } catch(e) { return []; }
}

async function fetchByCategory(categoryId, pageSize) {
  pageSize = pageSize || 40;
  try {
    var res  = await fetch(LOGOS_STORE_URL + "/shop/products/category/" + categoryId + "?page_size=" + pageSize);
    var data = await res.json();
    return data.products || [];
  } catch(e) { return []; }
}

async function fetchByBrand(brand, pageSize) {
  pageSize = pageSize || 50;
  try {
    var res  = await fetch(LOGOS_STORE_URL + "/shop/products/brand/" + brand + "?page_size=" + pageSize);
    var data = await res.json();
    return data.products || [];
  } catch(e) { return []; }
}


function buildComparisonSummary(a, b, labelA, labelB) {
  function fmt(p) {
    if (!p) return "No products available from this brand in our store";
    var price  = (p.price  && p.price.current  != null) ? p.price.current  : "N/A";
    var rating = (p.rating != null)                      ? p.rating.toFixed(1) : "N/A";
    var stock  = (p.stock  == null || p.stock   > 0)     ? "In Stock"          : "Out of Stock";
    return p.title + " | Price: $" + price + " | Rating: " + rating + "/5 | Brand: " + p.brand + " | Stock: " + stock;
  }
  return "Comparison:\n" + labelA + ": " + fmt(a) + "\n" + labelB + ": " + fmt(b) + "\nGive a clear 1-2 sentence verdict. If one brand has no products, say so and recommend the available one.";
}



function appendMessage(role, text) {
  var div = document.createElement("div");
  div.className = "logos-message logos-message--" + (role === "ai" ? "ai" : "user");
  div.innerHTML = "<div class=\"logos-message__bubble\">" + formatText(text) + "</div>";
  logosMessages.appendChild(div);
  scrollToBottom();
}



function appendProductCards(products) {
  var wrapper = document.createElement("div");
  wrapper.className = "logos-message logos-message--ai";
  wrapper.style.maxWidth = "100%";

  var inner = document.createElement("div");
  inner.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";

  products.forEach(function(product) {
    var card  = document.createElement("a");
    card.href = "./inside-product.html?id=" + product._id;
    card.className = "logos-product-card";
    var img   = (product.images && product.images[0]) ? product.images[0] : (product.thumbnail || "");
    var price = (product.price && product.price.current != null) ? product.price.current.toLocaleString() : "N/A";
    card.innerHTML =
      "<img src=\"" + img + "\" referrerpolicy=\"no-referrer\" alt=\"" + product.title + "\">" +
      "<div class=\"logos-product-card__info\">" +
        "<div class=\"logos-product-card__title\">" + product.title + "</div>" +
        "<div class=\"logos-product-card__price\">$" + price + "</div>" +
      "</div>";
    inner.appendChild(card);
  });

  wrapper.appendChild(inner);
  logosMessages.appendChild(wrapper);
  scrollToBottom();
}



function appendComparisonCards(productA, productB) {
  var wrapper = document.createElement("div");
  wrapper.className = "logos-message logos-message--ai";
  wrapper.style.maxWidth = "100%";

  var grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%";

  [productA, productB].forEach(function(product) {
    if (!product) return;
    var card  = document.createElement("a");
    card.href = "./inside-product.html?id=" + product._id;
    card.className = "logos-product-card";
    card.style.cssText = "flex-direction:column;align-items:center;text-align:center;padding:12px 8px";
    var img    = (product.images && product.images[0]) ? product.images[0] : (product.thumbnail || "");
    var price  = (product.price  && product.price.current  != null) ? product.price.current.toLocaleString() : "N/A";
    var rating = (product.rating != null) ? product.rating.toFixed(1) : "N/A";
    card.innerHTML =
      "<img src=\"" + img + "\" referrerpolicy=\"no-referrer\" alt=\"" + product.title + "\" style=\"width:56px;height:56px;margin-bottom:8px\">" +
      "<div class=\"logos-product-card__info\">" +
        "<div class=\"logos-product-card__title\" style=\"white-space:normal;font-size:12px;line-height:1.4\">" + product.title + "</div>" +
        "<div class=\"logos-product-card__price\" style=\"margin-top:4px\">$" + price + "</div>" +
        "<div style=\"color:rgba(255,255,255,0.4);font-size:11px;margin-top:3px\">\u2605 " + rating + "</div>" +
      "</div>";
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  logosMessages.appendChild(wrapper);
  scrollToBottom();
}



function showTyping() {
  var div = document.createElement("div");
  div.className = "logos-message logos-message--ai";
  div.innerHTML = "<div class=\"logos-typing\"><span></span><span></span><span></span></div>";
  logosMessages.appendChild(div);
  scrollToBottom();
  return div;
}

function scrollToBottom() {
  logosMessages.scrollTop = logosMessages.scrollHeight;
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}