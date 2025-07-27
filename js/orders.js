// FreshConnect - Order Management & Tracking
// Enhanced order functionality with real-time tracking and management

class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('freshConnectOrders')) || [];
        this.userData = JSON.parse(sessionStorage.getItem('freshConnectUser'));
        this.orderStatusMap = {
            'pending': { color: 'yellow', icon: 'clock', text: 'Pending' },
            'confirmed': { color: 'blue', icon: 'check-circle', text: 'Confirmed' },
            'preparing': { color: 'orange', icon: 'utensils', text: 'Preparing' },
            'ready': { color: 'purple', icon: 'box', text: 'Ready for Pickup' },
            'shipped': { color: 'indigo', icon: 'truck', text: 'Shipped' },
            'delivered': { color: 'green', icon: 'check-double', text: 'Delivered' },
            'cancelled': { color: 'red', icon: 'times-circle', text: 'Cancelled' }
        };
        
        this.init();
    }

    init() {
        this.setupOrderTracking();
        this.setupRealTimeUpdates();
        this.renderOrdersList();
        this.setupEventListeners();
        this.initializeOrderFilters();
    }

    setupOrderTracking() {
        // Create order tracking interface
        this.createOrderTrackingUI();
        this.createOrderFilters();
        this.createOrderStats();
    }

    createOrderTrackingUI() {
        const container = document.querySelector('.container');
        if (!container) return;

        // Enhanced order tracking header
        const trackingHeader = document.createElement('div');
        trackingHeader.className = 'mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6';
        trackingHeader.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold mb-2">Order Management</h1>
                    <p class="text-blue-100">Track and manage your orders in real-time</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold">${this.orders.length}</div>
                    <div class="text-sm text-blue-100">Total Orders</div>
                </div>
            </div>
        `;

        container.insertBefore(trackingHeader, container.firstChild);
    }

    createOrderFilters() {
        const container = document.querySelector('.container');
        if (!container) return;

        const filtersSection = document.createElement('div');
        filtersSection.className = 'mb-6 bg-white rounded-xl shadow-lg p-6';
        filtersSection.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-wrap gap-3">
                    <button class="order-filter-btn active px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium" data-filter="all">
                        All Orders (${this.orders.length})
                    </button>
                    <button class="order-filter-btn px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors" data-filter="pending">
                        Pending (${this.getOrdersByStatus('pending').length})
                    </button>
                    <button class="order-filter-btn px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors" data-filter="confirmed">
                        Confirmed (${this.getOrdersByStatus('confirmed').length})
                    </button>
                    <button class="order-filter-btn px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors" data-filter="delivered">
                        Delivered (${this.getOrdersByStatus('delivered').length})
                    </button>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <input type="text" id="orderSearch" placeholder="Search orders..." 
                               class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <select id="orderSort" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount-high">Amount: High to Low</option>
                        <option value="amount-low">Amount: Low to High</option>
                    </select>
                </div>
            </div>
        `;

        container.appendChild(filtersSection);
    }

    createOrderStats() {
        const container = document.querySelector('.container');
        if (!container) return;

        const statsSection = document.createElement('div');
        statsSection.className = 'mb-6 grid grid-cols-1 md:grid-cols-4 gap-4';
        
        const stats = [
            {
                title: 'Total Spent',
                value: '₹' + this.calculateTotalSpent().toLocaleString(),
                icon: 'fas fa-rupee-sign',
                color: 'text-green-600',
                bgColor: 'bg-green-100'
            },
            {
                title: 'Active Orders',
                value: this.getActiveOrders().length,
                icon: 'fas fa-shopping-cart',
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
            },
            {
                title: 'This Month',
                value: this.getMonthlyOrders().length,
                icon: 'fas fa-calendar-alt',
                color: 'text-purple-600',
                bgColor: 'bg-purple-100'
            },
            {
                title: 'Avg Order Value',
                value: '₹' + Math.round(this.calculateAverageOrderValue()),
                icon: 'fas fa-chart-line',
                color: 'text-orange-600',
                bgColor: 'bg-orange-100'
            }
        ];

        statsSection.innerHTML = stats.map(stat => `
            <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="${stat.bgColor} ${stat.color} p-3 rounded-lg">
                        <i class="${stat.icon}"></i>
                    </div>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-1">${stat.value}</h3>
                <p class="text-sm text-gray-600">${stat.title}</p>
            </div>
        `).join('');

        container.appendChild(statsSection);
    }

    renderOrdersList() {
        let ordersContainer = document.getElementById('ordersContainer');
        if (!ordersContainer) {
            ordersContainer = document.createElement('div');
            ordersContainer.id = 'ordersContainer';
            ordersContainer.className = 'space-y-4';
            
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(ordersContainer);
            }
        }

        if (this.orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <i class="fas fa-shopping-cart text-gray-400 text-6xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                    <p class="text-gray-500 mb-6">Start shopping to see your orders here</p>
                    <button onclick="window.location.href='suppliers.html'" 
                            class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        Browse Suppliers
                    </button>
                </div>
            `;
            return;
        }

        // Sort orders by date (newest first)
        const sortedOrders = [...this.orders].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        ordersContainer.innerHTML = sortedOrders.map(order => this.createOrderCard(order)).join('');
    }

    createOrderCard(order) {
        const status = this.orderStatusMap[order.status] || this.orderStatusMap['pending'];
        const progress = this.calculateOrderProgress(order.status);
        
        return `
            <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden order-card" data-order-id="${order.id}">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-1">
                                Order #${order.id}
                            </h3>
                            <p class="text-sm text-gray-600">
                                Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div class="text-right">
                            <div class="text-xl font-bold text-gray-800">₹${order.totals?.total || 0}</div>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800">
                                    <i class="fas fa-${status.icon} mr-1"></i>
                                    ${status.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Order Progress Bar -->
                    <div class="mb-4">
                        <div class="flex justify-between text-xs text-gray-600 mb-2">
                            <span>Order Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-2">Items (${order.items?.length || 0})</h4>
                        <div class="space-y-2 max-h-32 overflow-y-auto">
                            ${(order.items || []).map(item => `
                                <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span class="font-medium">${item.productName}</span>
                                    <span class="text-gray-600">${item.quantity}${item.unit} × ₹${item.price}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Delivery Information -->
                    ${order.estimatedDelivery ? `
                        <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div class="flex items-center text-sm text-blue-800">
                                <i class="fas fa-truck mr-2"></i>
                                <span class="font-medium">Estimated Delivery: </span>
                                <span class="ml-1">${new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div class="flex space-x-3">
                        <button onclick="orderManager.viewOrderDetails('${order.id}')" 
                                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                            <i class="fas fa-eye mr-2"></i>View Details
                        </button>
                        ${order.status === 'pending' || order.status === 'confirmed' ? `
                            <button onclick="orderManager.cancelOrder('${order.id}')" 
                                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                        ` : ''}
                        ${order.status === 'delivered' ? `
                            <button onclick="orderManager.reorderItems('${order.id}')" 
                                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                                <i class="fas fa-redo mr-2"></i>Reorder
                            </button>
                        ` : ''}
                        <button onclick="orderManager.trackOrder('${order.id}')" 
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
                            <i class="fas fa-map-marker-alt mr-2"></i>Track
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    calculateOrderProgress(status) {
        const progressMap = {
            'pending': 10,
            'confirmed': 25,
            'preparing': 50,
            'ready': 75,
            'shipped': 90,
            'delivered': 100,
            'cancelled': 0
        };
        return progressMap[status] || 0;
    }

    setupRealTimeUpdates() {
        // Simulate real-time order updates
        setInterval(() => {
            this.updateOrderStatuses();
        }, 30000); // Update every 30 seconds

        // Simulate order status progression
        this.simulateOrderProgress();
    }

    simulateOrderProgress() {
        // Randomly progress some orders for demo purposes
        this.orders.forEach(order => {
            if (Math.random() < 0.1) { // 10% chance per update cycle
                this.progressOrderStatus(order);
            }
        });
    }

    progressOrderStatus(order) {
        const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered'];
        const currentIndex = statusFlow.indexOf(order.status);
        
        if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
            order.status = statusFlow[currentIndex + 1];
            this.saveOrders();
            this.showNotification(`Order #${order.id} status updated to ${this.orderStatusMap[order.status].text}`, 'info');
        }
    }

    updateOrderStatuses() {
        // This would typically fetch updates from a server
        // For demo, we'll just refresh the display
        this.renderOrdersList();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.order-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('orderSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }
    }

    initializeOrderFilters() {
        // Set up initial filter state
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
    }

    handleFilterChange(filter) {
        this.currentFilter = filter;
        
        // Update button styles
        document.querySelectorAll('.order-filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
            activeBtn.classList.add('active', 'bg-blue-500', 'text-white');
        }

        this.applyFiltersAndSort();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFiltersAndSort();
    }

    handleSort(sortType) {
        this.currentSort = sortType;
        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
        let filteredOrders = [...this.orders];

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            filteredOrders = filteredOrders.filter(order => 
                order.id.toString().includes(this.searchQuery) ||
                order.items?.some(item => 
                    item.productName.toLowerCase().includes(this.searchQuery)
                )
            );
        }

        // Apply sorting
        switch (this.currentSort) {
            case 'oldest':
                filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'amount-high':
                filteredOrders.sort((a, b) => (b.totals?.total || 0) - (a.totals?.total || 0));
                break;
            case 'amount-low':
                filteredOrders.sort((a, b) => (a.totals?.total || 0) - (b.totals?.total || 0));
                break;
            case 'newest':
            default:
                filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        this.renderFilteredOrders(filteredOrders);
    }

    renderFilteredOrders(orders) {
        const ordersContainer = document.getElementById('ordersContainer');
        if (!ordersContainer) return;

        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <i class="fas fa-search text-gray-400 text-6xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
                    <p class="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => this.createOrderCard(order)).join('');
    }

    // Order action methods
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id.toString() === orderId);
        if (!order) return;

        this.showOrderDetailsModal(order);
    }

    showOrderDetailsModal(order) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        
        const status = this.orderStatusMap[order.status] || this.orderStatusMap['pending'];
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-800">Order Details</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6 space-y-6">
                    <!-- Order Header -->
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800">Order #${order.id}</h3>
                            <p class="text-gray-600">Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        <span class="px-4 py-2 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800">
                            <i class="fas fa-${status.icon} mr-2"></i>
                            ${status.text}
                        </span>
                    </div>

                    <!-- Order Timeline -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-3">Order Timeline</h4>
                        ${this.createOrderTimeline(order)}
                    </div>

                    <!-- Order Items -->
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-3">Order Items</h4>
                        <div class="space-y-3">
                            ${(order.items || []).map(item => `
                                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h5 class="font-medium text-gray-800">${item.productName}</h5>
                                        <p class="text-sm text-gray-600">₹${item.price} per ${item.unit}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-semibold text-gray-800">${item.quantity}${item.unit}</div>
                                        <div class="text-sm text-gray-600">₹${item.price * item.quantity}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-3">Order Summary</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span>Subtotal:</span>
                                <span>₹${order.totals?.subtotal || 0}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span>${order.totals?.deliveryFee === 0 ? 'FREE' : '₹' + (order.totals?.deliveryFee || 0)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Tax:</span>
                                <span>₹${order.totals?.tax || 0}</span>
                            </div>
                            <div class="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>₹${order.totals?.total || 0}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Delivery Information -->
                    ${order.customer ? `
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-800 mb-3">Delivery Information</h4>
                            <div class="text-sm space-y-1">
                                <p><span class="font-medium">Name:</span> ${order.customer.name}</p>
                                <p><span class="font-medium">Phone:</span> ${order.customer.phone}</p>
                                <p><span class="font-medium">Address:</span> ${order.customer.address}</p>
                                <p><span class="font-medium">City:</span> ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }

    createOrderTimeline(order) {
        const timeline = [
            { status: 'pending', label: 'Order Placed', time: order.createdAt },
            { status: 'confirmed', label: 'Order Confirmed', time: null },
            { status: 'preparing', label: 'Preparing Order', time: null },
            { status: 'ready', label: 'Ready for Pickup', time: null },
            { status: 'shipped', label: 'Order Shipped', time: null },
            { status: 'delivered', label: 'Order Delivered', time: order.estimatedDelivery }
        ];

        const currentStatusIndex = timeline.findIndex(t => t.status === order.status);

        return timeline.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return `
                <div class="flex items-center space-x-3 ${index < timeline.length - 1 ? 'mb-3' : ''}">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500 text-white' : 
                            isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                        }">
                            ${isCompleted ? '<i class="fas fa-check text-xs"></i>' : 
                              isCurrent ? '<i class="fas fa-clock text-xs"></i>' : 
                              '<i class="fas fa-circle text-xs"></i>'}
                        </div>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-500'}">${step.label}</p>
                        ${step.time ? `<p class="text-xs text-gray-500">${new Date(step.time).toLocaleString()}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        const orderIndex = this.orders.findIndex(o => o.id.toString() === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'cancelled';
            this.saveOrders();
            this.renderOrdersList();
            this.showNotification('Order cancelled successfully', 'info');
        }
    }

    reorderItems(orderId) {
        const order = this.orders.find(o => o.id.toString() === orderId);
        if (!order || !order.items) return;

        // Add items back to cart
        if (window.cartManager) {
            order.items.forEach(item => {
                window.cartManager.addItem(
                    item.supplierId,
                    item.productName,
                    item.price,
                    item.unit,
                    item.quantity
                );
            });
            this.showNotification('Items added to cart for reorder!', 'success');
        } else {
            this.showNotification('Cart not available. Please try again.', 'error');
        }
    }

    trackOrder(orderId) {
        const order = this.orders.find(o => o.id.toString() === orderId);
        if (!order) return;

        // Show tracking modal with map (simulated)
        this.showTrackingModal(order);
    }

    showTrackingModal(order) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl max-w-lg w-full">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold text-gray-800">Track Order #${order.id}</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <!-- Simulated Map -->
                    <div class="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-6">
                        <div class="text-center text-gray-500">
                            <i class="fas fa-map-marked-alt text-4xl mb-2"></i>
                            <p>Live tracking map would appear here</p>
                            <p class="text-sm">Current location: En route to delivery</p>
                        </div>
                    </div>

                    <!-- Delivery Info -->
                    <div class="space-y-4">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-truck text-blue-500"></i>
                            <div>
                                <p class="font-medium">Estimated Delivery</p>
                                <p class="text-sm text-gray-600">${order.estimatedDelivery ? 
                                    new Date(order.estimatedDelivery).toLocaleString() : 'Calculating...'}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-phone text-green-500"></i>
                            <div>
                                <p class="font-medium">Delivery Partner</p>
                                <p class="text-sm text-gray-600">+91 98765 43210</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }

    // Utility methods
    getOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }

    getActiveOrders() {
        return this.orders.filter(order => 
            !['delivered', 'cancelled'].includes(order.status)
        );
    }

    getMonthlyOrders() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });
    }

    calculateTotalSpent() {
        return this.orders
            .filter(order => order.status !== 'cancelled')
            .reduce((total, order) => total + (order.totals?.total || 0), 0);
    }

    calculateAverageOrderValue() {
        const validOrders = this.orders.filter(order => order.status !== 'cancelled');
        if (validOrders.length === 0) return 0;
        
        return this.calculateTotalSpent() / validOrders.length;
    }

    saveOrders() {
        localStorage.setItem('freshConnectOrders', JSON.stringify(this.orders));
    }

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

// Initialize order manager
let orderManager;
document.addEventListener('DOMContentLoaded', () => {
    orderManager = new OrderManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderManager;
}