// Sidebar toggle for mobile
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggle');
const mobileSidebarToggleBtn = document.getElementById('mobileSidebarToggle');

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

sidebarToggleBtn?.addEventListener('click', toggleSidebar);
mobileSidebarToggleBtn?.addEventListener('click', toggleSidebar);

// Submenu toggle - aplicado após DOM carregar
function initializeSubmenuToggles() {
    console.log('Inicializando toggles de submenu...');
    document.querySelectorAll('.sidebar nav ul li.has-submenu > a.submenu-toggle').forEach(anchor => {
        // Remover listeners antigos clonando o elemento
        const newAnchor = anchor.cloneNode(true);
        anchor.parentNode.replaceChild(newAnchor, anchor);

        newAnchor.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const parentLi = newAnchor.parentElement;
            const isOpen = parentLi.classList.contains('open');

            console.log('Toggle submenu:', newAnchor.textContent.trim(), 'isOpen:', isOpen);

            // Fechar outros submenus
            document.querySelectorAll('.sidebar nav ul li.has-submenu.open').forEach(li => {
                if (li !== parentLi) {
                    li.classList.remove('open');
                    const toggle = li.querySelector('.submenu-toggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Alternar submenu atual
            if (isOpen) {
                parentLi.classList.remove('open');
                newAnchor.setAttribute('aria-expanded', 'false');
            } else {
                parentLi.classList.add('open');
                newAnchor.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// Navigation will be initialized after DOM is loaded
let navLinks = null;
let sections = null;

function initializeNavigation() {
    console.log('=== INICIALIZANDO NAVEGAÇÃO ===');
    console.log('Timestamp:', new Date().toISOString());

    // Always re-query the DOM to ensure we have the latest elements
    navLinks = document.querySelectorAll('.sidebar nav ul li a[href^="#"]');
    sections = document.querySelectorAll('section.content-section');

    console.log('Links de navegação encontrados:', navLinks.length);
    console.log('Seções encontradas:', sections.length);

    // Debug mais detalhado se não encontrar elementos
    if (navLinks.length === 0) {
        console.error('PROBLEMA: Nenhum link de navegação encontrado!');
        console.log('Sidebar existe?', !!document.getElementById('sidebar'));
        console.log('Todos os links da sidebar:', document.querySelectorAll('.sidebar a').length);
    }

    if (sections.length === 0) {
        console.error('PROBLEMA: Nenhuma seção content-section encontrada!');
        console.log('Todas as sections do DOM:', document.querySelectorAll('section').length);
    }

    // Debug: listar todos os links encontrados
    navLinks.forEach((link, index) => {
        console.log(`Link ${index}: href="${link.getAttribute('href')}", text="${link.textContent.trim()}"`);
    });

    // Debug: listar todas as seções encontradas
    sections.forEach((section, index) => {
        console.log(`Seção ${index}: id="${section.id}", classes="${section.className}"`);
    });

    if (navLinks.length === 0) {
        console.error('ERRO: Nenhum link de navegação encontrado!');
        console.log('Tentando buscar links de forma alternativa...');
        const allLinks = document.querySelectorAll('.sidebar a');
        console.log('Total de links na sidebar:', allLinks.length);
        return;
    }

    if (sections.length === 0) {
        console.error('ERRO: Nenhuma seção encontrada!');
        return;
    }

    navLinks.forEach((link, index) => {
        // Apenas links que têm href começando com # (não submenu toggles)
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#') || href === '#') {
            return;
        }

        // Remover listeners existentes clonando
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const targetId = href.substring(1);
            console.log(`=== NAVEGAÇÃO PARA: ${targetId} ===`);

            // Verificar se a seção existe
            const targetSection = document.getElementById(targetId);
            if (!targetSection) {
                console.error('Seção não encontrada:', targetId);
                return;
            }

            // Remove active class from all navigation links
            document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Handle submenu parent activation
            const parentLi = this.closest('li.has-submenu');
            if (parentLi) {
                parentLi.classList.add('open');
                const parentToggle = parentLi.querySelector('.submenu-toggle');
                if (parentToggle) {
                    parentToggle.classList.add('active');
                    parentToggle.setAttribute('aria-expanded', 'true');
                }
            }

            // Activate the target section
            activateSection(targetId);

            // Update URL hash
            window.location.hash = targetId;
        });
    });

    // Add hashchange listener
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            activateSection(hash);

            // Update active classes
            navLinks.forEach(link => link.classList.remove('active'));

            // Find and activate corresponding link
            const targetLink = document.querySelector(`.sidebar a[href="#${hash}"]`);
            if (targetLink) {
                targetLink.classList.add('active');

                // If it's a submenu item, also activate parent link
                const submenu = targetLink.closest('.submenu');
                if (submenu) {
                    const parentLink = submenu.previousElementSibling;
                    if (parentLink) {
                        parentLink.classList.add('active');
                        parentLink.parentElement.classList.add('open');
                    }
                }
            }
        }
    });

    // Add accessibility support for menu items
    document.querySelectorAll('.sidebar nav ul li').forEach(item => {
        item.addEventListener('keydown', function(e) {
            // Enter or space activates the item
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('a');
                if (link) link.click();
            }
        });
    });

    // Improve submenu accessibility
    document.querySelectorAll('.has-submenu').forEach(item => {
        const toggle = item.querySelector('.submenu-toggle');
        const submenu = item.querySelector('.submenu');

        if (toggle && submenu) {
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', !isExpanded);
                    item.classList.toggle('open');
                }
            });
        }
    });

    console.log('Navegação inicializada com sucesso');
}

function activateSection(id) {
    console.log('=== ATIVANDO SEÇÃO ===');
    console.log('ID solicitado:', id);

    // Always query sections fresh to ensure we have the latest DOM state
    const allSections = document.querySelectorAll('section.content-section');

    if (!allSections || allSections.length === 0) {
        console.error('ERRO: Nenhuma seção encontrada!');
        return;
    }

    console.log(`Encontradas ${allSections.length} seções. Procurando se��ão: ${id}`);
    console.log('Seções disponíveis:', Array.from(allSections).map(s => `${s.id} (classes: ${s.className})`));

    let sectionFound = false;

    allSections.forEach((section, index) => {
        console.log(`Verificando seção ${index}: id="${section.id}"`);

        if (section.id === id) {
            console.log(`✅ MATCH! Ativando seção: ${id}`);

            // Remover classe active de todas as outras se��ões primeiro
            allSections.forEach(s => {
                if (s !== section) {
                    s.classList.remove('active');
                    s.removeAttribute('tabindex');
                }
            });

            // Ativar a seção alvo
            section.classList.add('active');
            section.setAttribute('tabindex', '0');

            // Debug: verificar se a classe foi aplicada
            console.log('Classes da seção após ativa��ão:', section.className);
            console.log('Display computed style:', window.getComputedStyle(section).display);

            sectionFound = true;

            // Scroll to top of main content
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.scrollTop = 0;
                console.log('Scroll resetado para o topo');
            } else {
                console.warn('mainContent não encontrado');
            }

            // Load section-specific content with delay
            setTimeout(() => {
                console.log('Carregando conteúdo específico da seção...');
                loadSectionContent(id);
            }, 100);

        } else {
            // Debug para outras seções
            console.log(`⏩ Desativando seção: ${section.id}`);
            section.classList.remove('active');
            section.removeAttribute('tabindex');
        }
    });

    if (!sectionFound) {
        console.error(`❌ ERRO: Seção com ID '${id}' não foi encontrada no DOM!`);
        console.log('Seções disponíveis:', Array.from(allSections).map(s => s.id));

        // Tentar ativar seção padrão como fallback
        console.log('Tentando ativar seção padrão: visao-geral');
        const defaultSection = document.getElementById('visao-geral');
        if (defaultSection) {
            defaultSection.classList.add('active');
            console.log('Seção padrão ativada como fallback');
        }
    } else {
        console.log('✅ SEÇÃO ATIVADA COM SUCESSO:', id);
    }
}

// Funções de Debug
window.debugNavigation = function() {
    console.log('=== DEBUG DE NAVEGAÇÃO ===');

    const sidebar = document.getElementById('sidebar');
    const sections = document.querySelectorAll('section.content-section');
    const navLinks = document.querySelectorAll('.sidebar nav ul li a[href^="#"]');

    console.log('Sidebar encontrada:', !!sidebar);
    console.log('Seções encontradas:', sections.length);
    console.log('Links de navegação encontrados:', navLinks.length);

    console.log('=== SEÇÕES DISPONÍVEIS ===');
    sections.forEach((section, index) => {
        const isActive = section.classList.contains('active');
        const display = window.getComputedStyle(section).display;
        console.log(`${index + 1}. ID: "${section.id}" | Ativa: ${isActive} | Display: ${display}`);
    });

    console.log('=== LINKS DE NAVEGAÇÃO ===');
    navLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const isActive = link.classList.contains('active');
        const text = link.textContent.trim();
        console.log(`${index + 1}. href: "${href}" | Ativo: ${isActive} | Texto: "${text}"`);
    });

    // Mostrar painel de debug
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    }
};

window.testNavigationTo = function(sectionId) {
    console.log(`=== TESTE DE NAVEGAÇÃO PARA: ${sectionId} ===`);

    // Verificar se a seção existe
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.error(`Seção "${sectionId}" não encontrada!`);
        return false;
    }

    // Tentar ativar a seção
    activateSection(sectionId);

    // Ativar link correspondente
    const navLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
    if (navLink) {
        document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));
        navLink.classList.add('active');
        console.log('Link de navegação ativado');
    } else {
        console.warn(`Link de navegação para "${sectionId}" não encontrado`);
    }

    // Atualizar hash
    window.location.hash = sectionId;

    console.log('Teste de navegação concluído');
    return true;
};

// Theme toggle
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// Variáveis globais para chamados
let chamadosData = [];
const chamadosPerPage = 6;
let currentPage = 1;
let currentFilter = 'all';

const chamadosGrid = document.getElementById('chamadosGrid');
const pagination = document.getElementById('pagination');

// Fun��ão para carregar os chamados da API
async function loadChamados() {
    try {
        // Mostrar estado de carregamento
        if (chamadosGrid) {
            chamadosGrid.innerHTML = '<div class="text-center py-4" style="grid-column: 1 / -1;"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Carregando chamados...</div></div>';
        }

        // Montar URL com parâmetros de performance: light e limit
        const url = new URL('/ti/painel/api/chamados', window.location.origin);
        url.searchParams.set('light', '1');
        url.searchParams.set('limit', '200');
        if (currentFilter && currentFilter !== 'all') {
            url.searchParams.set('status', currentFilter);
        }

        const response = await fetch(url.toString(), {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Erro ao carregar chamados: ${response.status} ${response.statusText}`);
        }

        chamadosData = await response.json();
        currentPage = 1;
        renderChamadosPage(currentPage);

        // Atualizar contadores da visão geral
        atualizarContadoresVisaoGeral();

        // Popular filtros dinâmicos
        popularFiltrosDinamicos();
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        if (chamadosGrid) {
            chamadosGrid.innerHTML = '<p class="text-center py-4" style="grid-column: 1 / -1;">Erro ao carregar chamados. Tente novamente mais tarde.</p>';
        }
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar chamados');
        }
    }
}

// Funç���o para popular filtros com dados dinâmicos
function popularFiltrosDinamicos() {
    // Popular filtro de unidades
    const filtroUnidade = document.getElementById('filtroUnidade');
    if (filtroUnidade && chamadosData.length > 0) {
        const unidades = [...new Set(chamadosData.map(c => c.unidade))].sort();

        // Limpar opções existentes (exceto a primeira)
        while (filtroUnidade.children.length > 1) {
            filtroUnidade.removeChild(filtroUnidade.lastChild);
        }

        unidades.forEach(unidade => {
            const option = document.createElement('option');
            option.value = unidade;
            option.textContent = unidade;
            filtroUnidade.appendChild(option);
        });
    }

    // Popular filtro de agentes respons��veis
    const filtroAgenteResponsavel = document.getElementById('filtroAgenteResponsavel');
    if (filtroAgenteResponsavel && chamadosData.length > 0) {
        const agentes = chamadosData
            .filter(c => c.agente)
            .map(c => ({id: c.agente.id, nome: c.agente.nome}))
            .reduce((acc, agente) => {
                if (!acc.find(a => a.id === agente.id)) {
                    acc.push(agente);
                }
                return acc;
            }, [])
            .sort((a, b) => a.nome.localeCompare(b.nome));

        // Limpar opções existentes (exceto a primeira)
        while (filtroAgenteResponsavel.children.length > 1) {
            filtroAgenteResponsavel.removeChild(filtroAgenteResponsavel.lastChild);
        }

        agentes.forEach(agente => {
            const option = document.createElement('option');
            option.value = agente.id;
            option.textContent = agente.nome;
            filtroAgenteResponsavel.appendChild(option);
        });
    }
}

// Função para atualizar contadores da visão geral
async function atualizarContadoresVisaoGeral() {
    try {
        console.log('Atualizando contadores da visão geral...');
        const response = await fetch('/ti/painel/api/chamados/estatisticas', {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            console.error('Erro na resposta:', response.status, response.statusText);
            throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
        }
        const stats = await response.json();

        const countAbertos = document.getElementById('countAbertos');
        const countAguardando = document.getElementById('countAguardando');
        const countConcluidos = document.getElementById('countConcluidos');
        const countCancelados = document.getElementById('countCancelados');

        if (countAbertos) countAbertos.textContent = stats.Aberto || 0;
        if (countAguardando) countAguardando.textContent = stats.Aguardando || 0;
        if (countConcluidos) countConcluidos.textContent = stats.Concluido || 0;
        if (countCancelados) countCancelados.textContent = stats.Cancelado || 0;

        console.log('Contadores atualizados:', stats);
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Usar dados locais se disponíveis
        if (chamadosData && chamadosData.length > 0) {
            const localStats = {
                Aberto: chamadosData.filter(c => c.status === 'Aberto').length,
                Aguardando: chamadosData.filter(c => c.status === 'Aguardando').length,
                Concluido: chamadosData.filter(c => c.status === 'Concluido').length,
                Cancelado: chamadosData.filter(c => c.status === 'Cancelado').length
            };

            const countAbertos = document.getElementById('countAbertos');
            const countAguardando = document.getElementById('countAguardando');
            const countConcluidos = document.getElementById('countConcluidos');
            const countCancelados = document.getElementById('countCancelados');

            if (countAbertos) countAbertos.textContent = localStats.Aberto;
            if (countAguardando) countAguardando.textContent = localStats.Aguardando;
            if (countConcluidos) countConcluidos.textContent = localStats.Concluido;
            if (countCancelados) countCancelados.textContent = localStats.Cancelado;

            console.log('Usando dados locais para estatísticas:', localStats);
        } else {
            console.log('Nenhum dado disponível para estatísticas');
        }
    }
}

// Função para filtrar chamados
function filterChamados(status) {
    let filtrados = [...chamadosData];

    // Filtrar por status
    if (status !== 'all') {
        filtrados = filtrados.filter(chamado => chamado.status === status);
    }

    // Aplicar filtros avançados se estiverem ativos
    filtrados = aplicarFiltrosAvancados(filtrados);

    return filtrados;
}

// Função para aplicar filtros avançados
function aplicarFiltrosAvancados(chamados) {
    let filtrados = [...chamados];

    // Filtro por solicitante
    const filtroSolicitante = document.getElementById('filtroSolicitante');
    if (filtroSolicitante && filtroSolicitante.value.trim()) {
        const termo = filtroSolicitante.value.trim().toLowerCase();
        filtrados = filtrados.filter(chamado =>
            chamado.solicitante && chamado.solicitante.toLowerCase().includes(termo)
        );
    }

    // Filtro por problema
    const filtroProblema = document.getElementById('filtroProblema');
    if (filtroProblema && filtroProblema.value.trim()) {
        const termo = filtroProblema.value.trim().toLowerCase();
        filtrados = filtrados.filter(chamado =>
            chamado.problema && chamado.problema.toLowerCase().includes(termo)
        );
    }

    // Filtro por prioridade
    const filtroPrioridade = document.getElementById('filtroPrioridade');
    if (filtroPrioridade && filtroPrioridade.value) {
        filtrados = filtrados.filter(chamado =>
            chamado.prioridade === filtroPrioridade.value
        );
    }

    // Filtro por agente responsável
    const filtroAgenteResponsavel = document.getElementById('filtroAgenteResponsavel');
    if (filtroAgenteResponsavel && filtroAgenteResponsavel.value) {
        const agenteId = filtroAgenteResponsavel.value;
        if (agenteId === 'sem_agente') {
            filtrados = filtrados.filter(chamado => !chamado.agente_id);
        } else {
            filtrados = filtrados.filter(chamado =>
                chamado.agente_id && chamado.agente_id.toString() === agenteId
            );
        }
    }

    // Filtro por unidade
    const filtroUnidade = document.getElementById('filtroUnidade');
    if (filtroUnidade && filtroUnidade.value) {
        filtrados = filtrados.filter(chamado =>
            chamado.unidade === filtroUnidade.value
        );
    }

    // Filtro por data de início
    const filtroDataInicio = document.getElementById('filtroDataInicio');
    if (filtroDataInicio && filtroDataInicio.value) {
        const dataInicio = new Date(filtroDataInicio.value);
        filtrados = filtrados.filter(chamado => {
            if (!chamado.data_abertura) return false;
            try {
                let dataChamado;
                if (chamado.data_abertura.includes('/')) {
                    const [data, hora] = chamado.data_abertura.split(' ');
                    const [dia, mes, ano] = data.split('/');
                    dataChamado = new Date(ano, mes - 1, dia);
                } else {
                    dataChamado = new Date(chamado.data_abertura);
                }
                return dataChamado >= dataInicio;
            } catch (error) {
                console.error('Erro ao converter data:', error, chamado.data_abertura);
                return false;
            }
        });
    }

    // Filtro por data fim
    const filtroDataFim = document.getElementById('filtroDataFim');
    if (filtroDataFim && filtroDataFim.value) {
        const dataFim = new Date(filtroDataFim.value);
        dataFim.setHours(23, 59, 59, 999); // Incluir todo o dia final
        filtrados = filtrados.filter(chamado => {
            if (!chamado.data_abertura) return false;
            try {
                let dataChamado;
                if (chamado.data_abertura.includes('/')) {
                    const [data, hora] = chamado.data_abertura.split(' ');
                    const [dia, mes, ano] = data.split('/');
                    dataChamado = new Date(ano, mes - 1, dia);
                } else {
                    dataChamado = new Date(chamado.data_abertura);
                }
                return dataChamado <= dataFim;
            } catch (error) {
                console.error('Erro ao converter data:', error, chamado.data_abertura);
                return false;
            }
        });
    }

    return filtrados;
}

// Função para atualizar o status de um chamado
async function updateChamadoStatus(chamadoId, novoStatus) {
    try {
        // Primeiro atualiza o status
        const response = await fetch(`/ti/painel/api/chamados/${chamadoId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar status');
        }

        const data = await response.json();

        // Atualiza o histórico local se fornecido
        if (data && data.historico) {
            const ch = chamadosData.find(c => c.id == chamadoId);
            if (ch) ch.historico = data.historico;
        }

        // Se o status foi atualizado com sucesso e é um dos status que requer notificação
        if (['Aguardando', 'Cancelado', 'Concluido'].includes(novoStatus)) {
            // Envia a notificação
            const notificacaoResponse = await fetch(`/ti/painel/api/chamados/${chamadoId}/notificar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: novoStatus,
                    chamadoId: chamadoId
                })
            });

            if (!notificacaoResponse.ok) {
                console.error('Erro ao enviar notifica��ão:', await notificacaoResponse.text());
                throw new Error('Erro ao enviar notificação por e-mail');
            }
        }

        // Atualiza o chamado na lista local
        const chamado = chamadosData.find(c => c.id == chamadoId);
        if (chamado) {
            chamado.status = novoStatus;
        }

        return data;
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
    }
}

// Função para renderizar a p��gina de chamados
function renderChamadosPage(page) {
    chamadosGrid.innerHTML = '';
    const start = (page - 1) * chamadosPerPage;
    const end = start + chamadosPerPage;
    const filteredChamados = filterChamados(currentFilter);
    const pageChamados = filteredChamados.slice(start, end);

    if (pageChamados.length === 0) {
        chamadosGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h4>Nenhum chamado encontrado</h4>
                <p>Não há chamados com os filtros selecionados</p>
                <button class="btn btn-outline-secondary" onclick="limparTodosFiltros()">
                    <i class="fas fa-times me-1"></i>Limpar Filtros
                </button>
            </div>
        `;
        pagination.innerHTML = '';
        return;
    }

    // Montar conteúdo em lote para minimizar reflows
    const fragment = document.createDocumentFragment();

    pageChamados.forEach(chamado => {
        const card = document.createElement('div');
        card.className = 'chamado-card';
        card.tabIndex = 0;

        const statusClass = (chamado.status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const statusIcon = {
            'aberto': 'fa-circle-notch',
            'aguardando': 'fa-clock',
            'concluido': 'fa-check-circle',
            'cancelado': 'fa-times-circle'
        }[statusClass] || 'fa-circle';

        card.innerHTML = `
    <div class="card-header">
        <h3>${chamado.codigo}</h3>
        <div class="status-badge status-${statusClass}">
            <i class="fas ${statusIcon}"></i>
            ${chamado.status}
        </div>
    </div>
    <div class="card-body">
        <div class="info-row">
            <strong>Solicitante:</strong>
            <span>${chamado.solicitante || ''}</span>
        </div>
        <div class="info-row">
            <strong>Problema:</strong>
            <span>${chamado.problema || ''}</span>
        </div>
        <div class="info-row">
            <strong>Unidade:</strong>
            <span>${chamado.unidade || ''}</span>
        </div>
        <div class="info-row">
            <strong>Data:</strong>
            <span>${formatarData(chamado.data_abertura)}</span>
        </div>
        <div class="info-row">
            <strong>Agente:</strong>
            ${chamado.agente ? `
                <span class="badge bg-info">${chamado.agente.nome}</span>
                <button class="btn btn-sm btn-outline-warning ms-2" data-action="alterar-agente" data-id="${chamado.id}" title="Alterar agente">
                    <i class="fas fa-user-edit"></i>
                </button>
            ` : `
                <button class="btn btn-sm btn-success" data-action="atribuir-agente" data-id="${chamado.id}" title="Atribuir agente">
                    <i class="fas fa-user-plus"></i> Atribuir
                </button>
            `}
        </div>
    </div>
    <div class="card-footer">
        <select id="status-${chamado.id}">
            <option value="Aberto" ${chamado.status === 'Aberto' ? 'selected' : ''}>Aberto</option>
            <option value="Aguardando" ${chamado.status === 'Aguardando' ? 'selected' : ''}>Aguardando</option>
            <option value="Concluido" ${chamado.status === 'Concluido' ? 'selected' : ''}>Concluído</option>
            <option value="Cancelado" ${chamado.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
        <button class="btn btn-update-sm" data-id="${chamado.id}" title="Atualizar status">
            <i class="fas fa-save"></i> Atualizar
        </button>
        <button class="btn btn-danger-sm" data-id="${chamado.id}" title="Excluir chamado">
            <i class="fas fa-trash"></i> Excluir
        </button>
        <button class="btn btn-ticket-sm" data-id="${chamado.id}" title="Enviar ticket">
            <i class="fas fa-envelope"></i> Ticket
        </button>
    </div>`;

        // Prefetch on hover/focus
        card.addEventListener('mouseenter', () => prefetchTimeline(chamado.id));
        card.addEventListener('focus', () => prefetchTimeline(chamado.id));
        // Clique no card abre modal (exceto elementos interativos)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.card-footer') && !e.target.closest('.status-badge') && !e.target.closest('button')) {
                openModal(chamado);
            }
        });

        fragment.appendChild(card);
    });

    chamadosGrid.appendChild(fragment);

    renderPagination(filteredChamados.length);
    attachCardEventListeners();
}

function formatarData(dataString) {
    if (!dataString) return 'Não informado';
    const [data, hora] = dataString.split(' ');
    const [dia, mes, ano] = data.split('/');
    return `${dia}/${mes}/${ano}`;
}

// Funç��o para renderizar a paginação
function renderPagination(totalItems) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / chamadosPerPage);

    function createPageButton(num, active = false) {
        const btn = document.createElement('button');
        btn.textContent = num;
        btn.disabled = active;
        if (active) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = num;
            renderChamadosPage(currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return btn;
    }

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '«';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderChamadosPage(currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    pagination.appendChild(prevBtn);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(startPage + 4, totalPages);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageButton(i, i === currentPage));
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '»';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderChamadosPage(currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    pagination.appendChild(nextBtn);
}

// Função para anexar event listeners aos cards de chamados
let chamadosHandlersBound = false;
function attachCardEventListeners() {
    if (chamadosHandlersBound) return;
    chamadosHandlersBound = true;

    // Delegar mudança de status
    chamadosGrid.addEventListener('change', async function(e) {
        const el = e.target;
        if (el && el.matches('select[id^="status-"]')) {
            e.stopPropagation();
            const chamadoId = el.id.replace('status-', '');
            const novoStatus = el.value;
            try {
                await updateChamadoStatus(chamadoId, novoStatus);
                const mensagem = `Status atualizado para "${novoStatus}"${['Aguardando','Cancelado','Concluido'].includes(novoStatus) ? '. E-mail enviado ao solicitante.' : ''}`;
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showSuccess('Status Atualizado', mensagem);
                }
            } catch (error) {
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showError('Erro', error.message);
                }
                const chamado = chamadosData.find(c => c.id == chamadoId);
                if (chamado) el.value = chamado.status;
            }
        }
    });

    // Delegar cliques em botões
    chamadosGrid.addEventListener('click', async function(e) {
        const btn = e.target.closest('.btn-update-sm, .btn-danger-sm, .btn-ticket-sm, [data-action="atribuir-agente"], [data-action="alterar-agente"]');
        if (!btn) return;
        e.stopPropagation();
        const chamadoId = btn.dataset.id;

        if (btn.classList.contains('btn-update-sm')) {
            const statusSelect = document.getElementById(`status-${chamadoId}`);
            const novoStatus = statusSelect ? statusSelect.value : null;
            try {
                await updateChamadoStatus(chamadoId, novoStatus);
                const mensagem = `Status atualizado para "${novoStatus}"${['Aguardando','Cancelado','Concluido'].includes(novoStatus) ? '. E-mail enviado ao solicitante.' : ''}`;
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showSuccess('Status Atualizado', mensagem);
                }
                renderChamadosPage(currentPage);
            } catch (error) {
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showError('Erro', error.message);
                }
            }
            return;
        }

        if (btn.classList.contains('btn-danger-sm')) {
            await excluirChamado(chamadoId);
            return;
        }

        if (btn.classList.contains('btn-ticket-sm')) {
            const chamado = chamadosData.find(c => c.id == chamadoId);
            if (chamado) {
                openTicketModal(chamado);
            } else if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showError('Erro', 'Chamado não encontrado.');
            }
            return;
        }

        if (btn.dataset.action === 'atribuir-agente') {
            if (typeof atribuirAgente === 'function') atribuirAgente(chamadoId);
            return;
        }
        if (btn.dataset.action === 'alterar-agente') {
            if (typeof alterarAgente === 'function') alterarAgente(chamadoId);
            return;
        }
    });
}

