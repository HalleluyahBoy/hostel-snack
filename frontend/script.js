// API Configuration
const API_BASE_URL = "http://127.0.0.1:8001/api";

// Global state
let allProducts = [];
let allCategories = [];
let filteredProducts = [];
let currentCategory = null;
let searchQuery = "";

// DOM Elements
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const productsGrid = document.getElementById("products-grid");
const noProductsElement = document.getElementById("no-products");
const categoriesContainer = document.getElementById("categories-container");
const searchInput = document.getElementById("search-input");

// Utility Functions
function showElement(element) {
  element.classList.remove("hidden");
}

function hideElement(element) {
  element.classList.add("hidden");
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

function showNoProducts() {
  hideElement(loadingElement);
  hideElement(errorElement);
  hideElement(productsGrid);
  showElement(noProductsElement);
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
    return data;
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
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Product Card Creation
function createProductCard(product) {
  const productCard = document.createElement("div");
  productCard.className = "product-card rounded-xl overflow-hidden group";

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
            <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div class="p-4">
            <h3 class="font-semibold text-gray-900 line-clamp-1">${
              product.name
            }</h3>
            <p class="text-sm text-gray-500 mt-1 line-clamp-1">${
              product.description || "Delicious snack"
            }</p>
            <button 
                class="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition group-hover:bg-blue-700"
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
  button.onclick = () => filterByCategory(category);

  if (category === null) {
    button.innerHTML = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                />
            </svg>
            <span>All Snacks</span>
        `;
  } else {
    button.innerHTML = `<span>${category.name}</span>`;
  }

  return button;
}

// Rendering Functions
function renderProducts(products) {
  productsGrid.innerHTML = "";

  if (products.length === 0) {
    showNoProducts();
    return;
  }

  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });

  showProducts();
}

function renderCategories() {
  categoriesContainer.innerHTML = "";

  // Add "All Snacks" button
  const allButton = createCategoryButton(null, currentCategory === null);
  categoriesContainer.appendChild(allButton);

  // Add category buttons
  allCategories.forEach((category) => {
    const button = createCategoryButton(
      category,
      currentCategory && currentCategory.id === category.id
    );
    categoriesContainer.appendChild(button);
  });
}

// Filtering Functions
function filterProducts() {
  let filtered = [...allProducts];

  // Filter by category
  if (currentCategory) {
    filtered = filtered.filter(
      (product) => product.category === currentCategory.id
    );
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query))
    );
  }

  filteredProducts = filtered;
  renderProducts(filteredProducts);
}

function filterByCategory(category) {
  currentCategory = category;
  renderCategories();
  filterProducts();
}

function searchProducts(query) {
  searchQuery = query;
  filterProducts();
}

// Cart Functions (placeholder)
function addToCart(productId) {
  // This is a placeholder function
  // In a real application, you would implement cart functionality
  console.log(`Adding product ${productId} to cart`);

  // Show a simple notification
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    alert(`Added "${product.name}" to cart!`);
  }
}

// Event Listeners
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener("input", (e) => {
    searchProducts(e.target.value);
  });

  // Debounce search for better performance
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchProducts(e.target.value);
    }, 300);
  });
}

// Initialization
async function init() {
  try {
    console.log("Starting app initialization...");
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
    filteredProducts = [...allProducts];

    console.log("Rendering UI...");
    // Render UI
    renderCategories();
    renderProducts(filteredProducts);

    // Setup event listeners
    setupEventListeners();
    console.log("App initialization complete!");
  } catch (error) {
    console.error("Error initializing app:", error);
    showError();
  }
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
