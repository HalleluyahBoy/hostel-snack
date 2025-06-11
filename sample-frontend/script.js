// API Configuration
const API_BASE_URL = "http://127.0.0.1:8001/api";

// Global state
let allProducts = [];
let allCategories = [];

// DOM Elements (will be initialized in init function)
let loadingElement;
let errorElement;
let productsGrid;
let noProductsElement;
let categoriesContainer;
let searchInput;

// Utility Functions
function showElement(element) {
  if (element) element.classList.remove("hidden");
}

function hideElement(element) {
  if (element) element.classList.add("hidden");
}

function showLoading() {
  showElement(loadingElement);
  hideElement(errorElement);
  hideElement(productsGrid);
  hideElement(noProductsElement);
}

function showError() {
  hideElement(loadingElement);
  showElement(errorElement);
  hideElement(productsGrid);
  hideElement(noProductsElement);
}

function showProducts() {
  hideElement(loadingElement);
  hideElement(errorElement);
  showElement(productsGrid);
  hideElement(noProductsElement);
}

// API Functions
async function fetchProducts() {
  try {
    console.log("Fetching products from:", `${API_BASE_URL}/products/`);
    const response = await fetch(`${API_BASE_URL}/products/`);
    console.log("Products response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Products data received:", data);
    // Extract the results array from the paginated response
    return data.results || data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

async function fetchCategories() {
  try {
    console.log("Fetching categories from:", `${API_BASE_URL}/categories/`);
    const response = await fetch(`${API_BASE_URL}/categories/`);
    console.log("Categories response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Categories data received:", data);
    // Extract the results array from the paginated response
    return data.results || data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Product Card Creation
function createProductCard(product) {
  const productCard = document.createElement("div");
  productCard.className =
    "product-card rounded-xl overflow-hidden group bg-white border border-gray-200";

  // Handle image fallback
  const imageUrl =
    product.image || "https://via.placeholder.com/400x400?text=Snack+Image";

  productCard.innerHTML = `
        <div class="aspect-square relative overflow-hidden bg-gray-50">
            <img
                src="${imageUrl}"
                class="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                alt="${product.name}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/400x400?text=Snack+Image'"
            />
            <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                <span class="font-semibold">₹${parseFloat(
                  product.price
                ).toFixed(2)}</span>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-gray-900 line-clamp-1">${
              product.name
            }</h3>
            <p class="text-sm text-gray-500 mt-1 line-clamp-1">${
              product.description || "Delicious snack"
            }</p>
            <button 
                class="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                onclick="addToCart(${product.id})"
            >
                Add to Cart
            </button>
        </div>
    `;

  return productCard;
}

// Category Button Creation
function createCategoryButton(category, isActive = false) {
  const button = document.createElement("button");
  button.className = `category-pill flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 whitespace-nowrap ${
    isActive ? "bg-blue-50 border-blue-300 text-blue-700" : ""
  }`;

  if (category === null) {
    button.innerHTML = `<span>All Snacks</span>`;
  } else {
    button.innerHTML = `<span>${category.name}</span>`;
  }

  return button;
}

// Rendering Functions
function renderProducts(products) {
  console.log("Rendering", products.length, "products");
  if (!productsGrid) return;

  productsGrid.innerHTML = "";

  if (products.length === 0) {
    showElement(noProductsElement);
    return;
  }

  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });

  showProducts();
}

function renderCategories() {
  if (!categoriesContainer) return;

  categoriesContainer.innerHTML = "";

  // Add "All Snacks" button
  const allButton = createCategoryButton(null, true);
  categoriesContainer.appendChild(allButton);

  // Add category buttons
  allCategories.forEach((category) => {
    const button = createCategoryButton(category, false);
    categoriesContainer.appendChild(button);
  });
}

// Cart Functions (placeholder)
function addToCart(productId) {
  console.log(`Adding product ${productId} to cart`);
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    alert(`Added "${product.name}" to cart!`);
  }
}

// Initialization
async function init() {
  try {
    console.log("Starting app initialization...");

    // Initialize DOM elements
    loadingElement = document.getElementById("loading");
    errorElement = document.getElementById("error");
    productsGrid = document.getElementById("products-grid");
    noProductsElement = document.getElementById("no-products");
    categoriesContainer = document.getElementById("categories-container");
    searchInput = document.getElementById("search-input");

    // Check if all DOM elements exist
    console.log("DOM Elements found:", {
      loading: !!loadingElement,
      error: !!errorElement,
      productsGrid: !!productsGrid,
      noProducts: !!noProductsElement,
      categories: !!categoriesContainer,
      search: !!searchInput,
    });

    showLoading();

    console.log("Fetching data from API...");
    // Fetch data in parallel
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);

    console.log("Products data:", productsData);
    console.log("Categories data:", categoriesData);

    allProducts = productsData;
    allCategories = categoriesData;

    console.log("Rendering UI...");
    // Render UI
    renderCategories();
    renderProducts(allProducts);

    console.log("App initialization complete!");
  } catch (error) {
    console.error("Error initializing app:", error);
    showError();
  }
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