// Event listener para os links do submenu de gerenciar chamados - será inicializado na função de setup
function initializeSubmenuListeners() {
    const submenuLinks = document.querySelectorAll('#submenu-gerenciar-chamados a');

    submenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const status = this.getAttribute('data-status');

            currentFilter = status;
            currentPage = 1;
            // Recarregar do servidor já filtrado por status para reduzir carga
            loadChamados();
            activateSection('gerenciar-chamados');

            // Atualizar o item ativo no menu
            document.querySelectorAll('.sidebar a.active').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            const parentSubmenuToggle = this.closest('.submenu').previousElementSibling;
            if (parentSubmenuToggle) parentSubmenuToggle.classList.add('active');
        });
    });
}

// Modal Chamado - Elementos
const modal = document.getElementById('modalChamado');
const modalCloseBtn = document.getElementById('modalClose');
const modalCancelBtn = document.getElementById('modalCancel');
const modalSaveBtn = document.getElementById('modalSave');
const modalSendTicketBtn = document.getElementById('modalSendTicket');

const modalCodigo = document.getElementById('modalCodigo');
const modalProtocolo = document.getElementById('modalProtocolo');
const modalSolicitante = document.getElementById('modalSolicitante');
const modalCargo = document.getElementById('modalCargo');
const modalTelefone = document.getElementById('modalTelefone');
const modalUnidade = document.getElementById('modalUnidade');
const modalProblema = document.getElementById('modalProblema');
const modalDescricao = document.getElementById('modalDescricao');
const modalVisita = document.getElementById('modalVisita');
const modalData = document.getElementById('modalData');
const modalStatusSelect = document.getElementById('modalStatus');

let currentModalChamadoId = null;

// Timeline cache e controle de fetch
const timelineCache = new Map();
const timelineControllers = new Map();

async function prefetchTimeline(chamadoId) {
    try {
        const cached = timelineCache.get(chamadoId) || {};
        const prev = timelineControllers.get(chamadoId);
        if (prev) prev.abort();
        const controller = new AbortController();
        timelineControllers.set(chamadoId, controller);
        const headers = { 'Accept': 'application/json' };
        if (cached.etag) headers['If-None-Match'] = cached.etag;
        if (cached.lastModified) headers['If-Modified-Since'] = cached.lastModified;
        const resp = await fetch(`/ti/api/chamados/${chamadoId}/timeline?limit=200`, { headers, signal: controller.signal });
        if (resp.status === 304 && cached.events) return cached.events;
        if (resp.ok) {
            const events = await resp.json();
            const etag = resp.headers.get('ETag') || cached.etag;
            const lastModified = resp.headers.get('Last-Modified') || cached.lastModified;
            timelineCache.set(chamadoId, { events, etag, lastModified });
            return events;
        }
    } catch (e) {
        if (e.name !== 'AbortError') console.warn('Prefetch timeline falhou:', e);
    }
    return null;
}

(function initTimelineSocket(){
    try {
        if (typeof io === 'undefined') return;
        const socket = io();
        window.__timelineSocket = socket;
        socket.on('connect', () => {
            if (currentModalChamadoId) {
                socket.emit('subscribe_timeline', { chamado_id: currentModalChamadoId });
            }
        });
        socket.on('timeline_update', (payload) => {
            const cid = payload?.chamado_id;
            if (!cid) return;
            const cached = timelineCache.get(cid);
            if (cached?.events) {
                cached.events = [...cached.events, payload];
                timelineCache.set(cid, cached);
                if (cid === currentModalChamadoId) {
                    const timelineList = document.getElementById('timelineList');
                    if (timelineList) {
                        const icon = payload.tipo === 'created' ? 'fa-plus-circle' : payload.tipo === 'status_change' ? 'fa-exchange-alt' : payload.tipo?.startsWith('attachment_') ? 'fa-paperclip' : payload.tipo === 'ticket_sent' ? 'fa-envelope' : 'fa-stream';
                        const when = payload.criado_em ? `<span class="timestamp">${payload.criado_em}</span>` : '';
                        const whoName = payload.usuario_nome ? `<span class="sender-name">${payload.usuario_nome}</span>` : '<span class="sender-name">Sistema</span>';
                        const senderType = payload.autor_tipo || (payload.tipo === 'attachment_received' ? 'Solicitante' : (payload.tipo === 'attachment_sent' || payload.tipo === 'ticket_sent' || payload.tipo === 'status_change') ? 'Suporte' : 'Sistema');
                        const badge = `<span class="sender-badge ${senderType==='Suporte' ? 'badge-suporte' : senderType==='Solicitante' ? 'badge-solicitante' : 'badge-sistema'}">${senderType}</span>`;
                        const li = document.createElement('li');
                        li.className = `timeline-item ${senderType==='Suporte' ? 'from-suporte' : senderType==='Solicitante' ? 'from-solicitante' : 'from-sistema'}`;
                        li.innerHTML = `
                          <div class="timeline-header">
                            ${badge}
                            ${whoName}
                            <span class="spacer"></span>
                            ${when}
                          </div>
                          <div class="timeline-body">
                            <i class="fas ${icon} history-icon"></i>
                            <span>${payload.tipo}</span>
                          </div>`;
                        timelineList.appendChild(li);
                    }
                }
            }
        });
    } catch(e) { console.warn('Socket timeline indisponível', e); }
})();

let enviarTicketLoaded = false;
async function ensureEnviarTicketLoaded() {
    if (enviarTicketLoaded) return;
    await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = '/static/ti/js/painel/enviar_ticket.js';
        s.async = true;
        s.onload = () => { enviarTicketLoaded = true; resolve(); };
        s.onerror = () => reject(new Error('Falha ao carregar enviar_ticket.js'));
        document.body.appendChild(s);
    });
}

// Funções do Modal de Chamados
async function openModal(chamado) {
    currentModalChamadoId = chamado.id;
    modalCodigo.textContent = chamado.codigo;
    modalProtocolo.textContent = chamado.protocolo;
    modalSolicitante.textContent = chamado.solicitante;
    modalCargo.textContent = chamado.cargo;
    modalTelefone.textContent = chamado.telefone;
    modalUnidade.textContent = chamado.unidade;
    modalProblema.textContent = chamado.problema;
    modalDescricao.textContent = chamado.descricao;
    modalVisita.textContent = chamado.visita_tecnica ? 'Sim' : 'Não';
    modalData.textContent = chamado.data_abertura.split(' ')[0];
    modalStatusSelect.value = chamado.status;

    // Mostrar o modal imediatamente para feedback rápido
    modal.classList.add('active');

    // Histórico na aba: carregar de forma assíncrona
    const timelineList = document.getElementById('timelineList');
    if (timelineList) {
        // placeholder (skeletons)
        timelineList.innerHTML = Array.from({length: 3}).map(() => '<li class="skeleton-line"><span>&nbsp;</span></li>').join('');

        const items = [];

        function fileNameFrom(url, nome) {
            if (nome) return nome;
            try { const u = new URL(url, window.location.origin); return decodeURIComponent(u.pathname.split('/').pop()); } catch (_) { return url || ''; }
        }

        try {
            let eventos = timelineCache.get(chamado.id)?.events;
            if (!eventos) {
                eventos = await prefetchTimeline(chamado.id) || [];
            }
            if (Array.isArray(eventos)) {

                // Ordenar por data (mais antigo -> mais recente)
                const parseD = s => Date.parse((s || '').replace(' ', 'T')) || 0;
                eventos.sort((a, b) => parseD(a.criado_em) - parseD(b.criado_em));

                // Remover duplicados por tipo+timestamp+anexo
                const seen = new Set();
                eventos.forEach(ev => {
                    const key = `${ev.tipo}-${ev.criado_em}-${ev.anexo?.nome || ''}`;
                    if (seen.has(key)) return;
                    seen.add(key);

                    let icon = 'fa-stream';
                    let label = ev.descricao || '';
                    if (!label) {
                        if (ev.tipo === 'created') label = 'Chamado criado';
                        else if (ev.tipo === 'status_change') label = 'Status alterado';
                        else if (ev.tipo === 'attachment_received') label = 'Anexo do solicitante';
                        else if (ev.tipo === 'attachment_sent') label = 'Anexo do suporte';
                        else if (ev.tipo === 'ticket_sent') label = 'Ticket enviado';
                    }
                    if (ev.tipo === 'created') icon = 'fa-plus-circle';
                    else if (ev.tipo === 'status_change') icon = 'fa-exchange-alt';
                    else if (ev.tipo === 'attachment_received') icon = 'fa-paperclip';
                    else if (ev.tipo === 'attachment_sent') icon = 'fa-paperclip';
                    else if (ev.tipo === 'ticket_sent') icon = 'fa-envelope';

                    const senderType = ev.autor_tipo || (ev.tipo === 'attachment_received' ? 'Solicitante' : (ev.tipo === 'attachment_sent' || ev.tipo === 'ticket_sent' || ev.tipo === 'status_change') ? 'Suporte' : 'Sistema');
                    const whoBadge = `<span class="sender-badge ${senderType==='Suporte' ? 'badge-suporte' : senderType==='Solicitante' ? 'badge-solicitante' : 'badge-sistema'}">${senderType}</span>`;
                    const whoName = `<span class="sender-name">${ev.usuario_nome || 'Sistema'}</span>`;
                    const when = ev.criado_em ? `<span class="timestamp">${ev.criado_em}</span>` : '';
                    const anexoHtml = ev.anexo ? ` <a href="${ev.anexo.url}" target="_blank" rel="noopener">${fileNameFrom(ev.anexo.url, ev.anexo.nome)}</a>` : '';

                    let extra = '';
                    if (ev.tipo === 'ticket_sent' && ev.metadados) {
                        const md = ev.metadados;
                        const assunto = md.assunto ? `<div><strong>${md.assunto}</strong></div>` : '';
                        const msg = md.mensagem ? `<div class="text-wrap">${(md.mensagem || '').replace(/\n/g,'<br>')}</div>` : '';
                        extra = `${assunto}${msg}`;
                    }

                    items.push(`
                        <li class="timeline-item ${senderType==='Suporte' ? 'from-suporte' : senderType==='Solicitante' ? 'from-solicitante' : 'from-sistema'}">
                          <div class="timeline-header">
                            ${whoBadge}
                            ${whoName}
                            <span class="spacer"></span>
                            ${when}
                          </div>
                          <div class="timeline-body">
                            <i class="fas ${icon} history-icon"></i>
                            <span>${label}${anexoHtml}${extra ? '<div class="mt-1">'+extra+'</div>' : ''}</span>
                          </div>
                        </li>`);
                });
            }
        } catch (e) {
            console.warn('Falha ao carregar timeline:', e);
        }

        // Fallback simples caso a API não retorne eventos
        if (items.length === 0) {
            const fallback = [];
            if (chamado.data_abertura) fallback.push(`<li><i class=\"fas fa-plus-circle history-icon\"></i><span>Chamado aberto - ${chamado.data_abertura}</span></li>`);
            if (Array.isArray(chamado.anexos)) {
                chamado.anexos.forEach(ax => {
                    const size = ax.tamanho_kb ? ` (${ax.tamanho_kb} KB)` : '';
                    fallback.push(`<li><i class=\"fas fa-paperclip history-icon\"></i><span>Anexo do solicitante: <a href=\"${ax.url}\" target=\"_blank\" rel=\"noopener\">${ax.nome || fileNameFrom(ax.url)}</a>${size}</span></li>`);
                });
            }
            timelineList.innerHTML = fallback.join('');
        } else {
            timelineList.innerHTML = items.join('');
        }
    }

    // Tabs: utilizar Bootstrap (data-bs-toggle). Nenhuma ação extra necessária aqui.
}

