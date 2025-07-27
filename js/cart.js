// FreshConnect - Shopping Cart Management
// Enhanced cart functionality with checkout process

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('freshConnectCart')) || [];
        this.cartModal = null;
        this.checkoutModal = null;
        this.init();
    }

    init() {
        this.createCartModal();
        this.createCheckoutModal();
        this.updateCartDisplay();
        this.setupEventListeners();
    }

    // Add item to cart with enhanced functionality
    addItem(supplierId, productName, price, unit = 'kg', minQuantity = 1) {
        const existingItem = this.cart.find(item => 
            item.supplierId === supplierId && item.productName === productName
        );

        if (existingItem) {
            existingItem.quantity += minQuantity;
            this.showNotification(`Updated ${productName} quantity in cart`, 'success');
        } else {
            const newItem = {
                id: Date.now() + Math.random(),
                supplierId,
                productName,
                price,
                unit,
                quantity: minQuantity,
                addedAt: new Date().toISOString()
            };
            this.cart.push(newItem);
            this.showNotification(`${productName} added to cart!`, 'success');
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showQuickCartPreview();
    }

    // Remove item from cart
    removeItem(itemId) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            this.cart = this.cart.filter(item => item.id !== itemId);
            this.saveCart();
            this.updateCartDisplay();
            this.showNotification(`${item.productName} removed from cart`, 'info');
        }
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    // Clear entire cart
    clearCart() {
        if (this.cart.length === 0) {
            this.showNotification('Cart is already empty', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            this.showNotification('Cart cleared', 'info');
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('freshConnectCart', JSON.stringify(this.cart));
    }

    // Get cart totals
    getCartTotals() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 1000 ? 0 : 50; // Free delivery above ₹1000
        const tax = Math.round(subtotal * 0.05); // 5% tax
        const total = subtotal + deliveryFee + tax;

        return {
            subtotal,
            deliveryFee,
            tax,
            total,
            itemCount: this.cart.reduce((total, item) => total + item.quantity, 0)
        };
    }

    // Update cart display (badge, etc.)
    updateCartDisplay() {
        const totals = this.getCartTotals();
        
        // Update cart badges
        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(badge => {
            badge.textContent = totals.itemCount;
            badge.style.display = totals.itemCount > 0 ? 'flex' : 'none';
        });

        // Update cart icon in header if it doesn't have a badge
        const cartIcon = document.querySelector('button svg[viewBox="0 0 24 24"]');
        if (cartIcon && totals.itemCount > 0) {
            const cartButton = cartIcon.closest('button');
            if (!cartButton.querySelector('.cart-badge')) {
                const badge = document.createElement('span');
                badge.className = 'cart-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold';
                badge.textContent = totals.itemCount;
                cartButton.classList.add('relative');
                cartButton.appendChild(badge);
            }
        }

        // Update cart modal content if it's open
        if (this.cartModal && this.cartModal.style.display === 'flex') {
            this.updateCartModalContent();
        }
    }

    // Show quick cart preview
    showQuickCartPreview() {
        const existingPreview = document.getElementById('quickCartPreview');
        if (existingPreview) {
            existingPreview.remove();
        }

        const totals = this.getCartTotals();
        const preview = document.createElement('div');
        preview.id = 'quickCartPreview';
        preview.className = 'fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 opacity-0 translate-y-4 transition-all duration-300 max-w-sm';
        
        preview.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-gray-800 flex items-center">
                    <i class="fas fa-shopping-cart mr-2 text-blue-500"></i>
                    Cart Preview
                </h3>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="text-sm text-gray-600 mb-3">${totals.itemCount} items • ₹${totals.subtotal}</div>
            <div class="space-y-2 max-h-32 overflow-y-auto mb-3">
                ${this.cart.slice(-3).map(item => `
                    <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span class="truncate font-medium">${item.productName}</span>
                        <span class="text-gray-600 ml-2">${item.quantity}${item.unit} × ₹${item.price}</span>
                    </div>
                `).join('')}
                ${this.cart.length > 3 ? `<div class="text-xs text-gray-500 text-center">+${this.cart.length - 3} more items</div>` : ''}
            </div>
            <div class="flex space-x-2">
                <button onclick="cartManager.showCartModal()" class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                    View Cart
                </button>
                <button onclick="cartManager.startCheckout()" class="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                    Checkout
                </button>
            </div>
        `;

        document.body.appendChild(preview);

        // Animate in
        setTimeout(() => {
            preview.classList.add('opacity-100', 'translate-y-0');
        }, 10);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            if (preview.parentElement) {
                preview.classList.remove('opacity-100', 'translate-y-0');
                preview.classList.add('opacity-0', 'translate-y-4');
                setTimeout(() => preview.remove(), 300);
            }
        }, 4000);
    }

    // Create cart modal
    createCartModal() {
        this.cartModal = document.createElement('div');
        this.cartModal.id = 'cartModal';
        this.cartModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        this.cartModal.style.display = 'none';

        this.cartModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-shopping-cart mr-3 text-blue-500"></i>
                        Your Cart
                    </h2>
                    <button onclick="cartManager.hideCartModal()" class="text-gray-500 hover:text-gray-700 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="cartModalContent" class="p-6 overflow-y-auto max-h-[60vh]">
                    <!-- Cart content will be populated here -->
                </div>
                <div class="border-t border-gray-200 p-6 bg-gray-50">
                    <div id="cartTotals" class="mb-4">
                        <!-- Totals will be populated here -->
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="cartManager.clearCart()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                            Clear Cart
                        </button>
                        <button onclick="cartManager.hideCartModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                            Continue Shopping
                        </button>
                        <button onclick="cartManager.startCheckout()" class="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.cartModal);
    }

    // Show cart modal
    showCartModal() {
        this.updateCartModalContent();
        this.cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Close quick preview if open
        const quickPreview = document.getElementById('quickCartPreview');
        if (quickPreview) quickPreview.remove();
    }

    // Hide cart modal
    hideCartModal() {
        this.cartModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Update cart modal content
    updateCartModalContent() {
        const contentDiv = document.getElementById('cartModalContent');
        const totalsDiv = document.getElementById('cartTotals');
        const totals = this.getCartTotals();

        if (this.cart.length === 0) {
            contentDiv.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-gray-400 text-6xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                    <p class="text-gray-500 mb-6">Add some delicious ingredients to get started!</p>
                    <button onclick="cartManager.hideCartModal()" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Browse Suppliers
                    </button>
                </div>
            `;
            totalsDiv.innerHTML = '';
            return;
        }

        // Group items by supplier
        const itemsBySupplier = {};
        this.cart.forEach(item => {
            if (!itemsBySupplier[item.supplierId]) {
                itemsBySupplier[item.supplierId] = [];
            }
            itemsBySupplier[item.supplierId].push(item);
        });

        contentDiv.innerHTML = Object.keys(itemsBySupplier).map(supplierId => {
            const items = itemsBySupplier[supplierId];
            const supplierName = items[0].supplierName || `Supplier ${supplierId}`;
            
            return `
                <div class="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 class="font-semibold text-gray-800">${supplierName}</h3>
                    </div>
                    <div class="p-4 space-y-3">
                        ${items.map(item => `
                            <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-800">${item.productName}</h4>
                                    <p class="text-sm text-gray-600">₹${item.price} per ${item.unit}</p>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <div class="flex items-center border border-gray-300 rounded-lg">
                                        <button onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})" 
                                                class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">-</button>
                                        <span class="px-3 py-1 font-medium">${item.quantity}</span>
                                        <button onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})" 
                                                class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-semibold text-gray-800">₹${item.price * item.quantity}</div>
                                    </div>
                                    <button onclick="cartManager.removeItem(${item.id})" 
                                            class="text-red-500 hover:text-red-700 p-1">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        totalsDiv.innerHTML = `
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Subtotal (${totals.itemCount} items):</span>
                    <span>₹${totals.subtotal}</span>
                </div>
                <div class="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span class="${totals.deliveryFee === 0 ? 'text-green-600' : ''}">
                        ${totals.deliveryFee === 0 ? 'FREE' : `₹${totals.deliveryFee}`}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span>Tax (5%):</span>
                    <span>₹${totals.tax}</span>
                </div>
                <div class="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹${totals.total}</span>
                </div>
                ${totals.subtotal < 1000 ? '<p class="text-xs text-gray-600 mt-2">Add ₹' + (1000 - totals.subtotal) + ' more for free delivery!</p>' : ''}
            </div>
        `;
    }

    // Create checkout modal
    createCheckoutModal() {
        this.checkoutModal = document.createElement('div');
        this.checkoutModal.id = 'checkoutModal';
        this.checkoutModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        this.checkoutModal.style.display = 'none';

        this.checkoutModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-credit-card mr-3 text-green-500"></i>
                        Checkout
                    </h2>
                    <button onclick="cartManager.hideCheckoutModal()" class="text-gray-500 hover:text-gray-700 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flex">
                    <div class="flex-1 p-6 overflow-y-auto max-h-[70vh]">
                        <form id="checkoutForm" class="space-y-6">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Your full name">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <input type="tel" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="+91 98765 43210">
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                                    <textarea required rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Complete address with landmarks"></textarea>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="City">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                        <input type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="State">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                                        <input type="text" required pattern="[0-9]{6}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="123456">
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Delivery Preferences</h3>
                                <div class="space-y-3">
                                    <label class="flex items-center">
                                        <input type="radio" name="deliveryTime" value="morning" class="mr-3" checked>
                                        <span>Morning (8 AM - 12 PM)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="deliveryTime" value="afternoon" class="mr-3">
                                        <span>Afternoon (12 PM - 4 PM)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="deliveryTime" value="evening" class="mr-3">
                                        <span>Evening (4 PM - 8 PM)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                                <div class="space-y-3">
                                    <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="paymentMethod" value="cod" class="mr-3" checked>
                                        <i class="fas fa-money-bill-wave mr-3 text-green-500"></i>
                                        <span>Cash on Delivery</span>
                                    </label>
                                    <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="paymentMethod" value="upi" class="mr-3">
                                        <i class="fas fa-mobile-alt mr-3 text-blue-500"></i>
                                        <span>UPI Payment</span>
                                    </label>
                                    <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="paymentMethod" value="card" class="mr-3">
                                        <i class="fas fa-credit-card mr-3 text-purple-500"></i>
                                        <span>Credit/Debit Card</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                                <textarea rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Any special delivery instructions..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="w-80 bg-gray-50 p-6 border-l border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                        <div id="checkoutOrderSummary" class="space-y-3 mb-6">
                            <!-- Order summary will be populated here -->
                        </div>
                        <button type="button" onclick="cartManager.processOrder()" class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-lg">
                            <i class="fas fa-check mr-2"></i>
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.checkoutModal);
    }

    // Start checkout process
    startCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }

        // Check if user is logged in
        const user = JSON.parse(sessionStorage.getItem('freshConnectUser'));
        if (!user || !user.isLoggedIn) {
            this.showNotification('Please log in to proceed with checkout', 'warning');
            // You could trigger login modal here
            return;
        }

        this.hideCartModal();
        this.updateCheckoutSummary();
        this.checkoutModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide checkout modal
    hideCheckoutModal() {
        this.checkoutModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Update checkout summary
    updateCheckoutSummary() {
        const summaryDiv = document.getElementById('checkoutOrderSummary');
        const totals = this.getCartTotals();

        const itemsBySupplier = {};
        this.cart.forEach(item => {
            if (!itemsBySupplier[item.supplierId]) {
                itemsBySupplier[item.supplierId] = [];
            }
            itemsBySupplier[item.supplierId].push(item);
        });

        summaryDiv.innerHTML = `
            <div class="space-y-4">
                ${Object.keys(itemsBySupplier).map(supplierId => {
                    const items = itemsBySupplier[supplierId];
                    const supplierName = items[0].supplierName || `Supplier ${supplierId}`;
                    
                    return `
                        <div class="border border-gray-200 rounded-lg p-3">
                            <h4 class="font-medium text-gray-800 mb-2">${supplierName}</h4>
                            ${items.map(item => `
                                <div class="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>${item.productName} (${item.quantity}${item.unit})</span>
                                    <span>₹${item.price * item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="border-t border-gray-300 pt-4 mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹${totals.subtotal}</span>
                </div>
                <div class="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span class="${totals.deliveryFee === 0 ? 'text-green-600' : ''}">
                        ${totals.deliveryFee === 0 ? 'FREE' : `₹${totals.deliveryFee}`}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span>Tax:</span>
                    <span>₹${totals.tax}</span>
                </div>
                <div class="border-t border-gray-300 pt-2 flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span>₹${totals.total}</span>
                </div>
            </div>
        `;
    }

    // Process order
    processOrder() {
        const form = document.getElementById('checkoutForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const orderData = {
            id: Date.now(),
            items: [...this.cart],
            customer: {
                name: formData.get('name'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode')
            },
            deliveryTime: formData.get('deliveryTime'),
            paymentMethod: formData.get('paymentMethod'),
            specialInstructions: formData.get('specialInstructions'),
            totals: this.getCartTotals(),
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            estimatedDelivery: this.calculateDeliveryTime()
        };

        // Save order
        const orders = JSON.parse(localStorage.getItem('freshConnectOrders')) || [];
        orders.push(orderData);
        localStorage.setItem('freshConnectOrders', JSON.stringify(orders));

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();

        // Hide checkout modal
        this.hideCheckoutModal();

        // Show success message
        this.showOrderConfirmation(orderData);
    }

    // Calculate delivery time
    calculateDeliveryTime() {
        const now = new Date();
        const deliveryDate = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
        return deliveryDate.toISOString();
    }

    // Show order confirmation
    showOrderConfirmation(orderData) {
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        confirmationModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
                <div class="mb-4">
                    <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                    <p class="text-gray-600">Thank you for your order. We'll start preparing it right away.</p>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium">Order ID:</span>
                        <span class="text-blue-600 font-mono">#${orderData.id}</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium">Total Amount:</span>
                        <span class="font-bold">₹${orderData.totals.total}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Estimated Delivery:</span>
                        <span>${new Date(orderData.estimatedDelivery).toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <button onclick="this.parentElement.parentElement.remove()" class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Continue Shopping
                    </button>
                    <button onclick="window.location.href='vendor-orders.html'" class="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Track Order
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmationModal);
        document.body.style.overflow = 'hidden';

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (confirmationModal.parentElement) {
                confirmationModal.remove();
                document.body.style.overflow = '';
            }
        }, 10000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Close modals when clicking outside
        [this.cartModal, this.checkoutModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                });
            }
        });

        // Add cart button functionality to existing cart icons
        const cartButtons = document.querySelectorAll('button svg[viewBox="0 0 24 24"]');
        cartButtons.forEach(button => {
            const cartIcon = button.querySelector('path[d*="M3 3h2l.4 2M7 13h10l4-8H5.4"]');
            if (cartIcon) {
                button.closest('button').addEventListener('click', () => {
                    this.showCartModal();
                });
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize cart manager
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}