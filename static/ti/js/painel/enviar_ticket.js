// enviar_ticket.js

window.openTicketModal = function(chamado) {
    ticketChamadoId.value = chamado.id;
    ticketAssunto.value = `Atualização do Chamado ${chamado.codigo}`;
    modalTicket.classList.add('active');
};



// Variáveis do modal
const modalTicket = document.getElementById('modalTicket');
const formTicket = document.getElementById('formTicket');
const ticketChamadoId = document.getElementById('ticketChamadoId');
const ticketModelo = document.getElementById('ticketModelo');
const ticketAssunto = document.getElementById('ticketAssunto');
const ticketMensagem = document.getElementById('ticketMensagem');
const ticketPrioridade = document.getElementById('ticketPrioridade');
const ticketCopia = document.getElementById('ticketCopia');

// Botões
const btnEnviarTicket = document.getElementById('btnEnviarTicket');
const btnCancelarTicket = document.getElementById('btnCancelarTicket');
const modalTicketClose = document.getElementById('modalTicketClose');

// Função para abrir o modal de ticket
function openTicketModal(chamado) {
    ticketChamadoId.value = chamado.id;
    ticketAssunto.value = `Atualização do Chamado ${chamado.codigo}`;
    modalTicket.classList.add('active');
}

// Função para fechar o modal de ticket
function closeTicketModal() {
    modalTicket.classList.remove('active');
    formTicket.reset();
}

// Função para aplicar modelo de mensagem
function aplicarModeloMensagem(modelo, chamado) {
    const modelos = {
        atualizacao: `
Prezado(a) ${chamado.solicitante},

Seu chamado ${chamado.codigo} foi atualizado.
Status atual: ${chamado.status}

Atenciosamente,
Equipe de Suporte TI
`,
        confirmacao: `
Prezado(a) ${chamado.solicitante},

Confirmamos o recebimento do seu chamado ${chamado.codigo}.
Em breve nossa equipe iniciará o atendimento.

Detalhes do chamado:
- Problema: ${chamado.problema}
- Unidade: ${chamado.unidade}
- Data de abertura: ${chamado.data_abertura}

Manteremos você informado sobre o progresso.

Atenciosamente,
Equipe de Suporte TI
`,
        conclusao: `
Prezado(a) ${chamado.solicitante},

Seu chamado ${chamado.codigo} foi concluído com sucesso.

Resumo do atendimento:
- Problema relatado: ${chamado.problema}
- Data de conclusão: ${new Date().toLocaleString()}

Caso necessite de suporte adicional, não hesite em abrir um novo chamado.

Atenciosamente,
Equipe de Suporte TI
`
    };

    return modelos[modelo] || '';
}

// Event Listeners
ticketModelo.addEventListener('change', function() {
    const chamadoId = ticketChamadoId.value;
    const chamado = chamadosData.find(c => c.id == chamadoId);
    
    if (chamado && this.value) {
        ticketMensagem.value = aplicarModeloMensagem(this.value, chamado);
    }
});

let isSendingTicket = false;

btnEnviarTicket.addEventListener('click', async function(e) {
    e.preventDefault();
    if (isSendingTicket) return;

    const chamadoId = ticketChamadoId.value;
    if (!ticketAssunto.value.trim() || !ticketMensagem.value.trim()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Guardar e alterar estado do botão
    const originalHtml = btnEnviarTicket.innerHTML;
    isSendingTicket = true;
    btnEnviarTicket.disabled = true;
    btnEnviarTicket.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    // Capturar valores ANTES de fechar/resetar modal
    const assuntoVal = ticketAssunto.value;
    const mensagemVal = ticketMensagem.value;
    const prioridadeVal = ticketPrioridade.checked ? 'true' : 'false';
    const copiaVal = ticketCopia.checked ? 'true' : 'false';
    const modeloVal = ticketModelo.value || '';
    const files = document.getElementById('ticketAnexos')?.files || [];

    // Fechar modal após capturar os valores (evita limpar os campos antes do envio)
    closeTicketModal();

    try {
        const formData = new FormData();
        formData.append('assunto', assuntoVal);
        formData.append('mensagem', mensagemVal);
        formData.append('prioridade', prioridadeVal);
        formData.append('enviar_copia', copiaVal);
        formData.append('modelo', modeloVal);
        for (let i = 0; i < files.length; i++) {
            formData.append('anexos', files[i]);
        }

        const response = await fetch(`/ti/painel/api/chamados/${chamadoId}/ticket`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao enviar ticket');
        }

        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showSuccess('Ticket Enviado', 'Ticket enviado com sucesso!');
        } else {
            alert('Ticket enviado com sucesso!');
        }

        // Recarregar timeline do chamado no modal, se estiver aberto
        try {
            const ch = chamadosData.find(c => c.id == chamadoId);
            if (ch) {
                openModal(ch);
                const historicoTabBtn = document.querySelector('#tab-historico');
                if (historicoTabBtn && window.bootstrap?.Tab) {
                    const tab = new bootstrap.Tab(historicoTabBtn);
                    tab.show();
                }
            }
        } catch (_) {}

    } catch (error) {
        console.error('Erro ao enviar ticket:', error);
        if (window.advancedNotificationSystem) {
            window.advancedNotificationSystem.showError('Erro', error.message || 'Erro ao enviar ticket');
        } else {
            alert(`Erro ao enviar ticket: ${error.message}`);
        }
    } finally {
        isSendingTicket = false;
        btnEnviarTicket.disabled = false;
        btnEnviarTicket.innerHTML = originalHtml;
    }
});

btnCancelarTicket.addEventListener('click', closeTicketModal);
modalTicketClose.addEventListener('click', closeTicketModal);

// Fechar modal ao clicar fora
modalTicket.addEventListener('click', function(e) {
    if (e.target === this) {
        closeTicketModal();
    }
});