function closeModal() {
    modal.classList.remove('active');
    currentModalChamadoId = null;
}

// Event Listeners do Modal de Chamados
modalCloseBtn.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});

// No modalSaveBtn
modalSaveBtn.addEventListener('click', async () => {
    if (!currentModalChamadoId) {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Nenhum chamado selecionado.');
        }
        return;
    }
    
    const novoStatus = modalStatusSelect.value;
    
    try {
        await updateChamadoStatus(currentModalChamadoId, novoStatus);
        closeModal();
        const mensagem = `Status atualizado para "${novoStatus}"${novoStatus === 'Aguardando' || novoStatus === 'Cancelado' || novoStatus === 'Concluido' ? '. E-mail enviado ao solicitante.' : ''}`;
        
        // Usar sistema de notificações avançado
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Status Atualizado', mensagem);
        }
        renderChamadosPage(currentPage); // Atualiza a visualização
    } catch (error) {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
});

modalSendTicketBtn.addEventListener('click', async () => {
    if (!currentModalChamadoId) {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Nenhum chamado selecionado.');
        }
        return;
    }
    
    const chamado = chamadosData.find(c => c.id == currentModalChamadoId);
    if (chamado) {
        try {
            await ensureEnviarTicketLoaded();
            openTicketModal(chamado);
        } catch (e) {
            if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showError('Erro', e.message);
            }
        }
    } else {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Chamado não encontrado.');
        }
    }
    ;
});

// Funcionalidades de Usuário
// Função para gerar nome de usuário automaticamente
function gerarNomeUsuario() {
    const nome = document.getElementById('nomeUsuario').value.trim().toLowerCase();
    const sobrenome = document.getElementById('sobrenomeUsuario').value.trim().toLowerCase();

    if (nome && sobrenome) {
        // Remove acentos e caracteres especiais
        const nomeNormalizado = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const sobrenomeNormalizado = sobrenome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Gera o nome de usuário
        const usuario = `${nomeNormalizado.split(' ')[0]}.${sobrenomeNormalizado.split(' ')[0]}`;
        document.getElementById('usuarioLogin').value = usuario;
    }
}

// Event listener para botão de gerar usuário automaticamente
document.getElementById('btnGerarUsuario')?.addEventListener('click', function() {
    gerarNomeUsuario();
    if (window.advancedNotificationSystem) {
        window.advancedNotificationSystem.showInfo('Nome de usuário gerado', 'Nome de usuário gerado automaticamente baseado no nome e sobrenome.');
    }
});

// Não gerar automaticamente mais - só quando clicar no botão
// document.getElementById('nomeUsuario')?.addEventListener('input', gerarNomeUsuario);
// document.getElementById('sobrenomeUsuario')?.addEventListener('input', gerarNomeUsuario);

// Prevenir comportamento padrão dos selects e detectar Agente de Suporte
document.getElementById('nivelAcesso')?.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Detectar quando usu��rio seleciona "Agente de Suporte"
document.getElementById('nivelAcesso')?.addEventListener('change', function(e) {
    if (this.value === 'Agente de Suporte') {
        // Automaticamente criar agente de suporte após criar o usuário
        console.log('Nível "Agente de Suporte" selecionado - agente será criado automaticamente');
    }
});

document.getElementById('setorUsuario')?.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Função para gerar senha
async function gerarSenha() {
    try {
        const response = await fetch('/ti/painel/api/gerar-senha');
        if (!response.ok) {
            throw new Error('Erro ao gerar senha');
        }
        
        const data = await response.json();
        
        // Atualiza campos da senha gerada de forma compacta no formulário
        document.getElementById('senhaGeradaInput').value = data.senha;

        // Mostra container compacto
        document.getElementById('senhaGeradaContainer').style.display = 'block';
    } catch (error) {
        console.error('Erro ao gerar senha:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao gerar senha. Tente novamente.');
        }
    }
}

// Event listener para o botão de gerar senha
document.getElementById('btnGerarSenha')?.addEventListener('click', function(e) {
    e.preventDefault();
    gerarSenha();
});

// Funç��o para validar dados do usuário
function validarDadosUsuario(dados) {
    const erros = [];
    
    if (!dados.nome) erros.push('Nome é obrigat��rio');
    if (!dados.sobrenome) erros.push('Sobrenome é obrigat��rio');
    if (!dados.email) erros.push('E-mail é obrigatório');
    if (!dados.usuario) erros.push('Nome de usuário é obrigatório');
    if (!dados.senha) erros.push('Senha é obrigatória. Clique em "Gerar Senha"');
    if (!dados.nivel_acesso) erros.push('N��vel de acesso é obrigatório');
    if (!dados.setores || dados.setores.length === 0) erros.push('Selecione pelo menos um setor');
    
    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (dados.email && !emailRegex.test(dados.email)) {
        erros.push('E-mail inválido');
    }
    
    return erros;
}

// Event listener para o formulário de criar usuário
document.getElementById('formCriarUsuario')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Elementos de mensagem
    const mensagemErro = document.getElementById('mensagemErro');
    const mensagemSucesso = document.getElementById('mensagemSucesso');
    
    // Esconde mensagens anteriores
    mensagemErro.style.display = 'none';
    mensagemSucesso.style.display = 'none';
    
    // Desabilita o botão de submit para evitar duplo envio
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando usuário...';
    
    try {
        // Coleta dados do formulário
        const usuarioData = {
            nome: document.getElementById('nomeUsuario').value.trim(),
            sobrenome: document.getElementById('sobrenomeUsuario').value.trim(),
            email: document.getElementById('emailUsuario').value.trim(),
            usuario: document.getElementById('usuarioLogin').value.trim(),
            senha: document.getElementById('senhaGeradaInput').value,
            nivel_acesso: document.getElementById('nivelAcesso').value,
            setores: Array.from(document.getElementById('setorUsuario').selectedOptions).map(opt => opt.value),
            alterar_senha_primeiro_acesso: document.getElementById('alterarSenhaPrimeiroAcesso').checked
        };

        // Validaç����o
        const errosValidacao = validarDadosUsuario(usuarioData);
        if (errosValidacao.length > 0) {
            throw new Error(errosValidacao.join('<br>'));
        }

        // Enviar para a API
        const response = await fetch('/ti/painel/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao criar usuário');
        }

        // Se foi selecionado "Agente de suporte", criar automaticamente o agente
        if (usuarioData.nivel_acesso === 'Agente de suporte') {
            try {
                const agenteResponse = await fetch('/ti/painel/api/agentes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usuario_id: data.id,
                        ativo: true,
                        nivel_experiencia: 'junior',
                        max_chamados_simultaneos: 10,
                        especialidades: []
                    })
                });

                if (agenteResponse.ok) {
                    if (window.advancedNotificationSystem) {
                        window.advancedNotificationSystem.showSuccess('Usuário e Agente Criados', `Usuário ${data.nome} criado e registrado como agente de suporte!`);
                    }
                } else {
                    if (window.advancedNotificationSystem) {
                        window.advancedNotificationSystem.showWarning('Usuário Criado', `Usu��rio ${data.nome} criado, mas houve erro ao registrar como agente.`);
                    }
                }
            } catch (agenteError) {
                console.error('Erro ao criar agente:', agenteError);
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showWarning('Usuário Criado', `Usuário ${data.nome} criado, mas houve erro ao registrar como agente.`);
                }
            }
        } else {
            // Usar sistema de notificações avançado para usuário normal
            if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showSuccess('Usuário Criado', `Usuário ${data.nome} criado com sucesso!`);
            }
        }

        // Mostrar credenciais no modal
        document.getElementById('credenciaisNome').textContent = `${data.nome} ${data.sobrenome}`;
        document.getElementById('credenciaisUsuario').textContent = data.usuario;
        document.getElementById('credenciaisSenha').textContent = usuarioData.senha;

        // Abrir modal de credenciais
        document.getElementById('modalCredenciais').classList.add('active');

        // Limpar formulário
        this.reset();
        document.getElementById('senhaGeradaContainer').style.display = 'none';

        // Atualizar lista de usuários se estiver visível
        if (document.getElementById('permissoes').classList.contains('active')) {
            await loadUsuarios();
        }

        // Atualizar lista de agentes se estiver visível
        if (document.getElementById('agentes-suporte').classList.contains('active')) {
            await carregarAgentes();
        }
        
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    } finally {
        // Reabilita o botão de submit
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// Validação em tempo real do e-mail
document.getElementById('emailUsuario')?.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
        this.classList.add('is-invalid');
        this.classList.remove('is-valid');
    } else if (this.value) {
        this.classList.add('is-valid');
        this.classList.remove('is-invalid');
    } else {
        this.classList.remove('is-valid', 'is-invalid');
    }
});

// Validaç��o em tempo real para campos obrigatórios
['nomeUsuario', 'sobrenomeUsuario', 'nivelAcesso', 'setorUsuario'].forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.addEventListener('change', function() {
            if (this.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });
    }
});

// Modal Add Unidade
const modalAddUnidade = document.getElementById('modalAddUnidade');
const btnOpenAddUnitModal = document.getElementById('btnOpenAddUnitModal');
const modalAddUnidadeClose = document.getElementById('modalAddUnidadeClose');
const btnSalvarUnidade = document.getElementById('btnSalvarUnidade');
const btnCancelarUnidade = document.getElementById('btnCancelarUnidade');
const inputIdUnidade = document.getElementById('inputIdUnidade');
const inputNomeUnidade = document.getElementById('inputNomeUnidade');
const errorAddUnidade = document.getElementById('errorAddUnidade');

function openAddUnidadeModal() {
    inputIdUnidade.value = '';
    inputNomeUnidade.value = '';
    errorAddUnidade.style.display = 'none';
    modalAddUnidade.classList.add('active');
}

function closeAddUnidadeModal() {
    modalAddUnidade.classList.remove('active');
    errorAddUnidade.style.display = 'none';
    inputNomeUnidade.value = '';
    inputIdUnidade.value = '';
}

// Função para buscar unidades
async function fetchUnidades() {
    try {
        const response = await fetch('/ti/painel/api/unidades');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
    }
}

// Função para renderizar a lista de unidades
async function renderListarUnidades() {
    const lista = document.getElementById('listaUnidades');
    try {
        lista.innerHTML = '<tr><td colspan="3" class="text-center">Carregando unidades...</td></tr>';
        
        const unidades = await fetchUnidades();
        
        if (unidades.length === 0) {
            lista.innerHTML = '<tr><td colspan="3" class="text-center">Nenhuma unidade cadastrada.</td></tr>';
            return;
        }
        
        lista.innerHTML = '';
        
        unidades.forEach(unidade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${unidade.id}</td>
                <td>${unidade.nome}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-remover-unidade" data-id="${unidade.id}">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </td>
            `;
            lista.appendChild(row);
        });

        // Adiciona event listeners aos botões de remover
        document.querySelectorAll('.btn-remover-unidade').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const unidadeNome = btn.closest('tr').querySelector('td:nth-child(2)').textContent;
                
                if (confirm(`Tem certeza que deseja remover a unidade "${unidadeNome}"?`)) {
                    try {
                        const response = await fetch(`/ti/painel/api/unidades/${id}`, {
                            method: 'DELETE'
                        });
                        
                        if (response.ok) {
                            if (window.advancedNotificationSystem) {
                                window.advancedNotificationSystem.showSuccess('Unidade Removida', 'Unidade removida com sucesso!');
                            }
                            await renderListarUnidades();
                        } else {
                            const errorData = await response.json();
                            if (window.advancedNotificationSystem) {
                                window.advancedNotificationSystem.showError('Erro', errorData.error || 'Erro ao remover unidade');
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao remover unidade:', error);
                        if (window.advancedNotificationSystem) {
                            window.advancedNotificationSystem.showError('Erro', 'Erro ao remover unidade');
                        }
                    }
                }
            });
        });
    } catch (error) {
        lista.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${error.message}</td></tr>`;
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar unidades');
        }
    }
}

// Event listeners para modal de unidade
btnOpenAddUnitModal.addEventListener('click', openAddUnidadeModal);
modalAddUnidadeClose.addEventListener('click', closeAddUnidadeModal);
btnCancelarUnidade.addEventListener('click', closeAddUnidadeModal);

// Event listener para o botão de salvar unidade
btnSalvarUnidade.addEventListener('click', async () => {
    const id = inputIdUnidade.value.trim();
    const nome = inputNomeUnidade.value.trim();

    // Validações
    if (!id || isNaN(id) || parseInt(id) <= 0) {
        errorAddUnidade.textContent = 'Por favor, informe um ID válido maior que zero.';
        errorAddUnidade.style.display = 'block';
        return;
    }
    if (!nome) {
        errorAddUnidade.textContent = 'Por favor, informe o nome da unidade.';
        errorAddUnidade.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/ti/painel/api/unidades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                id: parseInt(id), 
                nome: nome 
            })
        });
        
        if (response.ok) {
            closeAddUnidadeModal();
            await renderListarUnidades();
            if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showSuccess('Unidade Adicionada', 'Unidade adicionada com sucesso!');
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao adicionar unidade');
        }
    } catch (error) {
        errorAddUnidade.textContent = error.message;
        errorAddUnidade.style.display = 'block';
    }
});

// Event listeners para o modal de credenciais
document.getElementById('btnCopiarCredenciais')?.addEventListener('click', function() {
    const nome = document.getElementById('credenciaisNome').textContent;
    const usuario = document.getElementById('credenciaisUsuario').textContent;
    const senha = document.getElementById('credenciaisSenha').textContent;
    
    const texto = `Nome: ${nome}\nUsuário: ${usuario}\nSenha: ${senha}`;
    
    navigator.clipboard.writeText(texto).then(() => {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Copiado', 'Credenciais copiadas para a área de transferência!');
        }
    }).catch(err => {
        console.error('Erro ao copiar texto: ', err);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showWarning('Aviso', 'Não foi possível copiar as credenciais automaticamente. Por favor, copie manualmente.');
        }
    });
});

document.getElementById('btnFecharCredenciais')?.addEventListener('click', function() {
    document.getElementById('modalCredenciais').classList.remove('active');
});

// Função para excluir chamado
async function excluirChamado(chamadoId) {
    if (!confirm('Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.')) {
        return false; // Retorna false se o usuário cancelar
    }
    
    try {
        const response = await fetch(`/ti/painel/api/chamados/${chamadoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir chamado');
        }
        
        // Remove o chamado da lista local
        chamadosData = chamadosData.filter(chamado => chamado.id != chamadoId);
        
        // Atualiza a visualização
        renderChamadosPage(currentPage);
        
        // Usar sistema de notificações avançado
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Chamado Excluído', 'Chamado excluído com sucesso');
        }
        return true; // Retorna true se a exclusão foi bem-sucedida
    } catch (error) {
        console.error('Erro ao excluir chamado:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', `Erro: ${error.message}`);
        }
        return false;
    }
}

// Listener para botão Excluir no modal
document.getElementById('modalDelete')?.addEventListener('click', async function() {
    if (!currentModalChamadoId) {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Nenhum chamado selecionado.');
        }
        return;
    }
    await excluirChamado(currentModalChamadoId);
    closeModal();
});

// Vari��veis globais para usuários
let usuariosData = [];
const usuariosPerPage = 6;
let currentUsuariosPage = 1;

const usuariosGrid = document.getElementById('usuariosGrid');
const usuariosPagination = document.getElementById('usuariosPagination');

// Função para carregar os usuários da API
async function loadUsuarios() {
    try {
        const response = await fetch('/ti/painel/api/usuarios');
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        const data = await response.json();

        // Extract usuarios array from API response
        if (data && data.usuarios && Array.isArray(data.usuarios)) {
            usuariosData = data.usuarios;
        } else if (Array.isArray(data)) {
            usuariosData = data;
        } else {
            console.error('Unexpected API response format:', data);
            usuariosData = [];
        }

        console.log('Usuarios loaded:', usuariosData.length);
        renderUsuariosPage(currentUsuariosPage);

        // Inicializar filtro após carregar usuários
        setTimeout(() => {
            if (typeof inicializarFiltroPermissoes === 'function') {
                inicializarFiltroPermissoes();
            }
        }, 100);

    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        usuariosGrid.innerHTML = '<p class="text-center py-4">Erro ao carregar usu��rios. Tente novamente mais tarde.</p>';
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar usuários');
        }
    }
}

// Função para renderizar a página de usuários
function renderUsuariosPage(page) {
    usuariosGrid.innerHTML = '';
    const start = (page - 1) * usuariosPerPage;
    const end = start + usuariosPerPage;
    const pageUsuarios = usuariosData.slice(start, end);

    if (pageUsuarios.length === 0) {
        usuariosGrid.innerHTML = '<p class="text-center py-4">Nenhum usuário encontrado.</p>';
        usuariosPagination.innerHTML = '';
        return;
    }

    pageUsuarios.forEach(usuario => {
        const card = document.createElement('div');
        card.className = 'card usuario-card';
        card.tabIndex = 0;

        const bloqueadoClass = usuario.bloqueado ? 'status-cancelado' : 'status-concluido';
        const bloqueadoText = usuario.bloqueado ? 'Bloqueado' : 'Ativo';

        card.innerHTML = `
            <div class="card-header">
                <h3>${usuario.nome} ${usuario.sobrenome}</h3>
                <div class="status-badge ${bloqueadoClass}">
                    <i class="fas ${usuario.bloqueado ? 'fa-lock' : 'fa-check-circle'}"></i>
                    ${bloqueadoText}
                </div>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <strong>Usuário:</strong>
                    <span>${usuario.usuario}</span>
                </div>
                <div class="info-row">
                    <strong>E-mail:</strong>
                    <span>${usuario.email}</span>
                </div>
                <div class="info-row">
                    <strong>Nível:</strong>
                    <span>${usuario.nivel_acesso}</span>
                </div>
                <div class="info-row">
                    <strong>Setor(es):</strong>
                    <span>${Array.isArray(usuario.setores) ? usuario.setores.join(', ') : usuario.setor}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm btn-editar" data-id="${usuario.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn ${usuario.bloqueado ? 'btn-success' : 'btn-warning'} btn-sm" 
                        data-id="${usuario.id}">
                    <i class="fas ${usuario.bloqueado ? 'fa-unlock' : 'fa-lock'}"></i>
                    ${usuario.bloqueado ? 'Desbloquear' : 'Bloquear'}
                </button>
                <button class="btn btn-info btn-sm btn-ticket" data-id="${usuario.id}">
                    <i class="fas fa-key"></i> Nova Senha
                </button>
                <button class="btn btn-danger btn-sm" data-id="${usuario.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;

        usuariosGrid.appendChild(card);
    });

    renderUsuariosPagination(usuariosData.length);
    attachUsuariosEventListeners();
}

// Funç��o para renderizar a paginação de usuários
function renderUsuariosPagination(totalItems) {
    usuariosPagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / usuariosPerPage);

    function createPageButton(num, active = false) {
        const btn = document.createElement('button');
        btn.textContent = num;
        btn.disabled = active;
        if (active) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentUsuariosPage = num;
            renderUsuariosPage(currentUsuariosPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return btn;
    }

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '«';
    prevBtn.disabled = currentUsuariosPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentUsuariosPage > 1) {
            currentUsuariosPage--;
            renderUsuariosPage(currentUsuariosPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    usuariosPagination.appendChild(prevBtn);

    let startPage = Math.max(1, currentUsuariosPage - 2);
    let endPage = Math.min(startPage + 4, totalPages);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
        usuariosPagination.appendChild(createPageButton(i, i === currentUsuariosPage));
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '»';
    nextBtn.disabled = currentUsuariosPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentUsuariosPage < totalPages) {
            currentUsuariosPage++;
            renderUsuariosPage(currentUsuariosPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    usuariosPagination.appendChild(nextBtn);
}

// Função para anexar event listeners aos cards de usuários
function attachUsuariosEventListeners() {
    // Listener para bot��o Editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const usuarioId = this.dataset.id;
            abrirModalEditarUsuario(usuarioId);
        });
    });

    // Listener para botão Gerar Senha
    document.querySelectorAll('.btn-ticket').forEach(btn => {
        btn.addEventListener('click', async function() {
            const usuarioId = this.dataset.id;
            await gerarNovaSenha(usuarioId);
        });
    });

    // Listener para botão Bloquear/Desbloquear
    document.querySelectorAll('.btn-warning, .btn-success').forEach(btn => {
        btn.addEventListener('click', async function() {
            const usuarioId = this.dataset.id;
            await toggleBloqueioUsuario(usuarioId);
        });
    });

    // Listener para botão Excluir
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', async function() {
            const usuarioId = this.dataset.id;
            await excluirUsuario(usuarioId);
        });
    });
}

