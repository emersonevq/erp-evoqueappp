// Sistema de Notificações Avan��ado - Versão Melhorada e Corrigida

class AdvancedNotificationSystem {
    constructor() {
        this.notifications = [];
        this.socket = null;
        this.soundEnabled = true;
        this.settings = {
            novoChamado: true,
            statusAlterado: true,
            novoUsuario: true,
            emailNotifications: true,
            soundEnabled: true,
            autoMarkRead: false,
            maxNotifications: 50
        };
        // Buffer de deduplicação (título+mensagem) com TTL
        this._recent = new Map();
        this._dedupWindowMs = 3000;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.createNotificationContainer();
            this.createNotificationPanel();
            this.loadSettings();
            this.bindEvents();
            this.initializeSocket();
            this.loadRecentNotifications();
            this.isInitialized = true;
            console.log('Sistema de notificações avançado inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar sistema de notificações:', error);
        }
    }

    createNotificationContainer() {
        if (document.getElementById('advanced-notification-container')) return;

        const container = document.createElement('div');
        container.id = 'advanced-notification-container';
        container.className = 'advanced-notification-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Notificações do sistema');
        document.body.appendChild(container);
    }

    createNotificationPanel() {
        if (document.getElementById('advanced-notification-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'advanced-notification-panel';
        panel.className = 'advanced-notification-panel';
        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3><i class="fas fa-bell me-2"></i>Notificações</h3>
                <button class="notification-panel-close" id="notificationPanelClose" aria-label="Fechar painel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-panel-body">
                <div class="notification-panel-list" id="notificationPanelList">
                    <!-- Notificações serão carregadas aqui -->
                </div>
            </div>
            <div class="notification-panel-footer">
                <button class="btn btn-outline-secondary" id="btnMarcarTodasLidas">
                    <i class="fas fa-check-double me-1"></i>Marcar Todas como Lidas
                </button>
                <button class="btn btn-outline-danger" id="btnLimparNotificacoes">
                    <i class="fas fa-trash me-1"></i>Limpar Todas
                </button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    bindEvents() {
        // Botão de notificações na navbar
        const btnNotificacoes = document.getElementById('btnNotificacoes');
        if (btnNotificacoes) {
            btnNotificacoes.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNotificationPanel();
            });
        }

        // Fechar painel
        const closeBtn = document.getElementById('notificationPanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideNotificationPanel();
            });
        }

        // Marcar todas como lidas
        const markAllBtn = document.getElementById('btnMarcarTodasLidas');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Limpar todas
        const clearAllBtn = document.getElementById('btnLimparNotificacoes');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllNotifications();
            });
        }

        // Fechar painel ao clicar fora
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('advanced-notification-panel');
            const btnNotificacoes = document.getElementById('btnNotificacoes');
            
            if (panel && panel.classList.contains('show') && 
                !panel.contains(e.target) && 
                !btnNotificacoes?.contains(e.target)) {
                this.hideNotificationPanel();
            }
        });

        // Tecla ESC para fechar painel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideNotificationPanel();
            }
        });
    }

    initializeSocket() {
        try {
            if (typeof io === 'undefined') {
                console.warn('Socket.IO não está disponível');
                return;
            }

            this.socket = io({
                transports: ['websocket', 'polling'],
                upgrade: true,
                rememberUpgrade: true,
                timeout: 20000
            });

            this.socket.on('connect', () => {
                console.log('Socket.IO conectado para notificações');
                this.updateConnectionStatus('connected');
            });

            this.socket.on('disconnect', () => {
                console.log('Socket.IO desconectado');
                this.updateConnectionStatus('disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Erro de conexão Socket.IO:', error);
                this.updateConnectionStatus('error');
            });

            // Eventos de notificação
            this.socket.on('novo_chamado', (data) => {
                if (this.settings.novoChamado) {
                    this.showNotification({
                        type: 'info',
                        title: 'Novo Chamado',
                        message: `Chamado ${data.codigo} criado por ${data.solicitante}`,
                        data: data,
                        sound: this.settings.soundEnabled
                    });
                }
            });

            this.socket.on('status_atualizado', (data) => {
                if (this.settings.statusAlterado) {
                    this.showNotification({
                        type: 'success',
                        title: 'Status Atualizado',
                        message: `Chamado ${data.codigo} alterado para ${data.novo_status}`,
                        data: data,
                        sound: this.settings.soundEnabled
                    });
                }
            });

            this.socket.on('usuario_criado', (data) => {
                if (this.settings.novoUsuario) {
                    this.showNotification({
                        type: 'info',
                        title: 'Novo Usuário',
                        message: `Usuário ${data.nome} ${data.sobrenome} foi criado`,
                        data: data,
                        sound: this.settings.soundEnabled
                    });
                }
            });

            this.socket.on('chamado_deletado', (data) => {
                this.showNotification({
                    type: 'warning',
                    title: 'Chamado Excluído',
                    message: `Chamado ${data.codigo} foi excluído`,
                    data: data,
                    sound: this.settings.soundEnabled
                });
            });

            this.socket.on('chamado_atribuido', (data) => {
                this.showNotification({
                    type: 'info',
                    title: 'Chamado Atribuído',
                    message: `Chamado ${data.codigo} foi atribuído a ${data.agente_nome}`,
                    data: data,
                    sound: this.settings.soundEnabled
                });
            });

            this.socket.on('chamado_transferido', (data) => {
                this.showNotification({
                    type: 'info',
                    title: 'Chamado Transferido',
                    message: `Chamado ${data.codigo} foi transferido de ${data.agente_origem_nome} para ${data.agente_destino_nome}`,
                    data: data,
                    sound: this.settings.soundEnabled
                });
            });

            this.socket.on('ticket_enviado', (data) => {
                this.showNotification({
                    type: 'success',
                    title: 'Ticket Enviado',
                    message: `Ticket enviado para chamado ${data.codigo}`,
                    data: data,
                    sound: false
                });
            });

            this.socket.on('usuario_bloqueio_alterado', (data) => {
                const status = data.novo_status ? 'bloqueado' : 'desbloqueado';
                this.showNotification({
                    type: data.novo_status ? 'warning' : 'success',
                    title: 'Usuário ' + (data.novo_status ? 'Bloqueado' : 'Desbloqueado'),
                    message: `Usuário ${data.nome} foi ${status}`,
                    data: data,
                    sound: this.settings.soundEnabled
                });
            });

            this.socket.on('test_notification', () => {
                this.showNotification({
                    type: 'info',
                    title: 'Teste de Notificação',
                    message: 'Sistema de notificações funcionando corretamente!',
                    sound: this.settings.soundEnabled
                });
            });

        } catch (error) {
            console.error('Erro ao inicializar Socket.IO:', error);
            this.updateConnectionStatus('error');
        }
    }

    showNotification(options) {
        try {
            const now = Date.now();
            const type = options.type || 'info';
            const title = options.title || 'Notificação';
            const message = options.message || '';
            const dedupKey = `${type}|${title}|${message}`;

            // Suprimir duplicatas dentro da janela de tempo
            const last = this._recent.get(dedupKey);
            if (last && (now - last) < this._dedupWindowMs) {
                return null;
            }
            this._recent.set(dedupKey, now);
            // Limpar chaves antigas
            for (const [k, t] of Array.from(this._recent.entries())) {
                if (now - t > this._dedupWindowMs) this._recent.delete(k);
            }

            const notification = {
                id: this.generateId(),
                type,
                title,
                message,
                timestamp: new Date(),
                read: false,
                data: options.data || {},
                duration: options.duration || 5000
            };

            this.notifications.unshift(notification);

            if (this.notifications.length > this.settings.maxNotifications) {
                this.notifications = this.notifications.slice(0, this.settings.maxNotifications);
            }

            this.showToast(notification);
            this.updateNotificationPanel();
            this.updateNotificationBadge();

            if (options.sound && this.settings.soundEnabled) {
                this.playNotificationSound();
            }

            this.saveNotifications();

            return notification;
        } catch (error) {
            console.error('Erro ao mostrar notificação:', error);
        }
    }

    showToast(notification) {
        try {
            const container = document.getElementById('advanced-notification-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `advanced-toast advanced-toast-${notification.type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.innerHTML = `
                <div class="toast-content">
                    <div class="toast-icon">
                        <i class="fas ${this.getIconForType(notification.type)}"></i>
                    </div>
                    <div class="toast-body">
                        <div class="toast-title">${this.escapeHtml(notification.title)}</div>
                        <div class="toast-message">${this.escapeHtml(notification.message)}</div>
                    </div>
                    <button class="toast-close" aria-label="Fechar notificação">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="toast-progress" style="animation-duration: ${notification.duration}ms;"></div>
            `;

            // Event listeners
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideToast(toast);
                });
            }

            toast.addEventListener('click', () => {
                this.handleNotificationClick(notification);
                this.hideToast(toast);
            });

            // Adicionar ao container
            container.appendChild(toast);

            // Mostrar com animação
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            // Auto-hide
            setTimeout(() => {
                this.hideToast(toast);
            }, notification.duration);
        } catch (error) {
            console.error('Erro ao mostrar toast:', error);
        }
    }

    hideToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }

    getIconForType(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    toggleNotificationPanel() {
        const panel = document.getElementById('advanced-notification-panel');
        if (!panel) return;

        if (panel.classList.contains('show')) {
            this.hideNotificationPanel();
        } else {
            this.showNotificationPanel();
        }
    }

    showNotificationPanel() {
        const panel = document.getElementById('advanced-notification-panel');
        if (!panel) return;

        panel.classList.add('show');
        this.updateNotificationPanel();

        // Auto-marcar como lidas se configurado
        if (this.settings.autoMarkRead) {
            setTimeout(() => {
                this.markAllAsRead();
            }, 2000);
        }
    }

    hideNotificationPanel() {
        const panel = document.getElementById('advanced-notification-panel');
        if (!panel) return;

        panel.classList.remove('show');
    }

    updateNotificationPanel() {
        const list = document.getElementById('notificationPanelList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <h4>Nenhuma notificação</h4>
                    <p>Você está em dia! Não há notificações pendentes no momento.</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-panel-item ${!notification.read ? 'unread' : ''}`;
            item.setAttribute('data-notification-id', notification.id);
            item.innerHTML = `
                <div class="notification-item-icon ${notification.type}">
                    <i class="fas ${this.getIconForType(notification.type)}"></i>
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-title">${this.escapeHtml(notification.title)}</div>
                    <div class="notification-item-message">${this.escapeHtml(notification.message)}</div>
                    <div class="notification-item-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                ${!notification.read ? '<div class="notification-item-badge"></div>' : ''}
            `;

            item.addEventListener('click', () => {
                this.markAsRead(notification.id);
                this.handleNotificationClick(notification);
            });

            fragment.appendChild(item);
        });

        list.innerHTML = '';
        list.appendChild(fragment);
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationCount');
        const unreadCount = this.notifications.filter(n => !n.read).length;

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationPanel();
            this.updateNotificationBadge();
            this.saveNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationPanel();
        this.updateNotificationBadge();
        this.saveNotifications();

        this.showNotification({
            type: 'success',
            title: 'Notificações',
            message: 'Todas as notificações foram marcadas como lidas',
            duration: 3000,
            sound: false
        });
    }

    clearAllNotifications() {
        if (this.notifications.length === 0) return;

        if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
            this.notifications = [];
            this.updateNotificationPanel();
            this.updateNotificationBadge();
            this.saveNotifications();

            this.showNotification({
                type: 'info',
                title: 'Notificações',
                message: 'Todas as notificações foram removidas',
                duration: 3000,
                sound: false
            });
        }
    }

    handleNotificationClick(notification) {
        // Marcar como lida
        this.markAsRead(notification.id);

        // Ações baseadas no tipo de notificação
        if (notification.data) {
            switch (notification.title) {
                case 'Novo Chamado':
                case 'Status Atualizado':
                    // Navegar para a seção de chamados
                    this.navigateToSection('gerenciar-chamados');
                    break;
                case 'Novo Usuário':
                    // Navegar para a seção de permissões
                    this.navigateToSection('permissoes');
                    break;
                default:
                    console.log('Notificação clicada:', notification);
            }
        }
    }

    navigateToSection(sectionId) {
        // Fechar painel
        this.hideNotificationPanel();

        // Navegar para seção
        const link = document.querySelector(`a[href="#${sectionId}"]`);
        if (link) {
            link.click();
        }
    }

    playNotificationSound() {
        if (!this.settings.soundEnabled) return;

        try {
            // Criar um som simples usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Não foi possível reproduzir som de notificação:', error);
        }
    }

    updateConnectionStatus(status) {
        const statusElements = [
            document.getElementById('socketStatus'),
            document.getElementById('socketConnectionStatus')
        ];

        statusElements.forEach(element => {
            if (!element) return;

            switch (status) {
                case 'connected':
                    element.textContent = 'Conectado';
                    element.className = element.className.replace(/bg-\w+/, 'bg-success');
                    break;
                case 'disconnected':
                    element.textContent = 'Desconectado';
                    element.className = element.className.replace(/bg-\w+/, 'bg-danger');
                    break;
                case 'error':
                    element.textContent = 'Erro de Conexão';
                    element.className = element.className.replace(/bg-\w+/, 'bg-warning');
                    break;
                default:
                    element.textContent = 'Conectando...';
                    element.className = element.className.replace(/bg-\w+/, 'bg-secondary');
            }
        });
    }

    async loadRecentNotifications() {
        try {
            const response = await fetch('/ti/painel/api/notificacoes/recentes');
            if (response.ok) {
                const data = await response.json();
                console.log('Notificações recentes carregadas:', data.length);
            }
        } catch (error) {
            console.warn('Erro ao carregar notificações recentes:', error);
        }
    }

    saveNotifications() {
        try {
            const data = {
                notifications: this.notifications.slice(0, 20),
                settings: this.settings
            };
            localStorage.setItem('advanced_notifications', JSON.stringify(data));
        } catch (error) {
            console.warn('Erro ao salvar notificações:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('advanced_notifications');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.notifications) {
                    this.notifications = data.notifications;
                }
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                this.updateNotificationPanel();
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações de notificações:', error);
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveNotifications();
        
        // Atualizar configuração de som
        this.soundEnabled = this.settings.soundEnabled;
    }

    formatTime(timestamp) {
        // Garantir que timestamp seja um objeto Date
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }

        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m atrás`;
        if (hours < 24) return `${hours}h atrás`;
        if (days < 7) return `${days}d atrás`;

        return date.toLocaleDateString('pt-BR');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Métodos públicos para diferentes tipos de notificação
    showSuccess(title, message, options = {}) {
        return this.showNotification({
            type: 'success',
            title,
            message,
            sound: this.settings.soundEnabled,
            ...options
        });
    }

    showError(title, message, options = {}) {
        return this.showNotification({
            type: 'error',
            title,
            message,
            duration: 8000,
            sound: this.settings.soundEnabled,
            ...options
        });
    }

    showWarning(title, message, options = {}) {
        return this.showNotification({
            type: 'warning',
            title,
            message,
            duration: 6000,
            sound: this.settings.soundEnabled,
            ...options
        });
    }

    showInfo(title, message, options = {}) {
        return this.showNotification({
            type: 'info',
            title,
            message,
            sound: this.settings.soundEnabled,
            ...options
        });
    }

    // Método para testar notificações
    testNotifications() {
        this.showSuccess('Teste', 'Notificação de sucesso funcionando!');
        setTimeout(() => {
            this.showError('Teste', 'Notificação de erro funcionando!');
        }, 1000);
        setTimeout(() => {
            this.showWarning('Teste', 'Notificação de aviso funcionando!');
        }, 2000);
        setTimeout(() => {
            this.showInfo('Teste', 'Notificação de informação funcionando!');
        }, 3000);
    }

    // Método para reconectar socket
    reconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
            setTimeout(() => {
                this.socket.connect();
            }, 1000);
        }
    }

    // Método para destruir o sistema
    destroy() {
        if (this.socket) {
            this.socket.disconnect();
        }
        
        const container = document.getElementById('advanced-notification-container');
        const panel = document.getElementById('advanced-notification-panel');
        
        if (container) container.remove();
        if (panel) panel.remove();
        
        this.isInitialized = false;
        console.log('Sistema de notificações destruído');
    }
}

// Inicializar sistema de notificações
document.addEventListener('DOMContentLoaded', function() {
    if (!window.advancedNotificationSystem) {
        window.advancedNotificationSystem = new AdvancedNotificationSystem();
        console.log('Sistema de notificações avançado inicializado globalmente');
    }
});

// Exportar para uso global
window.AdvancedNotificationSystem = AdvancedNotificationSystem;
