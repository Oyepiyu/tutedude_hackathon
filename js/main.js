// FreshConnect - Enhanced JavaScript Functionality
// Author: AI Assistant
// Version: 1.0

class FreshConnectApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('freshConnectCart')) || [];
        this.favorites = JSON.parse(localStorage.getItem('freshConnectFavorites')) || [];
        this.notifications = [];
        this.currentUser = JSON.parse(sessionStorage.getItem('freshConnectUser')) || null;
        this.suppliers = [];
        this.orders = JSON.parse(localStorage.getItem('freshConnectOrders')) || [];
        
        this.init();
    }

    init() {
        this.loadSuppliers();
        this.setupEventListeners();
        this.setupNotifications();
        this.updateCartBadge();
        this.setupRealTimeSearch();
        this.setupLocationServices();
        this.initializeAnimations();
    }

    // Load suppliers data (simulated API call)
    loadSuppliers() {
        this.suppliers = [
            {
                id: 1,
                name: "Spice Masters",
                category: "spices",
                location: "Karol Bagh, Delhi",
                rating: 4.8,
                reviews: 256,
                deliveryTime: "1-2 hours",
                minOrder: 300,
                products: [
                    { name: "Red Chili Powder", price: 180, unit: "kg", stock: 50 },
                    { name: "Turmeric Powder", price: 200, unit: "kg", stock: 30 },
                    { name: "Garam Masala", price: 250, unit: "kg", stock: 25 }
                ],
                offers: ["Buy 3 Get 1 Free", "Bulk discounts available"]
            },
            {
                id: 2,
                name: "Pure Dairy Farm",
                category: "dairy",
                location: "Whitefield, Bangalore",
                rating: 4.6,
                reviews: 167,
                deliveryTime: "1-3 hours",
                minOrder: 400,
                products: [
                    { name: "Fresh Milk", price: 55, unit: "L", stock: 100 },
                    { name: "Paneer", price: 300, unit: "kg", stock: 20 },
                    { name: "Curd", price: 45, unit: "kg", stock: 40 }
                ],
                offers: ["Fresh daily delivery"]
            },
            {
                id: 3,
                name: "Fresh Valley Produce",
                category: "vegetables",
                location: "Andheri West, Mumbai",
                rating: 4.5,
                reviews: 128,
                deliveryTime: "2-4 hours",
                minOrder: 500,
                products: [
                    { name: "Tomatoes", price: 25, unit: "kg", stock: 200 },
                    { name: "Onions", price: 30, unit: "kg", stock: 150 },
                    { name: "Potatoes", price: 20, unit: "kg", stock: 300 }
                ],
                offers: ["10% off first order", "Free delivery above ₹1000"]
            }
        ];
    }

    // Enhanced search functionality
    setupRealTimeSearch() {
        const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"]');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleRealTimeSearch(e.target.value);
            });
        });
    }

    handleRealTimeSearch(query) {
        if (query.length < 2) {
            this.showAllSuppliers();
            return;
        }

        const filteredSuppliers = this.suppliers.filter(supplier => 
            supplier.name.toLowerCase().includes(query.toLowerCase()) ||
            supplier.category.toLowerCase().includes(query.toLowerCase()) ||
            supplier.location.toLowerCase().includes(query.toLowerCase()) ||
            supplier.products.some(product => 
                product.name.toLowerCase().includes(query.toLowerCase())
            )
        );

        this.displayFilteredSuppliers(filteredSuppliers);
        this.showSearchSuggestions(query);
    }

    showSearchSuggestions(query) {
        const suggestions = [];
        this.suppliers.forEach(supplier => {
            supplier.products.forEach(product => {
                if (product.name.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.push({
                        text: product.name,
                        supplier: supplier.name,
                        price: product.price
                    });
                }
            });
        });

        this.displaySearchSuggestions(suggestions.slice(0, 5));
    }

    displaySearchSuggestions(suggestions) {
        let suggestionBox = document.getElementById('searchSuggestions');
        if (!suggestionBox) {
            suggestionBox = document.createElement('div');
            suggestionBox.id = 'searchSuggestions';
            suggestionBox.className = 'absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto';
            
            const searchContainer = document.querySelector('.relative input[placeholder*="Search"]')?.parentElement;
            if (searchContainer) {
                searchContainer.appendChild(suggestionBox);
            }
        }

        if (suggestions.length === 0) {
            suggestionBox.style.display = 'none';
            return;
        }

        suggestionBox.innerHTML = suggestions.map(suggestion => `
            <div class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 onclick="app.selectSearchSuggestion('${suggestion.text}', '${suggestion.supplier}')">
                <div class="font-medium text-gray-800">${suggestion.text}</div>
                <div class="text-sm text-gray-500">${suggestion.supplier} - ₹${suggestion.price}</div>
            </div>
        `).join('');

        suggestionBox.style.display = 'block';
    }

    selectSearchSuggestion(productName, supplierName) {
        const searchInput = document.querySelector('.relative input[placeholder*="Search"]');
        if (searchInput) {
            searchInput.value = productName;
        }
        
        this.handleRealTimeSearch(productName);
        document.getElementById('searchSuggestions').style.display = 'none';
        
        this.showNotification(`Showing results for "${productName}" from ${supplierName}`, 'info');
    }

    // Shopping cart functionality
    addToCart(supplierId, productName, price, quantity = 1) {
        const existingItem = this.cart.find(item => 
            item.supplierId === supplierId && item.productName === productName
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const supplier = this.suppliers.find(s => s.id === supplierId);
            this.cart.push({
                id: Date.now(),
                supplierId,
                supplierName: supplier?.name || 'Unknown',
                productName,
                price,
                quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartBadge();
        this.showNotification(`${productName} added to cart!`, 'success');
        this.showCartPreview();
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartBadge();
        this.showNotification('Item removed from cart', 'info');
    }

    updateCartQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartBadge();
            }
        }
    }

    saveCart() {
        localStorage.setItem('freshConnectCart', JSON.stringify(this.cart));
    }

    updateCartBadge() {
        const cartBadges = document.querySelectorAll('.cart-badge');
        const itemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        
        cartBadges.forEach(badge => {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'block' : 'none';
        });

        // Update cart icon in header
        const cartIcon = document.querySelector('button svg[viewBox="0 0 24 24"] path[d*="M3 3h2l.4 2M7 13h10l4-8H5.4"]');
        if (cartIcon && itemCount > 0) {
            const cartButton = cartIcon.closest('button');
            if (!cartButton.querySelector('.cart-badge')) {
                const badge = document.createElement('span');
                badge.className = 'cart-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
                badge.textContent = itemCount;
                cartButton.classList.add('relative');
                cartButton.appendChild(badge);
            }
        }
    }

    showCartPreview() {
        const cartPreview = this.createCartPreview();
        document.body.appendChild(cartPreview);
        
        setTimeout(() => {
            cartPreview.classList.add('opacity-100', 'translate-y-0');
        }, 10);

        setTimeout(() => {
            cartPreview.classList.remove('opacity-100', 'translate-y-0');
            cartPreview.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => cartPreview.remove(), 300);
        }, 3000);
    }

    createCartPreview() {
        const preview = document.createElement('div');
        preview.className = 'fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 opacity-0 translate-y-4 transition-all duration-300 max-w-sm';
        
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        preview.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-gray-800">Cart Preview</h3>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="text-sm text-gray-600 mb-2">${totalItems} items • ₹${totalPrice}</div>
            <div class="space-y-2 max-h-32 overflow-y-auto">
                ${this.cart.slice(-3).map(item => `
                    <div class="flex justify-between items-center text-sm">
                        <span class="truncate">${item.productName}</span>
                        <span class="text-gray-600">${item.quantity}x ₹${item.price}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="app.showFullCart()" class="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                View Full Cart
            </button>
        `;

        return preview;
    }

    // Favorites functionality
    toggleFavorite(supplierId) {
        const index = this.favorites.indexOf(supplierId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showNotification('Removed from favorites', 'info');
        } else {
            this.favorites.push(supplierId);
            this.showNotification('Added to favorites!', 'success');
        }
        
        localStorage.setItem('freshConnectFavorites', JSON.stringify(this.favorites));
        this.updateFavoriteButtons();
    }

    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('[data-supplier-id]');
        favoriteButtons.forEach(button => {
            const supplierId = parseInt(button.dataset.supplierId);
            const isFavorite = this.favorites.includes(supplierId);
            
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = isFavorite ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
            }
        });
    }

    // Notification system
    setupNotifications() {
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        const id = Date.now();
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 transform translate-x-full transition-transform duration-300 max-w-sm`;
        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span class="flex-1">${message}</span>
            <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.getElementById('notificationContainer').appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Location services
    setupLocationServices() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateSupplierDistances();
                },
                (error) => {
                    console.log('Location access denied or unavailable');
                }
            );
        }
    }

    updateSupplierDistances() {
        // Simulate distance calculation (in a real app, you'd use Google Maps API)
        this.suppliers.forEach(supplier => {
            supplier.distance = Math.floor(Math.random() * 20) + 1; // Random distance 1-20 km
        });
        
        this.updateSupplierCards();
    }

    // Animation and UI enhancements
    initializeAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingStates();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);

        // Observe supplier cards and other elements
        document.querySelectorAll('.supplier-card, .testimonial-card, .feature-card').forEach(card => {
            observer.observe(card);
        });
    }

    setupHoverEffects() {
        // Add dynamic hover effects to supplier cards
        document.querySelectorAll('.supplier-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });
    }

    setupLoadingStates() {
        // Add loading states for buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.dataset.loading !== 'true') {
                    this.showButtonLoading(button);
                }
            });
        });
    }

    showButtonLoading(button) {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.dataset.loading = 'true';
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalText;
            button.dataset.loading = 'false';
            button.disabled = false;
        }, 2000);
    }

    // Order management
    createOrder(cartItems) {
        const order = {
            id: Date.now(),
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        };

        this.orders.push(order);
        localStorage.setItem('freshConnectOrders', JSON.stringify(this.orders));
        
        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartBadge();

        this.showNotification('Order placed successfully!', 'success');
        return order;
    }

    // Event listeners setup
    setupEventListeners() {
        // Close search suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const searchSuggestions = document.getElementById('searchSuggestions');
            const searchInput = document.querySelector('.relative input[placeholder*="Search"]');
            
            if (searchSuggestions && !searchInput?.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });

        // Handle form submissions with enhanced validation
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmission(e);
            });
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Search"]');
                if (searchInput) searchInput.focus();
            }
        });
    }

    handleFormSubmission(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        // Add loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            this.showButtonLoading(submitButton);
        }

        // Simulate form processing
        setTimeout(() => {
            this.showNotification('Form submitted successfully!', 'success');
        }, 2000);
    }

    // Utility methods
    formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    }

    formatDate(dateString) {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }

    // Public methods for HTML onclick handlers
    showFullCart() {
        this.showNotification('Full cart view coming soon!', 'info');
    }

    displayFilteredSuppliers(suppliers) {
        const supplierContainer = document.getElementById('supplierListings');
        if (!supplierContainer) return;

        if (suppliers.length === 0) {
            supplierContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No suppliers found</h3>
                    <p class="text-gray-500">Try adjusting your search terms or filters</p>
                </div>
            `;
            return;
        }

        // Update supplier count
        const countElement = document.getElementById('supplierCount');
        if (countElement) {
            countElement.textContent = suppliers.length;
        }

        // This would update the supplier cards display
        // Implementation depends on your existing supplier card structure
    }

    showAllSuppliers() {
        this.displayFilteredSuppliers(this.suppliers);
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FreshConnectApp();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .cart-badge {
            display: none;
        }
        
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreshConnectApp;
}