// Função para abrir modal de edição
function abrirModalEditarUsuario(usuarioId) {
    // Check in both usuariosData arrays (if using different data sources)
    let usuario = null;

    if (usuariosData && Array.isArray(usuariosData)) {
        usuario = usuariosData.find(u => u.id == usuarioId);
    }

    // If not found in usuariosData, check in the filtrarListaUsuarios data
    if (!usuario && window.currentUsuariosList) {
        usuario = window.currentUsuariosList.find(u => u.id == usuarioId);
    }

    if (!usuario) {
        console.error('Usuário não encontrado:', usuarioId);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Usuário não encontrado para edição');
        }
        return;
    }

    console.log('Abrindo modal para editar usuário:', usuario);

    // Preencher formulário
    document.getElementById('editUsuarioId').value = usuario.id;
    document.getElementById('editNomeUsuario').value = usuario.nome || '';
    document.getElementById('editSobrenomeUsuario').value = usuario.sobrenome || '';
    document.getElementById('editUsuarioLogin').value = usuario.usuario || '';
    document.getElementById('editEmailUsuario').value = usuario.email || '';
    document.getElementById('editNivelAcesso').value = usuario.nivel_acesso || '';
    document.getElementById('editBloqueado').checked = usuario.bloqueado || false;

    // Limpar e selecionar setores
    const setorSelect = document.getElementById('editSetorUsuario');
    if (setorSelect) {
        Array.from(setorSelect.options).forEach(option => {
            option.selected = false; // Clear all first
        });

        // Handle setores - could be array or comma-separated string
        let setores = [];
        if (Array.isArray(usuario.setores)) {
            setores = usuario.setores;
        } else if (typeof usuario.setores === 'string') {
            setores = usuario.setores.split(',').map(s => s.trim());
        }

        // Select matching options
        Array.from(setorSelect.options).forEach(option => {
            if (setores.includes(option.value)) {
                option.selected = true;
            }
        });
    }

    // Abrir modal
    const modal = document.getElementById('modalEditarUsuario');
    if (modal) {
        modal.classList.add('active');
        console.log('Modal de edição aberto');
    } else {
        console.error('Modal de edição não encontrado');
    }
}

// Função para gerar nova senha
async function gerarNovaSenha(usuarioId) {
    if (!confirm('Tem certeza que deseja gerar uma nova senha para este usuário?')) return;
    
    try {
        const response = await fetch(`/ti/painel/api/usuarios/${usuarioId}/gerar-senha`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao gerar nova senha');
        }
        
        const data = await response.json();
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Nova Senha Gerada', `Nova senha gerada: ${data.nova_senha}`);
        }
    } catch (error) {
        console.error('Erro ao gerar nova senha:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', `Erro: ${error.message}`);
        }
    }
}

// Função para bloquear/desbloquear usuário
async function toggleBloqueioUsuario(usuarioId) {
    try {
        const response = await fetch(`/ti/painel/api/usuarios/${usuarioId}/bloquear`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao alterar status');
        }
        
        const data = await response.json();
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Status Alterado', `Usuário ${data.bloqueado ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
        }
        await loadUsuarios();
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', `Erro: ${error.message}`);
        }
    }
}

// Função para excluir usuário
async function excluirUsuario(usuarioId) {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    try {
        const response = await fetch(`/ti/painel/api/usuarios/${usuarioId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMessage = 'Erro ao excluir usuário';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (parseError) {
                console.warn('Erro ao parsear resposta de erro:', parseError);
                errorMessage = `Erro ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Usuário Excluído', data.message || 'Usuário excluído com sucesso!');
        }

        // Recarregar lista de usuários
        if (typeof filtrarListaUsuarios === 'function') {
            await filtrarListaUsuarios(currentUsuariosBusca || '', currentUsuariosPage || 1);
        } else if (typeof loadUsuarios === 'function') {
            await loadUsuarios();
        }

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro ao Excluir', error.message);
        } else {
            alert(`Erro ao excluir usuário: ${error.message}`);
        }
    }
}

