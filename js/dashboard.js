// FreshConnect - Interactive Dashboard
// Enhanced dashboard functionality with charts, widgets, and real-time updates

class DashboardManager {
    constructor() {
        this.userData = JSON.parse(sessionStorage.getItem('freshConnectUser'));
        this.orders = JSON.parse(localStorage.getItem('freshConnectOrders')) || [];
        this.analytics = JSON.parse(localStorage.getItem('freshConnectAnalytics')) || this.initializeAnalytics();
        this.widgets = [];
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        if (!this.userData || !this.userData.isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }

        this.setupDashboard();
        this.createWidgets();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
        this.loadCharts();
    }

    initializeAnalytics() {
        return {
            dailySales: this.generateMockDailySales(),
            topProducts: this.generateMockTopProducts(),
            customerSatisfaction: 4.6,
            totalRevenue: 45000,
            totalOrders: 123,
            repeatCustomers: 67
        };
    }

    generateMockDailySales() {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                sales: Math.floor(Math.random() * 5000) + 2000,
                orders: Math.floor(Math.random() * 20) + 5
            });
        }
        return data;
    }

    generateMockTopProducts() {
        return [
            { name: 'Fresh Tomatoes', sales: 850, growth: 12.5 },
            { name: 'Basmati Rice', sales: 720, growth: 8.3 },
            { name: 'Cooking Oil', sales: 640, growth: -2.1 },
            { name: 'Red Chili Powder', sales: 580, growth: 15.7 },
            { name: 'Fresh Milk', sales: 520, growth: 6.2 }
        ];
    }

    setupDashboard() {
        // Create enhanced dashboard layout
        this.createDashboardHeader();
        this.createQuickActions();
        this.createMetricsOverview();
        this.createNotificationCenter();
    }

    createDashboardHeader() {
        const header = document.querySelector('header nav');
        if (!header) return;

        // Add dashboard-specific elements
        const dashboardInfo = document.createElement('div');
        dashboardInfo.className = 'flex items-center space-x-4 ml-auto';
        dashboardInfo.innerHTML = `
            <div class="hidden md:flex items-center space-x-4">
                <div class="flex items-center space-x-2 text-sm">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span class="text-gray-600">Online</span>
                </div>
                <div class="text-sm text-gray-600">
                    Last updated: <span id="lastUpdated">${new Date().toLocaleTimeString()}</span>
                </div>
                <button id="refreshDashboard" class="p-2 text-gray-600 hover:text-blue-600 transition-colors" title="Refresh Dashboard">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button id="notificationBell" class="relative p-2 text-gray-600 hover:text-blue-600 transition-colors" title="Notifications">
                    <i class="fas fa-bell"></i>
                    <span id="notificationBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
                </button>
            </div>
        `;

        header.appendChild(dashboardInfo);
    }

    createQuickActions() {
        const main = document.querySelector('main .container');
        if (!main) return;

        const quickActions = document.createElement('div');
        quickActions.className = 'mb-8 bg-white rounded-xl shadow-lg p-6';
        
        const actions = this.userData.role === 'vendor' ? [
            { icon: 'fas fa-plus-circle', text: 'Quick Order', action: 'openQuickOrder', color: 'bg-blue-500' },
            { icon: 'fas fa-search', text: 'Find Suppliers', action: 'findSuppliers', color: 'bg-green-500' },
            { icon: 'fas fa-chart-line', text: 'View Analytics', action: 'viewAnalytics', color: 'bg-purple-500' },
            { icon: 'fas fa-headset', text: 'Support', action: 'contactSupport', color: 'bg-orange-500' }
        ] : [
            { icon: 'fas fa-box', text: 'Add Product', action: 'addProduct', color: 'bg-blue-500' },
            { icon: 'fas fa-truck', text: 'Manage Orders', action: 'manageOrders', color: 'bg-green-500' },
            { icon: 'fas fa-users', text: 'View Customers', action: 'viewCustomers', color: 'bg-purple-500' },
            { icon: 'fas fa-chart-bar', text: 'Sales Report', action: 'salesReport', color: 'bg-orange-500' }
        ];

        quickActions.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${actions.map(action => `
                    <button onclick="dashboardManager.${action.action}()" 
                            class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div class="${action.color} text-white p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <i class="${action.icon}"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-700">${action.text}</span>
                    </button>
                `).join('')}
            </div>
        `;

        main.insertBefore(quickActions, main.firstChild);
    }

    createMetricsOverview() {
        const main = document.querySelector('main .container');
        if (!main) return;

        const metricsOverview = document.createElement('div');
        metricsOverview.className = 'mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';

        const metrics = this.userData.role === 'vendor' ? [
            { 
                title: 'Total Orders', 
                value: this.orders.length, 
                change: '+12%', 
                icon: 'fas fa-shopping-cart', 
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
            },
            { 
                title: 'Monthly Spend', 
                value: '₹' + this.calculateMonthlySpend(), 
                change: '+8%', 
                icon: 'fas fa-rupee-sign', 
                color: 'text-green-600',
                bgColor: 'bg-green-100'
            },
            { 
                title: 'Active Suppliers', 
                value: this.getActiveSuppliers(), 
                change: '+3', 
                icon: 'fas fa-store', 
                color: 'text-purple-600',
                bgColor: 'bg-purple-100'
            },
            { 
                title: 'Avg Delivery Time', 
                value: '2.5 hrs', 
                change: '-15min', 
                icon: 'fas fa-clock', 
                color: 'text-orange-600',
                bgColor: 'bg-orange-100'
            }
        ] : [
            { 
                title: 'Total Revenue', 
                value: '₹' + this.analytics.totalRevenue.toLocaleString(), 
                change: '+15%', 
                icon: 'fas fa-chart-line', 
                color: 'text-green-600',
                bgColor: 'bg-green-100'
            },
            { 
                title: 'Orders Today', 
                value: this.getTodayOrders(), 
                change: '+23%', 
                icon: 'fas fa-shopping-bag', 
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
            },
            { 
                title: 'Active Products', 
                value: '24', 
                change: '+2', 
                icon: 'fas fa-box', 
                color: 'text-purple-600',
                bgColor: 'bg-purple-100'
            },
            { 
                title: 'Customer Rating', 
                value: this.analytics.customerSatisfaction, 
                change: '+0.2', 
                icon: 'fas fa-star', 
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100'
            }
        ];

        metricsOverview.innerHTML = metrics.map(metric => `
            <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="${metric.bgColor} ${metric.color} p-3 rounded-lg">
                        <i class="${metric.icon}"></i>
                    </div>
                    <span class="text-sm font-medium text-green-600">${metric.change}</span>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-1">${metric.value}</h3>
                <p class="text-sm text-gray-600">${metric.title}</p>
            </div>
        `).join('');

        main.appendChild(metricsOverview);
    }

    createNotificationCenter() {
        const notificationCenter = document.createElement('div');
        notificationCenter.id = 'notificationCenter';
        notificationCenter.className = 'fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 hidden max-h-96 overflow-hidden';
        
        notificationCenter.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-gray-800">Notifications</h3>
                    <button onclick="dashboardManager.clearNotifications()" class="text-sm text-blue-600 hover:text-blue-800">
                        Clear All
                    </button>
                </div>
            </div>
            <div id="notificationList" class="max-h-64 overflow-y-auto">
                <!-- Notifications will be populated here -->
            </div>
            <div class="p-3 border-t border-gray-200 text-center">
                <button class="text-sm text-gray-600 hover:text-gray-800">View All Notifications</button>
            </div>
        `;

        document.body.appendChild(notificationCenter);
        this.loadNotifications();
    }

    createWidgets() {
        const main = document.querySelector('main .container');
        if (!main) return;

        // Create charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6';
        
        // Sales chart
        const salesChart = document.createElement('div');
        salesChart.className = 'bg-white rounded-xl shadow-lg p-6';
        salesChart.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Sales Overview</h3>
                <select id="salesPeriod" class="text-sm border border-gray-300 rounded px-3 py-1">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                </select>
            </div>
            <canvas id="salesChart" width="400" height="200"></canvas>
        `;

        // Activity feed
        const activityFeed = document.createElement('div');
        activityFeed.className = 'bg-white rounded-xl shadow-lg p-6';
        activityFeed.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div id="activityList" class="space-y-3 max-h-64 overflow-y-auto">
                <!-- Activity items will be populated here -->
            </div>
        `;

        chartsContainer.appendChild(salesChart);
        chartsContainer.appendChild(activityFeed);
        main.appendChild(chartsContainer);

        this.loadActivityFeed();
    }

    loadCharts() {
        // Simple chart implementation using Canvas
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.analytics.dailySales;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Find max value for scaling
        const maxSales = Math.max(...data.map(d => d.sales));
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw data points and lines
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = canvas.height - padding - (point.sales / maxSales) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw point
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        });
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const date = new Date(point.date);
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            ctx.fillText(label, x, canvas.height - padding + 20);
        });
    }

    loadActivityFeed() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            { 
                icon: 'fas fa-shopping-cart text-blue-500', 
                text: 'New order #1234 received', 
                time: '2 minutes ago',
                type: 'order'
            },
            { 
                icon: 'fas fa-user-plus text-green-500', 
                text: 'New customer registered', 
                time: '15 minutes ago',
                type: 'customer'
            },
            { 
                icon: 'fas fa-star text-yellow-500', 
                text: 'Received 5-star review', 
                time: '1 hour ago',
                type: 'review'
            },
            { 
                icon: 'fas fa-truck text-purple-500', 
                text: 'Order #1230 delivered', 
                time: '2 hours ago',
                type: 'delivery'
            },
            { 
                icon: 'fas fa-exclamation-triangle text-orange-500', 
                text: 'Low stock alert: Tomatoes', 
                time: '3 hours ago',
                type: 'alert'
            }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex-shrink-0">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">${activity.text}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    loadNotifications() {
        const notifications = [
            {
                id: 1,
                title: 'Order Confirmed',
                message: 'Your order #1234 has been confirmed',
                time: new Date(Date.now() - 5 * 60 * 1000),
                read: false,
                type: 'success'
            },
            {
                id: 2,
                title: 'New Supplier Available',
                message: 'Fresh Organic Farms is now available in your area',
                time: new Date(Date.now() - 30 * 60 * 1000),
                read: false,
                type: 'info'
            },
            {
                id: 3,
                title: 'Price Alert',
                message: 'Tomato prices have dropped by 15%',
                time: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: true,
                type: 'warning'
            }
        ];

        const notificationList = document.getElementById('notificationList');
        const notificationBadge = document.getElementById('notificationBadge');
        
        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.classList.remove('hidden');
        }

        notificationList.innerHTML = notifications.map(notification => `
            <div class="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${notification.read ? 'opacity-75' : ''}" 
                 onclick="dashboardManager.markNotificationRead(${notification.id})">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <div class="w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800">${notification.title}</p>
                        <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
                        <p class="text-xs text-gray-500 mt-2">${this.formatTimeAgo(notification.time)}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupRealTimeUpdates() {
        // Update dashboard every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.updateLastUpdatedTime();
            this.refreshMetrics();
            this.loadActivityFeed();
        }, 30000);
    }

    setupEventListeners() {
        // Refresh dashboard button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // Notification bell
        const notificationBell = document.getElementById('notificationBell');
        const notificationCenter = document.getElementById('notificationCenter');
        
        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationCenter.classList.toggle('hidden');
            });
        }

        // Close notification center when clicking outside
        document.addEventListener('click', (e) => {
            if (notificationCenter && !notificationCenter.contains(e.target)) {
                notificationCenter.classList.add('hidden');
            }
        });

        // Sales period selector
        const salesPeriod = document.getElementById('salesPeriod');
        if (salesPeriod) {
            salesPeriod.addEventListener('change', () => {
                this.loadCharts();
            });
        }
    }

    // Quick action methods
    openQuickOrder() {
        this.showModal('Quick Order', `
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Quick Order</h3>
                <form id="quickOrderForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                            <option>Fresh Tomatoes</option>
                            <option>Basmati Rice</option>
                            <option>Cooking Oil</option>
                            <option>Red Chili Powder</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="10">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                <option>kg</option>
                                <option>L</option>
                                <option>pieces</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Place Quick Order
                    </button>
                </form>
            </div>
        `);
    }

    findSuppliers() {
        window.location.href = 'suppliers.html';
    }

    viewAnalytics() {
        this.showModal('Analytics Overview', `
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Analytics Overview</h3>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${this.orders.length}</div>
                        <div class="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">₹${this.calculateMonthlySpend()}</div>
                        <div class="text-sm text-gray-600">Monthly Spend</div>
                    </div>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Average Order Value</span>
                        <span class="font-medium">₹${Math.round(this.calculateMonthlySpend() / Math.max(this.orders.length, 1))}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Orders This Month</span>
                        <span class="font-medium">${this.orders.length}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Favorite Supplier</span>
                        <span class="font-medium">Spice Masters</span>
                    </div>
                </div>
            </div>
        `);
    }

    contactSupport() {
        this.showModal('Contact Support', `
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Contact Support</h3>
                <div class="space-y-4">
                    <div class="flex items-center p-4 bg-blue-50 rounded-lg">
                        <i class="fas fa-phone text-blue-500 mr-3"></i>
                        <div>
                            <div class="font-medium">Phone Support</div>
                            <div class="text-sm text-gray-600">+91 98765 43210</div>
                        </div>
                    </div>
                    <div class="flex items-center p-4 bg-green-50 rounded-lg">
                        <i class="fas fa-envelope text-green-500 mr-3"></i>
                        <div>
                            <div class="font-medium">Email Support</div>
                            <div class="text-sm text-gray-600">support@freshconnect.in</div>
                        </div>
                    </div>
                    <div class="flex items-center p-4 bg-purple-50 rounded-lg">
                        <i class="fas fa-comments text-purple-500 mr-3"></i>
                        <div>
                            <div class="font-medium">Live Chat</div>
                            <div class="text-sm text-gray-600">Available 24/7</div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    // Supplier-specific actions
    addProduct() {
        this.showModal('Add New Product', `
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Add New Product</h3>
                <form class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Fresh Organic Tomatoes">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                <option>Vegetables</option>
                                <option>Fruits</option>
                                <option>Grains</option>
                                <option>Dairy</option>
                                <option>Spices</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                <option>kg</option>
                                <option>L</option>
                                <option>pieces</option>
                                <option>dozen</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                            <input type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="25">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                            <input type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="100">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Product description..."></textarea>
                    </div>
                    <button type="submit" class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Add Product
                    </button>
                </form>
            </div>
        `);
    }

    manageOrders() {
        window.location.href = 'orders.html';
    }

    viewCustomers() {
        window.location.href = 'vendor-network.html';
    }

    salesReport() {
        window.location.href = 'supplier-analytics.html';
    }

    // Utility methods
    calculateMonthlySpend() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            })
            .reduce((total, order) => total + (order.totals?.total || 0), 0);
    }

    getActiveSuppliers() {
        const supplierIds = [...new Set(this.orders.map(order => 
            order.items?.map(item => item.supplierId) || []
        ).flat())];
        return supplierIds.length;
    }

    getTodayOrders() {
        const today = new Date().toDateString();
        return this.orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        ).length;
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }

    updateLastUpdatedTime() {
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleTimeString();
        }
    }

    refreshDashboard() {
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.classList.add('animate-spin');
            setTimeout(() => {
                refreshBtn.classList.remove('animate-spin');
            }, 1000);
        }
        
        this.updateLastUpdatedTime();
        this.refreshMetrics();
        this.loadCharts();
        this.loadActivityFeed();
        this.showNotification('Dashboard refreshed!', 'success');
    }

    refreshMetrics() {
        // Simulate metric updates
        this.analytics.dailySales = this.generateMockDailySales();
        localStorage.setItem('freshConnectAnalytics', JSON.stringify(this.analytics));
    }

    markNotificationRead(notificationId) {
        // Mark notification as read
        console.log(`Notification ${notificationId} marked as read`);
        this.loadNotifications();
    }

    clearNotifications() {
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            notificationBadge.classList.add('hidden');
        }
        this.loadNotifications();
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-800">${title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${content}
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

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize dashboard manager
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboardManager) {
        dashboardManager.destroy();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}