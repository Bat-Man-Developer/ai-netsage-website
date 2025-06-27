// Main application controller
class AINetSageApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.modules = {};
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize navigation
            this.initNavigation();
            
            // Initialize all modules
            this.modules.dashboard = Dashboard;
            this.modules.analysis = Analysis;
            this.modules.logs = Logs;
            this.modules.settings = Settings;

            // Initialize each module
            Object.values(this.modules).forEach(module => {
                if (module.init) {
                    module.init();
                }
            });

            // Set initial section
            this.showSection('dashboard');
            
            // Initialize real-time features
            this.initRealTimeFeatures();
            
            this.isInitialized = true;
            
            // Show success notification
            Utils.showNotification('AI NetSage initialized successfully', 'success');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            Utils.showNotification('Failed to initialize application', 'error');
        }
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        // Handle navigation clicks
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const section = href.substring(1);
                    this.showSection(section);
                }
                
                // Close mobile menu
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            });
        });

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionName}`) {
                link.classList.add('active');
            }
        });

        // Update current section
        this.currentSection = sectionName;
        
        // Emit section change event
        EventBus.emit('sectionChanged', sectionName);
        
        // Update page title
        document.title = `AI NetSage - ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`;
    }

    initRealTimeFeatures() {
        // Simulate real-time updates for demo purposes
        // In a real application, this would use WebSockets or Server-Sent Events
        
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                // Randomly update some dashboard elements
                this.simulateRealTimeUpdate();
            }
        }, 15000); // Every 15 seconds
    }

    simulateRealTimeUpdate() {
        // Simulate receiving a new insight
        const insights = [
            {
                id: Utils.generateId(),
                type: 'info',
                title: 'Network Traffic Update',
                description: `Current bandwidth usage: ${Math.floor(Math.random() * 100)}%`,
                timestamp: new Date().toISOString(),
                model: 'Granite 4.0 Tiny',
                confidence: Math.floor(Math.random() * 20) + 80
            },
            {
                id: Utils.generateId(),
                type: 'warning',
                title: 'Authentication Alert',
                description: `${Math.floor(Math.random() * 5) + 1} failed login attempts in last minute`,
                timestamp: new Date().toISOString(),
                model: 'Granite 3.3 Instruct',
                confidence: Math.floor(Math.random() * 15) + 85
            }
        ];

        // Randomly show one of these insights
        if (Math.random() > 0.7) { // 30% chance
            const randomInsight = insights[Math.floor(Math.random() * insights.length)];
            this.addRealTimeInsight(randomInsight);
        }
    }

    addRealTimeInsight(insight) {
        const container = document.getElementById('insights-container');
        if (!container) return;

        const existingInsights = container.querySelectorAll('.insight-item');
        
        // Create new insight element
        const insightElement = document.createElement('div');
        insightElement.className = `insight-item ${insight.type}`;
        insightElement.innerHTML = `
            <div class="insight-header">
                <span class="insight-title">${Utils.escapeHtml(insight.title)}</span>
                <span class="insight-time">Just now</span>
            </div>
            <div class="insight-description">
                ${Utils.escapeHtml(insight.description)}
            </div>
            <div class="insight-meta">
                <small>Analyzed by ${insight.model} (${insight.confidence}% confidence)</small>
            </div>
        `;

        // Add to top of container
        if (existingInsights.length > 0) {
            container.insertBefore(insightElement, existingInsights[0]);
        } else {
            container.appendChild(insightElement);
        }

        // Remove old insights if too many
        const maxInsights = 10;
        const allInsights = container.querySelectorAll('.insight-item');
        if (allInsights.length > maxInsights) {
            for (let i = maxInsights; i < allInsights.length; i++) {
                allInsights[i].remove();
            }
        }

        // Add animation
        insightElement.style.opacity = '0';
        insightElement.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            insightElement.style.transition = 'all 0.3s ease';
            insightElement.style.opacity = '1';
            insightElement.style.transform = 'translateY(0)';
        }, 100);
    }

    // Public API for external integrations
    getModuleAPI(moduleName) {
        return this.modules[moduleName];
    }

    getCurrentSection() {
        return this.currentSection;
    }

    // Cleanup function
    destroy() {
        if (this.modules.dashboard && this.modules.dashboard.stopAutoUpdate) {
            this.modules.dashboard.stopAutoUpdate();
        }
        
        // Remove event listeners
        EventBus.events = {};
        
        this.isInitialized = false;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiNetSage = new AINetSageApp();
    window.aiNetSage.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause updates
        console.log('Page hidden, pausing updates');
    } else {
        // Page is visible, resume updates
        console.log('Page visible, resuming updates');
        if (window.aiNetSage && window.aiNetSage.modules.dashboard) {
            window.aiNetSage.modules.dashboard.loadData();
        }
    }
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Utils.showNotification('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showNotification('An unexpected error occurred', 'error');
});