// Event listener para salvar edição
document.getElementById('btnSalvarUsuario').addEventListener('click', async () => {
    const usuarioId = document.getElementById('editUsuarioId').value;
    const nome = document.getElementById('editNomeUsuario').value.trim();
    const sobrenome = document.getElementById('editSobrenomeUsuario').value.trim();
    const usuario = document.getElementById('editUsuarioLogin').value.trim();
    const email = document.getElementById('editEmailUsuario').value.trim();
    const nivelAcesso = document.getElementById('editNivelAcesso').value;
    const setorSelect = document.getElementById('editSetorUsuario');
    const setores = Array.from(setorSelect.selectedOptions).map(option => option.value);
    const bloqueado = document.getElementById('editBloqueado').checked;

    try {
        const response = await fetch(`/ti/painel/api/usuarios/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                sobrenome,
                usuario,
                email,
                nivel_acesso: nivelAcesso,
                setores,
                bloqueado
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar usuário');
        }
        
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Usuário Atualizado', 'Usuário atualizado com sucesso!');
        }
        document.getElementById('modalEditarUsuario').classList.remove('active');
        await loadUsuarios();
    } catch (error) {
        console.error('Erro ao atualizar usu��rio:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', `Erro: ${error.message}`);
        }
    }
});

// Event listener para cancelar edição
document.getElementById('btnCancelarEdicao').addEventListener('click', () => {
    document.getElementById('modalEditarUsuario').classList.remove('active');
});

// Adicione estas variáveis globais junto com as outras
let usuariosBloqueadosData = [];
const usuariosBloqueadosPerPage = 6;
let currentBloqueadosPage = 1;

// Fun��ão para carregar usuários bloqueados
async function loadUsuariosBloqueados() {
    try {
        const response = await fetch('/ti/painel/api/usuarios');
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        const allUsers = await response.json();
        usuariosBloqueadosData = allUsers.filter(user => user.bloqueado);
        renderUsuariosBloqueadosPage(currentBloqueadosPage);
    } catch (error) {
        console.error('Erro ao carregar usuários bloqueados:', error);
        document.getElementById('usuariosBloqueadosGrid').innerHTML = 
            '<p class="text-center py-4">Erro ao carregar usuários bloqueados. Tente novamente mais tarde.</p>';
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar usuários bloqueados');
        }
    }
}

// Função para renderizar a página de usuários bloqueados
function renderUsuariosBloqueadosPage(page) {
    const bloqueadosGrid = document.getElementById('usuariosBloqueadosGrid');
    const bloqueadosPagination = document.getElementById('usuariosBloqueadosPagination');
    
    bloqueadosGrid.innerHTML = '';
    const start = (page - 1) * usuariosBloqueadosPerPage;
    const end = start + usuariosBloqueadosPerPage;
    const pageBloqueados = usuariosBloqueadosData.slice(start, end);

    if (pageBloqueados.length === 0) {
        bloqueadosGrid.innerHTML = '<p class="text-center py-4">Nenhum usuário bloqueado encontrado.</p>';
        bloqueadosPagination.innerHTML = '';
        return;
    }

    pageBloqueados.forEach(usuario => {
        const card = document.createElement('div');
        card.className = 'card usuario-card';
        card.tabIndex = 0;

        card.innerHTML = `
            <div class="card-header">
                <h3>${usuario.nome} ${usuario.sobrenome}</h3>
                <div class="status-container status-cancelado">Bloqueado</div>
            </div>
            <div class="card-body">
                <p><strong>Usuário:</strong> ${usuario.usuario}</p>
                <p><strong>E-mail:</strong> ${usuario.email}</p>
                <p><strong>Nível de Acesso:</strong> ${usuario.nivel_acesso}</p>
                <p><strong>Setor(es):</strong> ${usuario.setores.join(', ')}</p>
                <small><strong>Criado em:</strong> ${usuario.data_criacao}</small>
            </div>
            <div class="card-footer">
                <button class="btn btn-success btn-desbloquear" data-id="${usuario.id}" 
                    aria-label="Desbloquear usuário ${usuario.usuario}">
                    <i class="fas fa-unlock"></i> Desbloquear
                </button>
            </div>
        `;

        bloqueadosGrid.appendChild(card);
    });

    renderBloqueadosPagination(usuariosBloqueadosData.length);
    attachBloqueadosEventListeners();
}

// Fun��ão para renderizar a paginação dos bloqueados
function renderBloqueadosPagination(totalItems) {
    const bloqueadosPagination = document.getElementById('usuariosBloqueadosPagination');
    bloqueadosPagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / usuariosBloqueadosPerPage);

    // ... (similar à função renderPagination existente, mas para bloqueados)
}

// Função para anexar event listeners aos cards de usuários bloqueados
function attachBloqueadosEventListeners() {
    document.querySelectorAll('.btn-desbloquear').forEach(btn => {
        btn.addEventListener('click', async function() {
            const usuarioId = this.dataset.id;
            try {
                await toggleBloqueioUsuario(usuarioId);
                // Recarrega tanto a lista de bloqueados quanto a lista geral
                await loadUsuariosBloqueados();
                if (document.getElementById('permissoes').classList.contains('active')) {
                    await loadUsuarios();
                }
            } catch (error) {
                console.error('Erro ao desbloquear usuário:', error);
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showError('Erro', 'Erro ao desbloquear usuário');
                }
            }
        });
    });
}

// Função para carregar conteúdo específico da seção quando ativada
function loadSectionContent(sectionId) {
    console.log('Carregando conteúdo da seção:', sectionId);

    switch(sectionId) {
        case 'listar-unidades':
            if (typeof renderListarUnidades === 'function') {
                renderListarUnidades();
            }
            break;
        case 'gerenciar-chamados':
            loadChamados();
            // Adicionar filtro de agente após carregar chamados
            setTimeout(() => {
                if (typeof adicionarFiltroAgente === 'function') {
                    adicionarFiltroAgente();
                }
            }, 500);
            break;
        case 'permissoes':
            loadUsuarios();
            // Inicializar filtro de permissões após carregar usuários
            setTimeout(() => {
                if (typeof inicializarFiltroPermissoes === 'function') {
                    inicializarFiltroPermissoes();
                }
            }, 100);
            break;
        case 'bloqueios':
            if (typeof loadUsuariosBloqueados === 'function') {
                loadUsuariosBloqueados();
            }
            break;
        case 'sla-dashboard':
            // Carregar dados SLA se a fun��ão existir
            if (typeof carregarSLA === 'function') {
                carregarSLA();
            }
            break;
        case 'configuracoes':
            // Carregar configurações de prioridades
            if (window.prioridadesManager && typeof window.prioridadesManager.carregarProblemas === 'function') {
                try {
                    window.prioridadesManager.carregarProblemas();
                } catch (error) {
                    console.warn('Erro ao carregar prioridades (não cr��tico):', error);
                }
            }
            // Carregar problemas e configurações de notificações
            setTimeout(() => {
                if (typeof carregarProblemas === 'function') {
                    carregarProblemas();
                }
                if (typeof carregarConfiguracaoNotificacoes === 'function') {
                    carregarConfiguracaoNotificacoes();
                }
                if (typeof carregarConfiguracoes === 'function') {
                    carregarConfiguracoes();
                }
            }, 300);
            atualizarContadoresVisaoGeral();
            break;
        case 'agentes-suporte':
            // Carregar agentes de suporte
            console.log('Carregando seção de agentes de suporte...');
            if (typeof carregarAgentes === 'function') {
                console.log('Função carregarAgentes encontrada, executando...');
                carregarAgentes();
            } else {
                console.log('Funç��o carregarAgentes não encontrada, tentando novamente em 100ms...');
                setTimeout(() => {
                    if (typeof carregarAgentes === 'function') {
                        console.log('Função carregarAgentes encontrada no retry, executando...');
                        carregarAgentes();
                    } else {
                        console.error('Função carregarAgentes ainda n��o disponível. Verifique o carregamento dos scripts.');
                    }
                }, 100);
            }
            break;
        case 'grupos-usuarios':
            // Carregar grupos de usuários
            console.log('Carregando se��ão de grupos de usuários...');
            if (typeof inicializarGrupos === 'function') {
                console.log('Função inicializarGrupos encontrada, executando...');
                inicializarGrupos();
            } else if (typeof carregarGrupos === 'function') {
                console.log('Função carregarGrupos encontrada, executando...');
                carregarGrupos();
            } else {
                console.log('Funções de grupos não encontradas, tentando novamente em 100ms...');
                setTimeout(() => {
                    if (typeof inicializarGrupos === 'function') {
                        console.log('Função inicializarGrupos encontrada no retry, executando...');
                        inicializarGrupos();
                    } else if (typeof carregarGrupos === 'function') {
                        console.log('Função carregarGrupos encontrada no retry, executando...');
                        carregarGrupos();
                    } else {
                        console.error('Funções de grupos ainda não disponíveis. Verifique o carregamento dos scripts.');
                    }
                }, 100);
            }
            break;
        case 'visao-geral':
            atualizarContadoresVisaoGeral();
            break;
        case 'configuracoes-avancadas':
            if (typeof carregarConfiguracoesAvancadas === 'function') {
                carregarConfiguracoesAvancadas();
            }
            break;
        case 'alertas-sistema':
            if (typeof carregarAlertasSistema === 'function') {
                carregarAlertasSistema();
            }
            break;
        case 'backup-manutencao':
            if (typeof carregarBackupManutencao === 'function') {
                carregarBackupManutencao();
            }
            break;
        case 'logs-acesso':
            if (typeof carregarLogsAcesso === 'function') {
                carregarLogsAcesso();
            }
            break;
        case 'logs-acoes':
            if (typeof carregarLogsAcoes === 'function') {
                carregarLogsAcoes();
            }
            break;
        case 'analise-problemas':
            if (typeof carregarAnaliseProblemas === 'function') {
                carregarAnaliseProblemas();
            }
            break;
        case 'monitoramento-catraca':
            if (typeof carregarMonitoramentoCatraca === 'function') {
                carregarMonitoramentoCatraca();
            }
            break;
        case 'monitoramento-mikrotiks':
            if (typeof carregarMonitoramentoMikrotiks === 'function') {
                carregarMonitoramentoMikrotiks();
            }
            break;
        case 'monitoramento-usuarios':
            if (typeof carregarMonitoramentoUsuarios === 'function') {
                carregarMonitoramentoUsuarios();
            }
            break;
        case 'dashboard-avancado':
            if (typeof carregarDashboardAvancado === 'function') {
                carregarDashboardAvancado();
            }
            break;
        case 'adicionar-problema':
            // Carregar lista de problemas existentes
            setTimeout(() => {
                if (typeof carregarListaProblemasExistentes === 'function') {
                    carregarListaProblemasExistentes();
                }
            }, 300);
            break;
    }
}

// Controle de inatividade (15 minutos)
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    // 15 minutos = 900000 ms
    inactivityTimer = setTimeout(() => {
        window.location.href = "{{ url_for('auth.logout') }}?timeout=1";
    }, 900000);
}

// Resetar o timer em eventos de interação
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Iniciar o timer quando a página carregar
resetInactivityTimer();

// Função de debug para testar navegação manualmente
window.debugNavigation = function() {
    console.log('=== DEBUG NAVEGAÇÃO ===');
    const links = document.querySelectorAll('.sidebar nav ul li a[href^="#"]');
    const sections = document.querySelectorAll('section.content-section');

    console.log('Links encontrados:', links.length);
    console.log('Seções encontradas:', sections.length);

    links.forEach((link, i) => {
        console.log(`Link ${i}: href="${link.getAttribute('href')}", text="${link.textContent.trim()}"`);
    });

    sections.forEach((section, i) => {
        console.log(`Seção ${i}: id="${section.id}", active="${section.classList.contains('active')}"`);
    });

    // Teste navegação
    console.log('Testando navegação para "sla-dashboard"...');
    activateSection('sla-dashboard');
};

// Função de inicialização compreensiva
function inicializarSistemaPainel() {
    console.log('=== INICIALIZANDO SISTEMA DO PAINEL ===');

    try {
        // 1. Verificar elementos essenciais da interface primeiro
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const allSections = document.querySelectorAll('section.content-section');

        console.log('Elementos encontrados:', {
            sidebar: !!sidebar,
            mainContent: !!mainContent,
            sections: allSections.length
        });

        if (allSections.length === 0) {
            console.error('ERRO: Nenhuma seção content-section encontrada!');
            return;
        }

        // 2. Inicializar navegação
        initializeSubmenuToggles();
        initializeNavigation();

        // 3. Garantir que apenas uma seção esteja ativa
        allSections.forEach(section => {
            section.classList.remove('active');
        });

        // 4. Ativar seção inicial
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            console.log('Ativando seção do hash:', hash);
            activateSection(hash);
        } else {
            console.log('Ativando seç��o padrão: visao-geral');
            activateSection('visao-geral');
        }

        // 5. Sistema pronto

        // 6. Set up test function for debugging navigation
        window.testNavigation = function(sectionId) {
            console.log('=== TESTE DE NAVEGAÇÃO ===');
            console.log('Tentando navegar para:', sectionId);
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                console.log('Seção encontrada, ativando...');
                activateSection(sectionId);

                // Activate corresponding nav link
                const navLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
                if (navLink) {
                    document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));
                    navLink.classList.add('active');
                    console.log('Link de navegação ativado');
                } else {
                    console.warn('Link de navegação não encontrado para:', sectionId);
                }

                console.log('Navegação concluída com sucesso');
                return true;
            } else {
                console.error('Seção não encontrada:', sectionId);
                return false;
            }
        };

        // 4. Carregar dados críticos
        setTimeout(() => {
            console.log('Carregando dados iniciais do sistema...');

            // Carregar chamados para m��tricas
            if (typeof loadChamados === 'function') {
                console.log('Carregando chamados...');
                loadChamados();
            }

            // Atualizar contadores
            if (typeof atualizarContadoresVisaoGeral === 'function') {
                console.log('Atualizando contadores...');
                atualizarContadoresVisaoGeral();
            }

        }, 300);

        // 5. Verificar funções essenciais
        const funcoesCriticas = [
            'activateSection',
            'loadSectionContent',
            'atualizarContadoresVisaoGeral',
            'loadChamados'
        ];

        funcoesCriticas.forEach(funcao => {
            if (typeof window[funcao] === 'function') {
                console.log(`✓ Função ${funcao} disponível`);
            } else {
                console.warn(`⚠ Função ${funcao} não encontrada`);
            }
        });

        console.log('=== INICIALIZAÇÃO DO PAINEL CONCLUÍDA ===');

    } catch (error) {
        console.error('ERRO na inicialização do painel:', error);
    }
}

// Inicialização
function initializePainel() {
    console.log('Inicializando painel.js...');

    // Verificar se os elementos DOM est��o disponíveis
    const sidebar = document.getElementById('sidebar');
    const sections = document.querySelectorAll('section.content-section');

    if (!sidebar || sections.length === 0) {
        console.log('Elementos DOM ainda n��o disponíveis, tentando novamente em 100ms...');
        setTimeout(initializePainel, 100);
        return;
    }

    console.log('Elementos DOM encontrados, iniciando sistema...');

    inicializarSistemaPainel();

    // Inicializar Socket.IO
    setTimeout(() => {
        if (typeof initializeSocketIO === 'function') {
            initializeSocketIO();
        }
    }, 1000);

    // Inicializar event listeners de filtros
    initializeFilterListeners();
}

// Try multiple initialization methods to ensure it works
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePainel);
} else {
    // DOM is already loaded
    initializePainel();
}

// Fallback initialization
window.addEventListener('load', function() {
    // Only run if not already initialized
    if (!navLinks || navLinks.length === 0) {
        console.log('Fallback initialization triggered');
        setTimeout(initializePainel, 100);
    }
});

// Função para inicializar listeners de filtros
function initializeFilterListeners() {
    // Inicializar listeners do submenu de chamados
    initializeSubmenuListeners();

    // Botão filtrar chamados
    const btnFiltrarChamados = document.getElementById('btnFiltrarChamados');
    if (btnFiltrarChamados) {
        btnFiltrarChamados.addEventListener('click', function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }

    // Botão limpar filtros
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', function() {
            // Limpar todos os campos de filtro
            const filtroSolicitante = document.getElementById('filtroSolicitante');
            const filtroProblema = document.getElementById('filtroProblema');
            const filtroPrioridade = document.getElementById('filtroPrioridade');
            const filtroAgenteResponsavel = document.getElementById('filtroAgenteResponsavel');
            const filtroUnidade = document.getElementById('filtroUnidade');
            const filtroDataInicio = document.getElementById('filtroDataInicio');
            const filtroDataFim = document.getElementById('filtroDataFim');

            if (filtroSolicitante) filtroSolicitante.value = '';
            if (filtroProblema) filtroProblema.value = '';
            if (filtroPrioridade) filtroPrioridade.value = '';
            if (filtroAgenteResponsavel) filtroAgenteResponsavel.value = '';
            if (filtroUnidade) filtroUnidade.value = '';
            if (filtroDataInicio) filtroDataInicio.value = '';
            if (filtroDataFim) filtroDataFim.value = '';

            // Renderizar novamente
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }

    // Botão para reconectar Socket.IO
    const btnReconectarSocket = document.getElementById('btnReconectarSocket');
    if (btnReconectarSocket) {
        btnReconectarSocket.addEventListener('click', function() {
            console.log('Tentando reconectar Socket.IO...');
            updateSocketStatus('Reconectando...', 'warning');

            if (socket) {
                socket.disconnect();
                setTimeout(() => {
                    socket.connect();
                }, 1000);
            } else {
                initializeSocketIO();
            }
        });
    }
}

// Navigation event listeners are now handled in initializeNavigation() function
// which is called after DOM is loaded

// Hash change listener will be initialized in initializeNavigation()

// Accessibility features are now handled in initializeNavigation()

// Função para verificar se uma seção existe
function sectionExists(id) {
    const allSections = document.querySelectorAll('section.content-section');
    return Array.from(allSections).some(section => section.id === id);
}

// Global functions for debugging and manual control
window.debugPainel = {
    activateSection: function(id) {
        console.log('Ativação manual da seção:', id);
        activateSection(id);
    },
    listSections: function() {
        const sections = document.querySelectorAll('section.content-section');
        console.log('Seções disponíveis:', Array.from(sections).map(s => s.id));
        return Array.from(sections).map(s => s.id);
    },
    listNavLinks: function() {
        const links = document.querySelectorAll('.sidebar nav ul li a');
        console.log('Links de navegação:', Array.from(links).map(l => l.getAttribute('href')));
        return Array.from(links).map(l => l.getAttribute('href'));
    },
    reinitialize: function() {
        console.log('Reinicializando sistema...');
        initializeNavigation();
    },
    testNavigation: function(sectionId) {
        console.log('Testando navegação para:', sectionId);
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            activateSection(sectionId);
            console.log('Navegação executada com sucesso');
        } else {
            console.error('Seção não encontrada:', sectionId);
        }
    }
};

// Make key functions globally available
window.activateSection = activateSection;
window.loadSectionContent = loadSectionContent;

// Section initialization is now handled in inicializarSistemaPainel()


// Event listeners para fechar modais
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('active');
    });
});

// Fechar modais ao clicar fora
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Configuração do Socket.IO
let socket = null;
let painelSocketInitialized = false;

function initializeSocketIO() {
    try {
        if (painelSocketInitialized && socket) {
            console.log('Socket.IO do painel já inicializado, ignorando nova inicialização');
            return;
        }
        console.log('Inicializando Socket.IO...');

        socket = io({
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            maxReconnectionAttempts: 10
        });

        socket.on('connect', function() {
            console.log('Socket.IO conectado com sucesso!');
            updateSocketStatus('Conectado', 'success');
            
            // Enviar ping para manter conexão ativa
            setInterval(() => {
                if (socket.connected) {
                    socket.emit('ping');
                }
            }, 25000);
        });

        socket.on('disconnect', function(reason) {
            console.log('Socket.IO desconectado:', reason);
            updateSocketStatus('Desconectado', 'danger');
        });

        socket.on('connect_error', function(error) {
            console.error('Erro de conexão Socket.IO:', error);
            updateSocketStatus('Erro de Conexão', 'warning');
        });

        socket.on('reconnect', function(attemptNumber) {
            console.log('Socket.IO reconectado após', attemptNumber, 'tentativas');
            updateSocketStatus('Reconectado', 'success');
        });

        socket.on('reconnect_error', function(error) {
            console.error('Erro ao reconectar Socket.IO:', error);
            updateSocketStatus('Erro ao Reconectar', 'danger');
        });

        socket.on('reconnect_failed', function() {
            console.error('Falha ao reconectar Socket.IO');
            updateSocketStatus('Falha na Reconexão', 'danger');
        });

        // Event listeners para notificações
        socket.on('notification_test', function(data) {
            console.log('Teste de notificação recebido:', data);
            // Notificação visual já é tratada em notificacoes.js
        });

        socket.on('status_atualizado', function(data) {
            console.log('Status de chamado atualizado:', data);
            // Notificação visual já é tratada em notificacoes.js
            // Recarregar dados se necessário
            if (document.getElementById('gerenciar-chamados').classList.contains('active')) {
                loadChamados();
            }
        });

        socket.on('chamado_deletado', function(data) {
            console.log('Chamado deletado:', data);
            // Notificação visual já é tratada em notificacoes.js
            // Recarregar dados se necessário
            if (document.getElementById('gerenciar-chamados').classList.contains('active')) {
                loadChamados();
            }
        });

        socket.on('usuario_criado', function(data) {
            console.log('Usuário criado:', data);
            // Notificação visual já é tratada em notificacoes.js
        });

        socket.on('chamado_atribuido', function(data) {
            console.log('Chamado atribuído:', data);

            // Recarregar dados da seção atual se estiver em gerenciar chamados
            const currentSection = document.querySelector('section.content-section[style*="block"], section.content-section:not([style*="none"])');
            if (currentSection && currentSection.id === 'gerenciar-chamados') {
                // Atualizar tabela de chamados
                if (window.currentTable && window.currentTable.chamados) {
                    window.currentTable.chamados.reload();
                }
                // Atualizar estatísticas
                if (typeof carregarEstatisticasChamados === 'function') {
                    carregarEstatisticasChamados();
                }
            }
        });

        socket.on('chamado_transferido', function(data) {
            console.log('Chamado transferido:', data);

            // Recarregar dados da seção atual se estiver em gerenciar chamados
            const currentSection = document.querySelector('section.content-section[style*="block"], section.content-section:not([style*="none"])');
            if (currentSection && currentSection.id === 'gerenciar-chamados') {
                // Atualizar tabela de chamados
                if (window.currentTable && window.currentTable.chamados) {
                    window.currentTable.chamados.reload();
                }
                // Atualizar estatísticas
                if (typeof carregarEstatisticasChamados === 'function') {
                    carregarEstatisticasChamados();
                }
            }
        });

        socket.on('pong', function(data) {
            console.log('Pong recebido:', data.timestamp);
        });

        // Disponibilizar socket globalmente
        window.socket = socket;
        painelSocketInitialized = true;

        console.log('Socket.IO inicializado com sucesso');

    } catch (error) {
        console.error('Erro ao inicializar Socket.IO:', error);
        updateSocketStatus('Erro de Inicialização', 'danger');
    }
}

function updateSocketStatus(status, type) {
    const socketStatus = document.getElementById('socketStatus');
    const socketConnectionStatus = document.getElementById('socketConnectionStatus');
    
    const classMap = {
        'success': 'bg-success',
        'danger': 'bg-danger',
        'warning': 'bg-warning'
    };
    
    if (socketStatus) {
        socketStatus.textContent = status;
        socketStatus.className = `ms-2 badge ${classMap[type] || 'bg-secondary'}`;
    }
    
    if (socketConnectionStatus) {
        socketConnectionStatus.textContent = status;
        socketConnectionStatus.className = `badge ${classMap[type] || 'bg-secondary'}`;
    }
}

// Inicializar Socket.IO quando o DOM estiver carregado
// REMOVIDO: DOMContentLoaded duplicado - Socket.IO e botões já são inicializados no principal

// ==================== FUNCIONALIDADES DE AGENTES ====================
// agentesData is declared in agentes.js

// Event listener para botão "Criar Agente"
document.getElementById('btnCriarAgente')?.addEventListener('click', async function() {
    await carregarUsuariosParaAgente();
    document.getElementById('modalCriarAgente').classList.add('active');
});

// Event listeners para modal de agente
document.getElementById('modalCriarAgenteClose')?.addEventListener('click', function() {
    document.getElementById('modalCriarAgente').classList.remove('active');
});

document.getElementById('btnCancelarAgente')?.addEventListener('click', function() {
    document.getElementById('modalCriarAgente').classList.remove('active');
});

document.getElementById('btnSalvarAgente')?.addEventListener('click', async function() {
    await criarAgente();
});

document.getElementById('formCriarAgente')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    await criarAgente();
});

// Carregar usuários para seleção no modal de agente
async function carregarUsuariosParaAgente() {
    try {
        const response = await fetch('/ti/painel/api/usuarios-disponiveis');
        if (!response.ok) {
            throw new Error('Erro ao carregar usuários');
        }
        const usuarios = await response.json();
        const select = document.getElementById('selectUsuarioAgente');

        // Limpar opções existentes (exceto a primeira)
        select.innerHTML = '<option value="">Selecione um usuário</option>';

        // Adicionar usuários não bloqueados
        usuarios.filter(u => !u.bloqueado).forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nome} ${usuario.sobrenome} (${usuario.usuario})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar lista de usuários');
        }
    }
}

// Criar agente
async function criarAgente() {
    const usuarioId = document.getElementById('selectUsuarioAgente').value;
    const nivelExperiencia = document.getElementById('nivelExperienciaAgente').value;
    const maxChamados = parseInt(document.getElementById('maxChamadosAgente').value);
    const ativo = document.getElementById('ativoAgente').checked;

    // Coletar especialidades selecionadas
    const especialidades = [];
    document.querySelectorAll('#modalCriarAgente input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id !== 'ativoAgente') {
            especialidades.push(checkbox.value);
        }
    });

    if (!usuarioId) {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Selecione um usuário');
        }
        return;
    }

    try {
        const response = await fetch('/ti/painel/api/agentes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: parseInt(usuarioId),
                nivel_experiencia: nivelExperiencia,
                max_chamados_simultaneos: maxChamados,
                especialidades: especialidades,
                ativo: ativo
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar agente');
        }

        const data = await response.json();

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Agente Criado', `Agente ${data.nome} criado com sucesso!`);
        }

        // Fechar modal e resetar formulário
        document.getElementById('modalCriarAgente').classList.remove('active');
        document.getElementById('formCriarAgente').reset();

        // Recarregar lista de agentes se estiver na seç��o
        if (document.getElementById('agentes-suporte').classList.contains('active')) {
            await carregarAgentes();
        }

    } catch (error) {
        console.error('Erro ao criar agente:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

// Carregar agentes
async function carregarAgentes() {
    try {
        console.log('Carregando agentes...');
        const response = await fetch('/ti/painel/api/agentes');
        if (!response.ok) {
            throw new Error('Erro ao carregar agentes');
        }
        agentesData = await response.json();
        console.log('Agentes carregados:', agentesData);
        renderizarAgentes(agentesData);

        // Carregar estatísticas dos agentes
        await carregarEstatisticasAgentes();

    } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar agentes');
        }
    }
}

// Renderizar lista de agentes
function renderizarAgentes(agentes = null) {
    // Usar dados passados como parâmetro ou dados globais
    const dadosAgentes = agentes || agentesData;

    const container = document.querySelector('#agentes-suporte .cards-grid') || document.getElementById('agentesGrid');
    if (!container) return;

    container.innerHTML = '';

    if (!dadosAgentes || dadosAgentes.length === 0) {
        container.innerHTML = '<p class="text-center py-4">Nenhum agente cadastrado.</p>';
        return;
    }

    dadosAgentes.forEach(agente => {
        const card = document.createElement('div');
        card.className = 'card';

        const statusClass = agente.ativo ? 'status-concluido' : 'status-cancelado';
        const statusText = agente.ativo ? 'Ativo' : 'Inativo';

        card.innerHTML = `
            <div class="card-header">
                <h3>${agente.nome} ${agente.sobrenome}</h3>
                <div class="status-badge ${statusClass}">
                    <i class="fas ${agente.ativo ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${statusText}
                </div>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <strong>Usuário:</strong>
                    <span>${agente.usuario}</span>
                </div>
                <div class="info-row">
                    <strong>Nível:</strong>
                    <span>${agente.nivel_experiencia}</span>
                </div>
                <div class="info-row">
                    <strong>Máx. Chamados:</strong>
                    <span>${agente.max_chamados_simultaneos}</span>
                </div>
                <div class="info-row">
                    <strong>Chamados Ativos:</strong>
                    <span>${agente.chamados_ativos || 0}</span>
                </div>
                <div class="info-row">
                    <strong>Especialidades:</strong>
                    <span>${agente.especialidades ? agente.especialidades.join(', ') : 'Nenhuma'}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm" onclick="editarAgente(${agente.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn ${agente.ativo ? 'btn-warning' : 'btn-success'} btn-sm"
                        onclick="toggleAgenteStatus(${agente.id}, ${!agente.ativo})">
                    <i class="fas ${agente.ativo ? 'fa-pause' : 'fa-play'}"></i>
                    ${agente.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirAgente(${agente.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Toggle status do agente
async function toggleAgenteStatus(agenteId, novoStatus) {
    try {
        const response = await fetch(`/ti/painel/api/agentes/${agenteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ativo: novoStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao alterar status');
        }

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Status Alterado', `Agente ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
        }

        await carregarAgentes();

    } catch (error) {
        console.error('Erro ao alterar status:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

// Excluir agente
async function excluirAgente(agenteId) {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;

    try {
        const response = await fetch(`/ti/painel/api/agentes/${agenteId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir agente');
        }

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Agente Excluído', 'Agente excluído com sucesso!');
        }

        await carregarAgentes();

    } catch (error) {
        console.error('Erro ao excluir agente:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

// ==================== FUNCIONALIDADES DE GRUPOS ====================
// gruposData is declared in grupos.js

// Event listener para botão "Criar Grupo"
document.getElementById('btnCriarGrupo')?.addEventListener('click', function() {
    document.getElementById('modalCriarGrupo').classList.add('active');
});

// Event listeners para modal de grupo
document.getElementById('modalCriarGrupoClose')?.addEventListener('click', function() {
    document.getElementById('modalCriarGrupo').classList.remove('active');
});

document.getElementById('btnCancelarGrupo')?.addEventListener('click', function() {
    document.getElementById('modalCriarGrupo').classList.remove('active');
});

document.getElementById('btnSalvarGrupo')?.addEventListener('click', async function() {
    await criarGrupo();
});

document.getElementById('formCriarGrupo')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    await criarGrupo();
});

// Criar grupo
async function criarGrupo() {
    const nome = document.getElementById('nomeGrupo').value.trim();
    const descricao = document.getElementById('descricaoGrupo').value.trim();

    if (!nome) {
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Nome do grupo é obrigatório');
        }
        return;
    }

    try {
        const response = await fetch('/ti/painel/api/grupos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                descricao: descricao
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar grupo');
        }

        const data = await response.json();

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Grupo Criado', `Grupo "${data.nome}" criado com sucesso!`);
        }

        // Fechar modal e resetar formulário
        document.getElementById('modalCriarGrupo').classList.remove('active');
        document.getElementById('formCriarGrupo').reset();

        // Recarregar lista de grupos se estiver na seção
        if (document.getElementById('grupos-usuarios').classList.contains('active')) {
            await carregarGrupos();
        }

    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

// Carregar grupos
async function carregarGrupos() {
    try {
        const response = await fetch('/ti/painel/api/grupos');
        if (!response.ok) {
            throw new Error('Erro ao carregar grupos');
        }
        gruposData = await response.json();
        renderizarGrupos();
    } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar grupos');
        }
    }
}

// Renderizar lista de grupos
function renderizarGrupos() {
    const container = document.querySelector('#grupos-usuarios .cards-grid');
    if (!container) return;

    container.innerHTML = '';

    if (gruposData.length === 0) {
        container.innerHTML = '<p class="text-center py-4">Nenhum grupo cadastrado.</p>';
        return;
    }

    gruposData.forEach(grupo => {
        const card = document.createElement('div');
        card.className = 'card';

        const statusClass = grupo.ativo ? 'status-concluido' : 'status-cancelado';
        const statusText = grupo.ativo ? 'Ativo' : 'Inativo';

        card.innerHTML = `
            <div class="card-header">
                <h3>${grupo.nome}</h3>
                <div class="status-badge ${statusClass}">
                    <i class="fas ${grupo.ativo ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${statusText}
                </div>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <strong>Descrição:</strong>
                    <span>${grupo.descricao || 'Sem descrição'}</span>
                </div>
                <div class="info-row">
                    <strong>Membros:</strong>
                    <span>${grupo.membros_count || 0}</span>
                </div>
                <div class="info-row">
                    <strong>Unidades:</strong>
                    <span>${grupo.unidades_count || 0}</span>
                </div>
                <div class="info-row">
                    <strong>Criado por:</strong>
                    <span>${grupo.criador_nome || 'N/A'}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm" onclick="gerenciarMembrosGrupo(${grupo.id})">
                    <i class="fas fa-users"></i> Membros
                </button>
                <button class="btn btn-info btn-sm" onclick="editarGrupo(${grupo.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirGrupo(${grupo.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Excluir grupo
async function excluirGrupo(grupoId) {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;

    try {
        const response = await fetch(`/ti/painel/api/grupos/${grupoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir grupo');
        }

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Grupo Excluído', 'Grupo excluído com sucesso!');
        }

        await carregarGrupos();

    } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

// Garantir que agentes e grupos sejam carregados corretamente
function loadSectionContentEnhanced(sectionId) {
    // Chamar a funç��o original primeiro
    if (typeof loadSectionContent === 'function') {
        loadSectionContent(sectionId);
    }

    // Adicionar funcionalidades específicas
    switch(sectionId) {
        case 'agentes-suporte':
            setTimeout(() => {
                if (typeof carregarAgentes === 'function') {
                    carregarAgentes();
                }
            }, 100);
            break;
        case 'auditoria-logs':
            setTimeout(() => {
                if (typeof inicializarAuditoria === 'function') {
                    inicializarAuditoria();
                }
            }, 100);
            break;
        case 'grupos-usuarios':
            setTimeout(() => {
                if (typeof inicializarGrupos === 'function') {
                    inicializarGrupos();
                }
                if (typeof carregarGrupos === 'function') {
                    carregarGrupos();
                }
                inicializarModalGrupos();
            }, 100);
            break;
    }
}

// Sobrescrever apenas se necessário
if (typeof loadSectionContent !== 'undefined') {
    const originalFunction = loadSectionContent;
    loadSectionContent = function(sectionId) {
        originalFunction(sectionId);
        loadSectionContentEnhanced(sectionId);
    };
} else {
    loadSectionContent = loadSectionContentEnhanced;
}

// Placeholder functions para funcionalidades futuras
function editarAgente(agenteId) {
    console.log('Editar agente:', agenteId);
    // TODO: Implementar modal de edição de agente
}

function editarGrupo(grupoId) {
    console.log('Editar grupo:', grupoId);
    // TODO: Implementar modal de edição de grupo
}

function gerenciarMembrosGrupo(grupoId) {
    console.log('Gerenciar membros do grupo:', grupoId);
    // TODO: Implementar modal de gerenciamento de membros
}

// ==================== FILTRO DE AGENTES EM CHAMADOS ====================

// Adicionar filtro de agente na seção de gerenciar chamados
function adicionarFiltroAgente() {
    // Verificar se o filtro já existe
    if (document.getElementById('filtroAgente')) return;

    // Encontrar o container de filtros na seção de gerenciar chamados
    const secaoGerenciar = document.getElementById('gerenciar-chamados');
    if (!secaoGerenciar) return;

    // Procurar pelo container de filtros existente
    let filtrosContainer = secaoGerenciar.querySelector('.d-flex.mb-3');

    // Se não existir, criar um
    if (!filtrosContainer) {
        filtrosContainer = document.createElement('div');
        filtrosContainer.className = 'd-flex mb-3 align-items-center flex-wrap gap-2';

        // Inserir antes do grid de chamados
        const chamadosGrid = secaoGerenciar.querySelector('#chamadosGrid');
        if (chamadosGrid) {
            chamadosGrid.parentNode.insertBefore(filtrosContainer, chamadosGrid);
        }
    }

    // Criar label e select para agente
    const labelAgente = document.createElement('label');
    labelAgente.textContent = 'Filtrar por Agente:';
    labelAgente.className = 'me-2';

    const filtroAgente = document.createElement('select');
    filtroAgente.id = 'filtroAgente';
    filtroAgente.className = 'form-control me-3';
    filtroAgente.style.maxWidth = '200px';
    filtroAgente.innerHTML = '<option value="">Todos os agentes</option>';

    // Adicionar event listener
    filtroAgente.addEventListener('change', function() {
        renderChamadosPage(1);
    });

    // Adicionar ao container
    filtrosContainer.appendChild(labelAgente);
    filtrosContainer.appendChild(filtroAgente);

    // Carregar agentes para o filtro
    carregarAgentesParaFiltro();
}

// Carregar agentes para filtro
async function carregarAgentesParaFiltro() {
    try {
        const response = await fetch('/ti/painel/api/agentes');
        if (!response.ok) return;

        const agentes = await response.json();
        const select = document.getElementById('filtroAgente');
        if (!select) return;

        // Limpar e adicionar opções
        select.innerHTML = '<option value="">Todos os agentes</option>';
        agentes.filter(a => a.ativo).forEach(agente => {
            const option = document.createElement('option');
            option.value = agente.id;
            option.textContent = `${agente.nome} ${agente.sobrenome}`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar agentes para filtro:', error);
    }
}

// ==================== FILTRO DE PERMISSÕES ====================

function inicializarFiltroPermissoes() {
    console.log('Tentando inicializar filtro de permissões...');

    const filtroInput = document.getElementById('filtroPermissoes');
    const btnFiltrar = document.getElementById('btnFiltrarPermissoes');

    console.log('Elementos encontrados:', { filtroInput: !!filtroInput, btnFiltrar: !!btnFiltrar });

    if (!filtroInput || !btnFiltrar) {
        console.log('Elementos de filtro não encontrados. Tentando novamente...');
        setTimeout(inicializarFiltroPermissoes, 200);
        return;
    }

    // Função para filtrar usuários
    const filtrarUsuarios = () => {
        const termoBusca = filtroInput.value.trim();
        console.log('Executando filtro com termo:', termoBusca);
        filtrarListaUsuarios(termoBusca, 1); // Sempre começar da primeira página em nova busca
    };

    // Event listeners para busca em tempo real (increased debounce to reduce flickering)
    filtroInput.addEventListener('input', debounce(filtrarUsuarios, 500));
    btnFiltrar.addEventListener('click', filtrarUsuarios);

    // Filtrar ao pressionar Enter
    filtroInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            filtrarUsuarios();
        }
    });

    // Adicionar placeholder mais descritivo
    filtroInput.placeholder = 'Buscar por nome, email, unidade ou nível de acesso...';

    // Funcionalidade para limpar filtro com Escape
    filtroInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            filtroInput.value = '';
            filtrarUsuarios();
            filtroInput.blur();
        }
    });

    // Mostrar/esconder ��cone de limpeza
    filtroInput.addEventListener('input', function() {
        const parentGroup = filtroInput.closest('.input-group');
        if (parentGroup) {
            let clearBtn = parentGroup.querySelector('.btn-clear-filter');
            if (filtroInput.value.trim() && !clearBtn) {
                clearBtn = document.createElement('button');
                clearBtn.className = 'btn btn-outline-secondary btn-clear-filter';
                clearBtn.type = 'button';
                clearBtn.innerHTML = '<i class="fas fa-times"></i>';
                clearBtn.title = 'Limpar filtro';
                clearBtn.onclick = function() {
                    filtroInput.value = '';
                    filtrarUsuarios();
                    filtroInput.focus();
                    clearBtn.remove();
                };
                parentGroup.appendChild(clearBtn);
            } else if (!filtroInput.value.trim() && clearBtn) {
                clearBtn.remove();
            }
        }
    });

    console.log('Filtro de permissões inicializado com sucesso!');

    // Carregar usuários inicialmente
    filtrarListaUsuarios('', 1);
}

// Variáveis para controle de paginação de usuários (reutilizando variável já declarada)
// let currentUsuariosPage = 1; // REMOVIDO: Já declarado anteriormente
let currentUsuariosBusca = '';
let isSearching = false;

async function filtrarListaUsuarios(termoBusca, page = 1) {
    console.log(`Filtrando usu��rios com termo: "${termoBusca}", p��gina: ${page}`);

    // Prevent multiple simultaneous requests
    if (isSearching) {
        console.log('Busca já em andamento, aguardando...');
        return;
    }

    try {
        isSearching = true;
        // Atualizar variáveis globais
        currentUsuariosBusca = termoBusca;
        currentUsuariosPage = page;

        // Construir parâmetros da requisição
        const params = new URLSearchParams({
            page: page,
            per_page: 12,
            busca: termoBusca
        });

        const response = await fetch(`/ti/painel/api/usuarios?${params}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar usuários');
        }

        const data = await response.json();

        // Extract usuarios array from API response
        const usuarios = data && data.usuarios ? data.usuarios : (Array.isArray(data) ? data : []);

        // Store for global access
        window.currentUsuariosList = usuarios;

        // Renderizar usuários
        renderizarUsuarios(usuarios);

        // Create pagination object with correct structure
        const pagination = {
            total: data.total || 0,
            pages: data.pages || 1,
            page: data.current_page || page,
            per_page: data.per_page || 12,
            has_next: data.has_next || false,
            has_prev: data.has_prev || false
        };

        // Renderizar paginação
        renderizarPaginacaoUsuarios(pagination);

        // Feedback visual no input (using CSS classes instead of inline styles)
        const filtroInput = document.getElementById('filtroPermissoes');
        if (filtroInput) {
            if (termoBusca) {
                filtroInput.classList.add('searching');
            } else {
                filtroInput.classList.remove('searching');
            }
        }

        console.log(`Busca concluída: ${usuarios.length} usuário(s) encontrado(s) de ${pagination.total} total`);

    } catch (error) {
        console.error('Erro ao filtrar usuários:', error);

        // Mostrar mensagem de erro
        const usuariosGrid = document.getElementById('usuariosGrid');
        if (usuariosGrid) {
            usuariosGrid.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Erro ao carregar usuários: ${error.message}
                    </div>
                </div>
            `;
        }
    } finally {
        isSearching = false;
    }
}

function renderizarUsuarios(usuarios) {
    const usuariosGrid = document.getElementById('usuariosGrid');
    if (!usuariosGrid) {
        console.log('usuariosGrid não encontrado');
        return;
    }

    // Verificação de segurança para array de usuários
    if (!usuarios || !Array.isArray(usuarios)) {
        console.warn('Array de usuários inválido:', usuarios);
        usuariosGrid.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning"></i>
                    </div>
                    <h4>Erro ao carregar usuários</h4>
                    <p class="text-muted">Dados inválidos recebidos do servidor</p>
                </div>
            </div>
        `;
        return;
    }

    if (usuarios.length === 0) {
        usuariosGrid.innerHTML = `
            <div class="col-12 text-center py-4" id="mensagemUsuariosVazia">
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search fa-3x text-muted"></i>
                    </div>
                    <h4>Nenhum usuário encontrado</h4>
                    <p class="text-muted">Tente usar termos de busca diferentes</p>
                </div>
            </div>
        `;
        return;
    }

    // Renderizar cards dos usuários com verificações de segurança
    usuariosGrid.innerHTML = usuarios.map(usuario => {
        // Verificações de propriedades essenciais
        if (!usuario || typeof usuario !== 'object') {
            console.warn('Objeto de usuário inválido:', usuario);
            return '<div class="card"><div class="card-body text-danger">Dados de usuário inv��lidos</div></div>';
        }

        const nome = usuario.nome || 'Nome não informado';
        const sobrenome = usuario.sobrenome || '';
        const email = usuario.email || 'Email não informado';
        const usuarioLogin = usuario.usuario || 'Usuário não informado';
        const nivelAcesso = usuario.nivel_acesso || 'Não definido';
        const setores = usuario.setores || usuario.setor || 'Não definido';
        const dataCriacao = usuario.data_criacao || usuario.data_cadastro || 'Não informado';
        const bloqueado = Boolean(usuario.bloqueado);
        const id = usuario.id;

        if (!id) {
            console.warn('ID de usuário não encontrado:', usuario);
            return '<div class="card"><div class="card-body text-danger">ID de usuário inválido</div></div>';
        }

        return `
            <div class="card usuario-card">
                <div class="card-header">
                    <h3>${nome} ${sobrenome}</h3>
                    <span class="status-badge ${bloqueado ? 'bg-danger' : 'bg-success'}">
                        ${bloqueado ? 'Bloqueado' : 'Ativo'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <i class="fas fa-user"></i>
                        <span>${usuarioLogin}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-envelope"></i>
                        <span>${email}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-shield-alt"></i>
                        <span>${nivelAcesso}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-building"></i>
                        <span>${setores}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-calendar"></i>
                        <span>${dataCriacao}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" onclick="editarUsuario(${id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    ${bloqueado ?
                        `<button class="btn btn-success btn-sm" onclick="desbloquearUsuario(${id})">
                            <i class="fas fa-unlock"></i> Desbloquear
                        </button>` :
                        `<button class="btn btn-warning btn-sm" onclick="bloquearUsuario(${id})">
                            <i class="fas fa-lock"></i> Bloquear
                        </button>`
                    }
                    <button class="btn btn-info btn-sm" onclick="gerarNovaSenha(${id})">
                        <i class="fas fa-key"></i> Nova Senha
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirUsuario(${id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Missing functions for the permissions section buttons
function editarUsuario(usuarioId) {
    console.log('Editando usuário:', usuarioId);
    abrirModalEditarUsuario(usuarioId);
}

function bloquearUsuario(usuarioId) {
    console.log('Bloqueando usuário:', usuarioId);
    toggleBloqueioUsuario(usuarioId);
}

function desbloquearUsuario(usuarioId) {
    console.log('Desbloqueando usuário:', usuarioId);
    toggleBloqueioUsuario(usuarioId);
}

// Make functions globally available
window.editarUsuario = editarUsuario;
window.bloquearUsuario = bloquearUsuario;
window.desbloquearUsuario = desbloquearUsuario;
window.gerarNovaSenha = gerarNovaSenha;
window.excluirUsuario = excluirUsuario;

// Add event listeners for edit modal (initialize once)
function initializeEditModalListeners() {
    // Close modal listeners
    const closeBtn = document.getElementById('modalEditarUsuarioClose');
    const cancelBtn = document.getElementById('btnCancelarEdicao');
    const modal = document.getElementById('modalEditarUsuario');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Click outside to close
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Save button listener
    const saveBtn = document.getElementById('btnSalvarUsuario');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const usuarioId = document.getElementById('editUsuarioId').value;
            const nome = document.getElementById('editNomeUsuario').value.trim();
            const sobrenome = document.getElementById('editSobrenomeUsuario').value.trim();
            const usuario = document.getElementById('editUsuarioLogin').value.trim();
            const email = document.getElementById('editEmailUsuario').value.trim();
            const nivelAcesso = document.getElementById('editNivelAcesso').value;
            const setorSelect = document.getElementById('editSetorUsuario');
            const setores = Array.from(setorSelect.selectedOptions).map(option => option.value);
            const bloqueado = document.getElementById('editBloqueado').checked;

            try {
                const response = await fetch(`/ti/painel/api/usuarios/${usuarioId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome,
                        sobrenome,
                        usuario,
                        email,
                        nivel_acesso: nivelAcesso,
                        setores,
                        bloqueado
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao atualizar usuário');
                }

                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showSuccess('Usuário Atualizado', 'Usuário atualizado com sucesso!');
                }
                modal.classList.remove('active');

                // Refresh the users list
                if (typeof loadUsuarios === 'function') {
                    await loadUsuarios();
                }
                // Also refresh the permissions list
                if (typeof filtrarListaUsuarios === 'function') {
                    await filtrarListaUsuarios(currentUsuariosBusca || '', currentUsuariosPage || 1);
                }
            } catch (error) {
                console.error('Erro ao atualizar usuário:', error);
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showError('Erro', `Erro: ${error.message}`);
                }
            }
        });
    }
}

// Initialize modal listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEditModalListeners);
} else {
    initializeEditModalListeners();
}

function renderizarPaginacaoUsuarios(pagination) {
    const paginationContainer = document.getElementById('usuariosPagination');

    // Verificações de segurança
    if (!pagination) {
        console.warn('Dados de paginação não fornecidos');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    if (!paginationContainer || (pagination.pages || 0) <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <nav aria-label="Paginação de usuários">
            <ul class="pagination justify-content-center">
    `;

    // Bot��o anterior
    if (pagination.has_prev) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarListaUsuarios('${currentUsuariosBusca}', ${pagination.page - 1})">
                    <i class="fas fa-chevron-left"></i> Anterior
                </a>
            </li>
        `;
    }

    // Páginas numeradas
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);

    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarListaUsuarios('${currentUsuariosBusca}', 1)">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === pagination.page ? 'active' : ''}">
                <a class="page-link" href="#" onclick="filtrarListaUsuarios('${currentUsuariosBusca}', ${i})">${i}</a>
            </li>
        `;
    }

    if (endPage < pagination.pages) {
        if (endPage < pagination.pages - 1) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarListaUsuarios('${currentUsuariosBusca}', ${pagination.pages})">${pagination.pages}</a>
            </li>
        `;
    }

    // Botão próximo
    if (pagination.has_next) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarListaUsuarios('${currentUsuariosBusca}', ${pagination.page + 1})">
                    Próximo <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    }

    paginationHTML += `
            </ul>
        </nav>
        <div class="text-center mt-2">
            <small class="text-muted">
                P��gina ${pagination.page} de ${pagination.pages}
                (${pagination.total} usuário${pagination.total !== 1 ? 's' : ''} total)
            </small>
        </div>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// ==================== FUNCIONALIDADES DE GRUPOS ====================

function inicializarModalGrupos() {
    const btnCriarGrupo = document.getElementById('btnCriarGrupo');
    const modalCriarGrupo = document.getElementById('modalCriarGrupo');
    const btnCancelarGrupo = document.getElementById('btnCancelarGrupo');
    const btnSalvarGrupo = document.getElementById('btnSalvarGrupo');
    const modalClose = document.getElementById('modalCriarGrupoClose');

    if (!btnCriarGrupo || !modalCriarGrupo) return;

    // Abrir modal
    btnCriarGrupo.addEventListener('click', async () => {
        await carregarUnidadesParaGrupo();
        modalCriarGrupo.classList.add('active');
    });

    // Fechar modal
    [btnCancelarGrupo, modalClose].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                modalCriarGrupo.classList.remove('active');
                limparFormularioGrupo();
            });
        }
    });

    // Salvar grupo
    if (btnSalvarGrupo) {
        btnSalvarGrupo.addEventListener('click', criarGrupo);
    }

    // Adicionar botões de seleção de unidades
    adicionarBotoesSelecaoUnidades();
}

async function carregarUnidadesParaGrupo() {
    try {
        const response = await fetch('/ti/painel/api/unidades');
        if (!response.ok) {
            throw new Error('Erro ao carregar unidades');
        }

        const unidades = await response.json();
        const select = document.getElementById('unidadesGrupo');

        if (!select) return;

        // Limpar e carregar unidades
        select.innerHTML = '';

        unidades.forEach(unidade => {
            const option = document.createElement('option');
            option.value = unidade.id;
            option.textContent = unidade.nome;
            select.appendChild(option);
        });

        console.log(`${unidades.length} unidades carregadas para seleção`);

    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar lista de unidades');
        }
    }
}

function adicionarBotoesSelecaoUnidades() {
    const unidadesGrupo = document.getElementById('unidadesGrupo');
    if (!unidadesGrupo) return;

    // Verificar se já existem botões
    const containerExistente = unidadesGrupo.parentNode.querySelector('.buttons-container');
    if (containerExistente) {
        containerExistente.remove();
    }

    // Criar container para botões
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container mt-2';

    // Botão selecionar todas
    const btnSelecionarTodas = document.createElement('button');
    btnSelecionarTodas.type = 'button';
    btnSelecionarTodas.className = 'btn btn-sm btn-outline-primary me-2';
    btnSelecionarTodas.innerHTML = '<i class="fas fa-check-double"></i> Selecionar Todas';
    btnSelecionarTodas.onclick = () => selecionarTodasUnidades(true);

    // Botão desmarcar todas
    const btnDesmarcarTodas = document.createElement('button');
    btnDesmarcarTodas.type = 'button';
    btnDesmarcarTodas.className = 'btn btn-sm btn-outline-secondary';
    btnDesmarcarTodas.innerHTML = '<i class="fas fa-times"></i> Desmarcar Todas';
    btnDesmarcarTodas.onclick = () => selecionarTodasUnidades(false);

    buttonsContainer.appendChild(btnSelecionarTodas);
    buttonsContainer.appendChild(btnDesmarcarTodas);

    // Inserir após o select
    unidadesGrupo.parentNode.insertBefore(buttonsContainer, unidadesGrupo.nextSibling);
}

function selecionarTodasUnidades(selecionar) {
    const select = document.getElementById('unidadesGrupo');
    if (!select) return;

    for (let option of select.options) {
        option.selected = selecionar;
    }

    // Disparar evento de mudança
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
}

async function criarGrupo() {
    try {
        const nome = document.getElementById('nomeGrupo').value.trim();
        const descricao = document.getElementById('descricaoGrupo').value.trim();
        const ativo = document.getElementById('ativoGrupo').checked;
        const unidadesSelect = document.getElementById('unidadesGrupo');

        if (!nome) {
            if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showError('Erro', 'Nome do grupo é obrigat��rio');
            }
            return;
        }

        // Coletar unidades selecionadas
        const unidadesSelecionadas = Array.from(unidadesSelect.selectedOptions).map(option =>
            parseInt(option.value)
        );

        const dadosGrupo = {
            nome,
            descricao,
            ativo,
            unidades: unidadesSelecionadas
        };

        const response = await fetch('/ti/painel/api/grupos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosGrupo)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar grupo');
        }

        const resultado = await response.json();

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Sucesso', resultado.message || 'Grupo criado com sucesso');
        }

        // Fechar modal e recarregar lista
        document.getElementById('modalCriarGrupo').classList.remove('active');
        limparFormularioGrupo();
        await carregarGrupos();

    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

function limparFormularioGrupo() {
    const form = document.getElementById('formCriarGrupo');
    if (form) {
        form.reset();
    }

    // Desmarcar todas as unidades
    const select = document.getElementById('unidadesGrupo');
    if (select) {
        for (let option of select.options) {
            option.selected = false;
        }
    }
}

async function carregarGrupos() {
    try {
        const response = await fetch('/ti/painel/api/grupos');
        if (!response.ok) {
            throw new Error('Erro ao carregar grupos');
        }

        const grupos = await response.json();
        renderizarGrupos(grupos);

    } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar grupos');
        }
    }
}

function renderizarGrupos(grupos) {
    const container = document.getElementById('gruposGrid');
    if (!container) return;

    if (!grupos || grupos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nenhum grupo encontrado</h5>
                <p class="text-muted">Crie o primeiro grupo para organizar usuários</p>
            </div>
        `;
        return;
    }

    container.innerHTML = grupos.map(grupo => `
        <div class="card group-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title group-name">${grupo.nome}</h5>
                    <span class="badge ${grupo.ativo ? 'bg-success' : 'bg-secondary'}">
                        ${grupo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <p class="card-text group-description text-muted">${grupo.descricao || 'Sem descrição'}</p>
                <div class="group-stats mb-3">
                    <small class="text-muted">
                        <i class="fas fa-users"></i> ${grupo.membros_count} membros •
                        <i class="fas fa-building"></i> ${grupo.unidades_count} unidades
                    </small>
                </div>
                <div class="group-info">
                    <small class="text-muted">
                        Criado por: ${grupo.criado_por}<br>
                        Data: ${grupo.data_criacao}
                    </small>
                </div>
                <div class="card-actions mt-3">
                    <button class="btn btn-sm btn-primary" onclick="editarGrupo(${grupo.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-info" onclick="gerenciarMembros(${grupo.id})">
                        <i class="fas fa-users"></i> Membros
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirGrupo(${grupo.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== CARREGAR AGENTES ====================

async function carregarEstatisticasAgentes() {
    try {
        const response = await fetch('/ti/painel/api/agentes/estatisticas');
        if (!response.ok) {
            throw new Error('Erro ao carregar estatísticas dos agentes');
        }
        const estatisticas = await response.json();
        atualizarEstatisticasAgentes(estatisticas);
    } catch (error) {
        console.error('Erro ao carregar estat��sticas dos agentes:', error);
        // Tentar usar dados locais se disponíveis
        if (agentesData && agentesData.length > 0) {
            atualizarEstatisticasAgentesLocal(agentesData);
        }
    }
}

function atualizarEstatisticasAgentes(estatisticas) {
    const totalAgentes = document.getElementById('totalAgentes');
    const agentesAtivos = document.getElementById('agentesAtivos');
    const chamadosAtribuidos = document.getElementById('chamadosAtribuidos');
    const agentesDisponiveis = document.getElementById('agentesDisponiveis');

    if (totalAgentes) totalAgentes.textContent = estatisticas.total_agentes || 0;
    if (agentesAtivos) agentesAtivos.textContent = estatisticas.agentes_ativos || 0;
    if (chamadosAtribuidos) chamadosAtribuidos.textContent = estatisticas.chamados_atribuidos || 0;
    if (agentesDisponiveis) agentesDisponiveis.textContent = estatisticas.agentes_disponiveis || 0;
}

function atualizarEstatisticasAgentesLocal(agentes) {
    const totalAgentes = document.getElementById('totalAgentes');
    const agentesAtivos = document.getElementById('agentesAtivos');
    const chamadosAtribuidos = document.getElementById('chamadosAtribuidos');
    const agentesDisponiveis = document.getElementById('agentesDisponiveis');

    if (totalAgentes) totalAgentes.textContent = agentes.length;
    if (agentesAtivos) agentesAtivos.textContent = agentes.filter(a => a.ativo).length;
    if (chamadosAtribuidos) chamadosAtribuidos.textContent = agentes.reduce((sum, a) => sum + (a.chamados_ativos || 0), 0);
    if (agentesDisponiveis) agentesDisponiveis.textContent = agentes.filter(a => a.pode_receber_chamado).length;
}

// ==================== CONFIGURAÇÕES AVANÇADAS ====================

async function carregarConfiguracoesAvancadas() {
    try {
        const response = await fetch('/ti/painel/api/configuracoes-avancadas');
        if (!response.ok) {
            throw new Error('Erro ao carregar configurações avançadas');
        }

        const config = await response.json();
        preencherFormularioConfiguracoesAvancadas(config);

    } catch (error) {
        console.error('Erro ao carregar configurações avançadas:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar configurações avançadas');
        }
    }
}

function preencherFormularioConfiguracoesAvancadas(config) {
    // Sistema
    if (config.sistema) {
        const sistema = config.sistema;
        setValueById('debugMode', sistema.debug_mode);
        setValueById('logLevel', sistema.log_level);
        setValueById('maxFileSize', sistema.max_file_size);
        setValueById('sessionTimeout', sistema.session_timeout);
        setValueById('autoLogout', sistema.auto_logout);
    }

    // Segurança
    if (config.seguranca) {
        const seguranca = config.seguranca;
        setValueById('forceHttps', seguranca.force_https);
        setValueById('csrfProtection', seguranca.csrf_protection);
        setValueById('rateLimiting', seguranca.rate_limiting);
        setValueById('passwordComplexity', seguranca.password_complexity);
    }

    // Performance
    if (config.performance) {
        const performance = config.performance;
        setValueById('cacheEnabled', performance.cache_enabled);
        setValueById('compression', performance.compression);
        setValueById('cdnEnabled', performance.cdn_enabled);
        setValueById('databasePoolSize', performance.database_pool_size);
    }

    // Backup
    if (config.backup) {
        const backup = config.backup;
        setValueById('autoBackup', backup.auto_backup);
        setValueById('backupFrequency', backup.backup_frequency);
        setValueById('retentionDays', backup.retention_days);
        setValueById('backupLocation', backup.backup_location);
    }
}

function setValueById(id, value) {
    const element = document.getElementById(id);
    if (element) {
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }
}

// ==================== ALERTAS DO SISTEMA ====================

async function carregarAlertasSistema() {
    try {
        const response = await fetch('/ti/painel/api/alertas?page=1&per_page=10');
        if (!response.ok) {
            throw new Error('Erro ao carregar alertas');
        }

        const data = await response.json();
        renderizarAlertasSistema(data.alertas);

    } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar alertas do sistema');
        }
    }
}

function renderizarAlertasSistema(alertas) {
    const container = document.getElementById('alertasGrid');
    if (!container) return;

    if (!alertas || alertas.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shield-alt fa-3x text-success mb-3"></i>
                <h5 class="text-success">Sistema funcionando normalmente</h5>
                <p class="text-muted">Nenhum alerta ativo no momento</p>
            </div>
        `;
        return;
    }

    container.innerHTML = alertas.map(alerta => `
        <div class="alert alert-${getAlertClass(alerta.tipo)} d-flex align-items-center" role="alert">
            <i class="fas fa-${getAlertIcon(alerta.tipo)} me-2"></i>
            <div class="flex-grow-1">
                <strong>${alerta.titulo}</strong>
                <p class="mb-0">${alerta.mensagem}</p>
                <small class="text-muted">${alerta.data}</small>
            </div>
            <span class="badge bg-${alerta.prioridade === 'crítica' ? 'danger' : alerta.prioridade === 'alta' ? 'warning' : 'info'}">
                ${alerta.prioridade}
            </span>
        </div>
    `).join('');
}

function getAlertClass(tipo) {
    switch(tipo) {
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'secondary';
    }
}

function getAlertIcon(tipo) {
    switch(tipo) {
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'bell';
    }
}

// ==================== BACKUP E MANUTENÇÃO ====================

async function carregarBackupManutencao() {
    try {
        // Adicionar event listeners para os botões existentes
        const btnCriarBackup = document.getElementById('btnCriarBackup');
        if (btnCriarBackup) {
            btnCriarBackup.addEventListener('click', criarBackup);
        }

        console.log('Seção backup/manutenção carregada');
    } catch (error) {
        console.error('Erro ao carregar backup/manutenção:', error);
    }
}

// ==================== LOGS DE ACESSO ====================

async function carregarLogsAcesso() {
    try {
        const tabela = document.getElementById('tabelaLogsAcesso');
        if (tabela) {
            // Simular logs de acesso
            const logs = [
                { usuario: 'Admin', dataLogin: '31/01/2025 10:30:00', dataLogout: '31/01/2025 12:15:00', duracao: '1h 45m', ip: '192.168.1.100', status: 'Ativo' },
                { usuario: 'João Silva', dataLogin: '31/01/2025 10:25:00', dataLogout: '31/01/2025 11:30:00', duracao: '1h 05m', ip: '192.168.1.101', status: 'Finalizado' },
                { usuario: 'Maria Santos', dataLogin: '31/01/2025 10:20:00', dataLogout: '-', duracao: '-', ip: '192.168.1.102', status: 'Bloqueado' }
            ];

            tabela.innerHTML = logs.map(log => `
                <tr>
                    <td>${log.usuario}</td>
                    <td>${log.dataLogin}</td>
                    <td>${log.dataLogout}</td>
                    <td>${log.duracao}</td>
                    <td>${log.ip}</td>
                    <td>
                        <span class="badge bg-${log.status === 'Ativo' ? 'success' : log.status === 'Finalizado' ? 'info' : 'danger'}">
                            ${log.status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }

        // Atualizar estatísticas
        const acessosHoje = document.getElementById('acessosHoje');
        if (acessosHoje) acessosHoje.textContent = '15';

    } catch (error) {
        console.error('Erro ao carregar logs de acesso:', error);
    }
}

// ==================== LOGS DE AÇÕES ====================

async function carregarLogsAcoes() {
    try {
        const response = await fetch('/ti/painel/api/logs/acoes');
        if (!response.ok) {
            throw new Error('Erro ao carregar logs de aç��es');
        }
        const data = await response.json();

        const tabela = document.getElementById('tabelaLogsAcoes');
        if (tabela) {
            tabela.innerHTML = data.logs.map(log => `
                <tr>
                    <td>${log.id}</td>
                    <td>${log.usuario_nome}</td>
                    <td>${log.acao}</td>
                    <td>
                        <span class="badge bg-${log.categoria === 'sistema' ? 'primary' : log.categoria === 'chamado' ? 'info' : log.categoria === 'usuario' ? 'warning' : 'secondary'}">
                            ${log.categoria || 'N/A'}
                        </span>
                    </td>
                    <td>${log.data_acao}</td>
                    <td>${log.ip_address || 'N/A'}</td>
                    <td>
                        <span class="badge bg-${log.sucesso ? 'success' : 'danger'}">
                            ${log.sucesso ? 'Sucesso' : 'Erro'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="verDetalhesLog(${log.id}, '${log.detalhes}', '${log.erro_detalhes}')">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Carregar estatísticas
        await carregarEstatisticasLogsAcoes();

    } catch (error) {
        console.error('Erro ao carregar logs de ações:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar logs de ações');
        }
    }
}

async function carregarEstatisticasLogsAcoes() {
    try {
        const response = await fetch('/ti/painel/api/logs/acoes/estatisticas');
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');

        const stats = await response.json();

        // Atualizar elementos da tela
        const totalAcoes = document.getElementById('totalAcoes');
        if (totalAcoes) totalAcoes.textContent = stats.total_acoes;

        const taxaSucesso = document.getElementById('taxaSucessoAcoes');
        if (taxaSucesso) taxaSucesso.textContent = `${stats.taxa_sucesso}%`;

        const acoesErro = document.getElementById('acoesErro');
        if (acoesErro) acoesErro.textContent = stats.acoes_erro;

    } catch (error) {
        console.error('Erro ao carregar estatísticas de logs:', error);
    }
}

function verDetalhesLog(id, detalhes, erroDetalhes) {
    const modal = document.getElementById('modalDetalhesLog');
    if (modal) {
        const conteudo = document.getElementById('conteudoDetalhesLog');
        if (conteudo) {
            conteudo.innerHTML = `
                <div class="mb-3">
                    <h6>Detalhes da A��ão:</h6>
                    <p class="text-muted">${detalhes || 'Sem detalhes disponíveis'}</p>
                </div>
                ${erroDetalhes ? `
                    <div class="mb-3">
                        <h6 class="text-danger">Detalhes do Erro:</h6>
                        <p class="text-danger">${erroDetalhes}</p>
                    </div>
                ` : ''}
            `;
        }
        modal.classList.add('active');
    }
}

// ==================== ANÁLISE DE PROBLEMAS ====================

async function carregarAnaliseProblemas() {
    try {
        const response = await fetch('/ti/painel/api/analise/problemas');
        if (!response.ok) {
            throw new Error('Erro ao carregar análise de problemas');
        }
        const data = await response.json();

        // Carregar problemas mais frequentes
        const tabelaProblemasFrequentes = document.getElementById('tabelaProblemasFrequentes');
        if (tabelaProblemasFrequentes) {
            tabelaProblemasFrequentes.innerHTML = data.problemas_frequentes.map(problema => `
                <tr>
                    <td>${problema.problema}</td>
                    <td>${problema.quantidade}</td>
                    <td>${problema.tempo_medio_resolucao ? problema.tempo_medio_resolucao.toFixed(1) + 'h' : 'N/A'}</td>
                </tr>
            `).join('');
        }

        // Carregar unidades com mais problemas
        const tabelaUnidadesProblemas = document.getElementById('tabelaUnidadesProblemas');
        if (tabelaUnidadesProblemas) {
            tabelaUnidadesProblemas.innerHTML = data.unidades_problemas.map(unidade => `
                <tr>
                    <td>${unidade.unidade}</td>
                    <td>${unidade.total}</td>
                    <td>${unidade.abertos}</td>
                    <td>${unidade.concluidos}</td>
                    <td>
                        <span class="badge bg-${unidade.taxa_resolucao >= 80 ? 'success' : unidade.taxa_resolucao >= 60 ? 'warning' : 'danger'}">
                            ${unidade.taxa_resolucao}%
                        </span>
                    </td>
                </tr>
            `).join('');
        }

        // Gráfico de tendências semanais
        await renderizarGraficoTendencias(data.tendencias_semanais);

        // Análise por prioridade
        await renderizarGraficoPrioridades(data.resolucao_por_prioridade);

    } catch (error) {
        console.error('Erro ao carregar análise de problemas:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar análise de problemas');
        }
    }
}

async function renderizarGraficoTendencias(tendencias) {
    const ctx = document.getElementById('graficoTendenciasSemanais');
    if (!ctx || !tendencias) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: tendencias.map(t => `Sem ${t.semana}/${t.ano}`),
            datasets: [{
                label: 'Chamados por Semana',
                data: tendencias.map(t => t.quantidade),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tendência de Chamados por Semana'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function renderizarGraficoPrioridades(prioridades) {
    const ctx = document.getElementById('graficoPrioridades');
    if (!ctx || !prioridades) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: prioridades.map(p => p.prioridade),
            datasets: [{
                data: prioridades.map(p => p.total),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuiç��o por Prioridade'
                }
            }
        }
    });
}

// ==================== MONITORAMENTO ====================

async function carregarMonitoramentoCatraca() {
    try {
        // Simulação de dados de catraca
        const dados = {
            status: 'online',
            acessos_hoje: 245,
            acessos_semana: 1680,
            alertas: [
                { id: 1, tipo: 'warning', mensagem: 'Catraca 3 com lentidão', timestamp: '10:30' },
                { id: 2, tipo: 'info', mensagem: 'Manutenção programada às 18h', timestamp: '09:15' }
            ]
        };

        const statusCatraca = document.getElementById('statusCatraca');
        if (statusCatraca) {
            statusCatraca.innerHTML = `
                <span class="badge bg-${dados.status === 'online' ? 'success' : 'danger'}">
                    ${dados.status === 'online' ? 'Online' : 'Offline'}
                </span>
            `;
        }

        const acessosHojeCatraca = document.getElementById('acessosHojeCatraca');
        if (acessosHojeCatraca) acessosHojeCatraca.textContent = dados.acessos_hoje;

        const acessosSemanaCatraca = document.getElementById('acessosSemanaCatraca');
        if (acessosSemanaCatraca) acessosSemanaCatraca.textContent = dados.acessos_semana;

    } catch (error) {
        console.error('Erro ao carregar monitoramento de catraca:', error);
    }
}

async function carregarMonitoramentoMikrotiks() {
    try {
        // Simulação de dados de mikrotiks
        const equipamentos = [
            { nome: 'Router Principal', ip: '192.168.1.1', status: 'online', uptime: '15 dias' },
            { nome: 'Switch Core', ip: '192.168.1.2', status: 'online', uptime: '30 dias' },
            { nome: 'AP WiFi Hall', ip: '192.168.1.10', status: 'warning', uptime: '2 dias' }
        ];

        const tabelaEquipamentos = document.getElementById('tabelaEquipamentos');
        if (tabelaEquipamentos) {
            tabelaEquipamentos.innerHTML = equipamentos.map(eq => `
                <tr>
                    <td>${eq.nome}</td>
                    <td>${eq.ip}</td>
                    <td>
                        <span class="badge bg-${eq.status === 'online' ? 'success' : eq.status === 'warning' ? 'warning' : 'danger'}">
                            ${eq.status === 'online' ? 'Online' : eq.status === 'warning' ? 'Atenção' : 'Offline'}
                        </span>
                    </td>
                    <td>${eq.uptime}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-cog"></i> Config
                        </button>
                    </td>
                </tr>
            `).join('');
        }

    } catch (error) {
        console.error('Erro ao carregar monitoramento de mikrotiks:', error);
    }
}

async function carregarMonitoramentoUsuarios() {
    try {
        // Simulação de dados de usuários ativos
        const usuariosOnline = [
            { nome: 'João Silva', setor: 'TI', login: '10:30', atividade: 'Ativo' },
            { nome: 'Maria Santos', setor: 'Financeiro', login: '09:15', atividade: 'Ativo' },
            { nome: 'Pedro Costa', setor: 'Gerencial', login: '08:45', atividade: 'Inativo (5min)' }
        ];

        const tabelaUsuariosOnline = document.getElementById('tabelaUsuariosOnline');
        if (tabelaUsuariosOnline) {
            tabelaUsuariosOnline.innerHTML = usuariosOnline.map(user => `
                <tr>
                    <td>${user.nome}</td>
                    <td>${user.setor}</td>
                    <td>${user.login}</td>
                    <td>
                        <span class="badge bg-${user.atividade === 'Ativo' ? 'success' : 'warning'}">
                            ${user.atividade}
                        </span>
                    </td>
                </tr>
            `).join('');
        }

        const totalUsuariosOnline = document.getElementById('totalUsuariosOnline');
        if (totalUsuariosOnline) totalUsuariosOnline.textContent = usuariosOnline.length;

    } catch (error) {
        console.error('Erro ao carregar monitoramento de usuários:', error);
    }
}

// ==================== ATRIBUIÇÃO DE AGENTES ====================

let agentesDisponiveis = [];

async function carregarAgentesDisponiveis() {
    try {
        const response = await fetch('/ti/painel/api/agentes');
        if (!response.ok) throw new Error('Erro ao carregar agentes');
        agentesDisponiveis = await response.json();
        return agentesDisponiveis.filter(agente => agente.ativo);
    } catch (error) {
        console.error('Erro ao carregar agentes:', error);
        return [];
    }
}

async function atribuirAgente(chamadoId) {
    try {
        const agentes = await carregarAgentesDisponiveis();

        if (agentes.length === 0) {
            if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showWarning('Aviso', 'Nenhum agente ativo disponível');
            }
            return;
        }

        // Criar modal de seleção de agente
        const modalContent = `
            <div class="modal" id="modalAtribuirAgente" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Atribuir Agente ao Chamado</h3>
                        <button class="close" onclick="fecharModalAgente()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="selectAgente">Selecione o agente:</label>
                            <select id="selectAgente" class="form-control">
                                <option value="">Selecione um agente...</option>
                                ${agentes.map(agente => `
                                    <option value="${agente.id}" ${!agente.pode_receber_chamado ? 'disabled' : ''}>
                                        ${agente.nome} - ${agente.nivel_experiencia}
                                        (${agente.chamados_ativos}/${agente.max_chamados_simultaneos} chamados)
                                        ${!agente.pode_receber_chamado ? ' - LIMITE ATINGIDO' : ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="observacoesAtribuicao">Observações (opcional):</label>
                            <textarea id="observacoesAtribuicao" class="form-control" rows="3" placeholder="Observações sobre a atribuição..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="fecharModalAgente()">Cancelar</button>
                        <button class="btn btn-primary" onclick="confirmarAtribuicao(${chamadoId})">Atribuir</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalContent);

    } catch (error) {
        console.error('Erro ao abrir modal de atribui��ão:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', 'Erro ao carregar agentes');
        }
    }
}

async function alterarAgente(chamadoId) {
    // Usar a mesma função de atribuir para alteração
    await atribuirAgente(chamadoId);
}

async function confirmarAtribuicao(chamadoId) {
    try {
        const agenteSelect = document.getElementById('selectAgente');
        const observacoes = document.getElementById('observacoesAtribuicao');

        const agenteId = agenteSelect.value;
        if (!agenteId) {
            if (window.advancedNotificationSystem) {
                window.advancedNotificationSystem.showWarning('Aviso', 'Selecione um agente');
            }
            return;
        }

        const response = await fetch(`/ti/painel/api/chamados/${chamadoId}/atribuir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                agente_id: parseInt(agenteId),
                observacoes: observacoes.value
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atribuir agente');
        }

        const data = await response.json();

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Sucesso', data.message);
        }

        fecharModalAgente();

        // Recarregar chamados para mostrar a atribui����ão
        await loadChamados();

    } catch (error) {
        console.error('Erro ao atribuir agente:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message);
        }
    }
}

function fecharModalAgente() {
    const modal = document.getElementById('modalAtribuirAgente');
    if (modal) {
        modal.remove();
    }
}

// ==================== EVENT LISTENERS PARA FILTROS ====================

document.addEventListener('DOMContentLoaded', function() {
    // Botão filtrar chamados
    const btnFiltrarChamados = document.getElementById('btnFiltrarChamados');
    if (btnFiltrarChamados) {
        btnFiltrarChamados.addEventListener('click', function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }

    // Botão limpar filtros
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', function() {
            // Limpar todos os campos de filtro
            const filtroSolicitante = document.getElementById('filtroSolicitante');
            const filtroProblema = document.getElementById('filtroProblema');
            const filtroPrioridade = document.getElementById('filtroPrioridade');
            const filtroAgenteResponsavel = document.getElementById('filtroAgenteResponsavel');
            const filtroUnidade = document.getElementById('filtroUnidade');
            const filtroDataInicio = document.getElementById('filtroDataInicio');
            const filtroDataFim = document.getElementById('filtroDataFim');

            if (filtroSolicitante) filtroSolicitante.value = '';
            if (filtroProblema) filtroProblema.value = '';
            if (filtroPrioridade) filtroPrioridade.value = '';
            if (filtroAgenteResponsavel) filtroAgenteResponsavel.value = '';
            if (filtroUnidade) filtroUnidade.value = '';
            if (filtroDataInicio) filtroDataInicio.value = '';
            if (filtroDataFim) filtroDataFim.value = '';

            // Renderizar novamente
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }

    // Filtro em tempo real para solicitante e problema
    const filtroSolicitante = document.getElementById('filtroSolicitante');
    const filtroProblema = document.getElementById('filtroProblema');

    if (filtroSolicitante) {
        filtroSolicitante.addEventListener('input', debounce(function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        }, 500));
    }

    if (filtroProblema) {
        filtroProblema.addEventListener('input', debounce(function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        }, 500));
    }

    // Filtros de mudan���a imediata
    const filtroPrioridade = document.getElementById('filtroPrioridade');
    const filtroAgenteResponsavel = document.getElementById('filtroAgenteResponsavel');
    const filtroUnidade = document.getElementById('filtroUnidade');

    if (filtroPrioridade) {
        filtroPrioridade.addEventListener('change', function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }

    if (filtroAgenteResponsavel) {
        filtroAgenteResponsavel.addEventListener('change', function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }

    if (filtroUnidade) {
        filtroUnidade.addEventListener('change', function() {
            currentPage = 1;
            renderChamadosPage(currentPage);
        });
    }
});

// Função debounce para evitar muitas chamadas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para limpar todos os filtros
function limparTodosFiltros() {
    // Filtros de chamados
    const filtroSolicitante = document.getElementById('filtroSolicitante');
    const filtroProblema = document.getElementById('filtroProblema');
    const filtroPrioridade = document.getElementById('filtroPrioridade');
    const filtroAgenteResponsavel = document.getElementById('filtroAgenteResponsavel');
    const filtroUnidade = document.getElementById('filtroUnidade');
    const filtroDataInicio = document.getElementById('filtroDataInicio');
    const filtroDataFim = document.getElementById('filtroDataFim');

    if (filtroSolicitante) filtroSolicitante.value = '';
    if (filtroProblema) filtroProblema.value = '';
    if (filtroPrioridade) filtroPrioridade.value = '';
    if (filtroAgenteResponsavel) filtroAgenteResponsavel.value = '';
    if (filtroUnidade) filtroUnidade.value = '';
    if (filtroDataInicio) filtroDataInicio.value = '';
    if (filtroDataFim) filtroDataFim.value = '';

    // Filtro de permissões
    const filtroPermissoes = document.getElementById('filtroPermissoes');
    if (filtroPermissoes) {
        filtroPermissoes.value = '';
        filtrarListaUsuarios('');
    }

    // Recarregar dados de chamados
    if (typeof renderChamadosPage === 'function' && window.chamadosData) {
        currentPage = 1;
        renderChamadosPage(currentPage);
    }

    // Mostrar notificaç��o
    if (window.advancedNotificationSystem) {
        window.advancedNotificationSystem.showInfo('Filtros Limpos', 'Todos os filtros foram removidos');
    }
}

// ==================== DASHBOARD AVANÇADO ====================

async function carregarDashboardAvancado() {
    try {
        // Atualizar dados das métricas existentes
        const dashTotalUsuarios = document.getElementById('dashTotalUsuarios');
        const dashTaxaAtividade = document.getElementById('dashTaxaAtividade');

        if (dashTotalUsuarios) dashTotalUsuarios.textContent = '124';
        if (dashTaxaAtividade) dashTaxaAtividade.textContent = '85% ativos este mês';

        // Adicionar event listener para o botão atualizar
        const btnAtualizar = document.getElementById('btnAtualizarDashboard');
        if (btnAtualizar) {
            btnAtualizar.addEventListener('click', () => {
                if (window.advancedNotificationSystem) {
                    window.advancedNotificationSystem.showInfo('Dashboard', 'Atualizando dados do dashboard...');
                }
                setTimeout(() => {
                    carregarDashboardAvancado();
                }, 1000);
            });
        }

        console.log('Dashboard avan��ado carregado');
    } catch (error) {
        console.error('Erro ao carregar dashboard avançado:', error);
    }
}

// Funções auxiliares
function criarBackup() {
    if (window.advancedNotificationSystem) {
        window.advancedNotificationSystem.showInfo('Backup', 'Iniciando processo de backup...');
    }
}

function executarManutencao() {
    if (window.advancedNotificationSystem) {
        window.advancedNotificationSystem.showInfo('Manutenção', 'Iniciando processo de manutenção...');
    }
}

// Garantir que as funções estejam disponíveis globalmente
window.inicializarFiltroPermissoes = inicializarFiltroPermissoes;
window.filtrarListaUsuarios = filtrarListaUsuarios;
window.limparTodosFiltros = limparTodosFiltros;
window.atribuirAgente = atribuirAgente;
window.alterarAgente = alterarAgente;
window.confirmarAtribuicao = confirmarAtribuicao;
window.fecharModalAgente = fecharModalAgente;
window.carregarAgentes = carregarAgentes;
window.carregarGrupos = carregarGrupos;
window.renderizarAgentes = renderizarAgentes;
window.renderizarGrupos = renderizarGrupos;
window.excluirAgente = excluirAgente;
window.excluirGrupo = excluirGrupo;
window.toggleAgenteStatus = toggleAgenteStatus;
window.editarAgente = editarAgente;
window.editarGrupo = editarGrupo;
window.gerenciarMembrosGrupo = gerenciarMembrosGrupo;
window.adicionarFiltroAgente = adicionarFiltroAgente;

// Função de debug compreensiva do sistema
function debugSistemaPainel() {
    console.log('=== DEBUG COMPLETO DO SISTEMA PAINEL ===');

    try {
        // 1. Verificar elementos DOM essenciais
        const elementos = {
            sidebar: document.getElementById('sidebar'),
            mainContent: document.getElementById('mainContent'),
            sections: document.querySelectorAll('section.content-section'),
            visaoGeral: document.getElementById('visao-geral'),
            agentesSuporte: document.getElementById('agentes-suporte'),
            gruposUsuarios: document.getElementById('grupos-usuarios'),
            gerenciarChamados: document.getElementById('gerenciar-chamados'),
            permissoes: document.getElementById('permissoes')
        };

        console.log('--- ELEMENTOS DOM ---');
        Object.entries(elementos).forEach(([nome, elemento]) => {
            if (elemento) {
                const isActive = elemento.classList?.contains('active');
                console.log(`✓ ${nome}: encontrado${isActive ? ' (ATIVO)' : ''}`);
            } else {
                console.error(`✗ ${nome}: NÃO ENCONTRADO`);
            }
        });

        // 2. Verificar funções críticas
        const funcoesCriticas = [
            'activateSection',
            'loadSectionContent',
            'loadChamados',
            'carregarAgentes',
            'carregarGrupos',
            'atualizarContadoresVisaoGeral',
            'inicializarFiltroPermissoes',
            'filtrarListaUsuarios'
        ];

        console.log('--- FUNÇÕES CRÍTICAS ---');
        funcoesCriticas.forEach(funcao => {
            if (typeof window[funcao] === 'function') {
                console.log(`✓ ${funcao}: disponível`);
            } else {
                console.error(`✗ ${funcao}: NÃO DISPONÍVEL`);
            }
        });

        // 3. Verificar dados globais
        console.log('--- DADOS GLOBAIS ---');
        console.log('chamadosData:', window.chamadosData?.length || 0, 'itens');
        console.log('usuariosData:', window.usuariosData?.length || 0, 'itens');
        console.log('agentesData:', window.agentesData?.length || 0, 'itens');
        console.log('gruposData:', window.gruposData?.length || 0, 'itens');

        // 4. Verificar navegação
        console.log('--- NAVEGAÇÃO ---');
        const navLinks = document.querySelectorAll('.sidebar nav ul li a');
        console.log('Links de navegação encontrados:', navLinks.length);

        const activeSection = document.querySelector('section.content-section.active');
        if (activeSection) {
            console.log('Seção ativa atual:', activeSection.id);
        } else {
            console.error('NENHUMA SEÇÃO ATIVA ENCONTRADA!');
        }

        // 5. Testar navegação básica
        console.log('--- TESTE DE NAVEGAÇÃO ---');
        try {
            if (typeof activateSection === 'function') {
                console.log('Testando ativaç��o da seção visao-geral...');
                activateSection('visao-geral');
                console.log('✓ Navegação funcionando');
            } else {
                console.error('✗ Função activateSection não disponível');
            }
        } catch (error) {
            console.error('�� Erro ao testar navegação:', error);
        }

        // 6. Verificar contadores da visão geral
        console.log('--- CONTADORES VISÃO GERAL ---');
        const contadores = [
            'countAbertos',
            'countAguardando',
            'countConcluidos',
            'countCancelados'
        ];

        contadores.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                console.log(`✓ ${id}: ${elemento.textContent}`);
            } else {
                console.error(`✗ ${id}: elemento n��o encontrado`);
            }
        });

        // 7. Resumo final
        console.log('--- RESUMO ---');
        const problemas = [];

        if (!elementos.sidebar) problemas.push('Sidebar não encontrada');
        if (!elementos.mainContent) problemas.push('Main content n��o encontrado');
        if (elementos.sections.length === 0) problemas.push('Nenhuma seção encontrada');
        if (typeof window.activateSection !== 'function') problemas.push('Função activateSection não disponível');
        if (typeof window.loadChamados !== 'function') problemas.push('Função loadChamados não disponível');

        if (problemas.length === 0) {
            console.log('�� SISTEMA FUNCIONANDO CORRETAMENTE');
        } else {
            console.error('❌ PROBLEMAS ENCONTRADOS:');
            problemas.forEach(problema => console.error('- ' + problema));
        }

    } catch (error) {
        console.error('ERRO no debug do sistema:', error);
    }

    console.log('=== FIM DEBUG SISTEMA PAINEL ===');
}

// Disponibilizar globalmente
window.debugSistemaPainel = debugSistemaPainel;

// Função showSection (estava faltando)
function showSection(sectionId) {
    try {
        console.log('Mostrando seção:', sectionId);

        // Esconder todas as seções
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar seção selecionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';

            // Carregar conteúdo específico da seção se necessário
            loadSectionContent(sectionId);
        } else {
            console.error('Seção não encontrada:', sectionId);
        }
    } catch (error) {
        console.error('Erro ao mostrar seção:', error);
    }
}

// Tornar funções críticas disponíveis globalmente
window.loadChamados = loadChamados;
window.activateSection = activateSection;
window.showSection = showSection;
window.loadSectionContent = loadSectionContent;
window.atualizarContadoresVisaoGeral = atualizarContadoresVisaoGeral;

console.log('Funções globais do painel registradas');

// Executar debug automaticamente em desenvolvimento
setTimeout(() => {
    console.log('Executando debug automático do sistema...');
    debugSistemaPainel();
}, 2000);
