// Variáveis globais
let currentFichaId = null;

// Função para abrir modal de visualização
function openViewModal(ficha) {
  currentFichaId = ficha.id;
  const modal = document.getElementById('view-table-modal');
  const detailsDiv = document.getElementById('table-details');
  
  detailsDiv.innerHTML = `
    <p><strong>Nome:</strong> ${ficha.nome_cliente}</p>
    <p><strong>CPF/CNPJ:</strong> ${ficha.cpf_cnpj}</p>
    <p><strong>Telefone:</strong> ${ficha.telefone}</p>
    <p><strong>Email:</strong> ${ficha.email}</p>
    <p><strong>Valor:</strong> R$ ${ficha.valor.toFixed(2).replace('.', ',')}</p>
    <p><strong>Data:</strong> ${new Date(ficha.data).toLocaleDateString('pt-BR')}</p>
    <p><strong>Status:</strong> ${ficha.status}</p>
    <p><strong>Descrição:</strong> ${ficha.descricao || 'Nenhuma descrição fornecida'}</p>
  `;

  // Adiciona cursor de bloqueio
  detailsDiv.style.cursor = 'not-allowed';
  modal.classList.remove('hidden');
}

// Função para abrir modal de edição
function openEditModal(ficha) {
  const modal = document.getElementById('edit-table-modal');
  const form = document.getElementById('edit-table-form');
  
  form.innerHTML = `
    <div class="form-group">
      <label>Nome do Cliente:</label>
      <input type="text" id="edit-nome" value="${ficha.nome_cliente}" required>
    </div>
    <div class="form-group">
      <label>CPF/CNPJ:</label>
      <input type="text" id="edit-cpf" value="${ficha.cpf_cnpj}" required>
    </div>
    <div class="form-group">
      <label>Telefone:</label>
      <input type="text" id="edit-telefone" value="${ficha.telefone}" required>
    </div>
    <div class="form-group">
      <label>Email:</label>
      <input type="email" id="edit-email" value="${ficha.email}" required>
    </div>
    <div class="form-group">
      <label>Valor:</label>
      <input type="text" id="edit-valor" value="${ficha.valor}" required>
    </div>
    <div class="form-group">
      <label>Data:</label>
      <input type="date" id="edit-data" value="${ficha.data.split('T')[0]}" required>
    </div>
    <div class="form-group">
      <label>Descrição:</label>
      <textarea id="edit-descricao" required>${ficha.descricao || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Status:</label>
      <select id="edit-status" required>
        <option value="ENTRADA" ${ficha.status === 'ENTRADA' ? 'selected' : ''}>ENTRADA</option>
        <option value="CAIXA" ${ficha.status === 'CAIXA' ? 'selected' : ''}>CAIXA</option>
        <option value="SAÍDA" ${ficha.status === 'SAÍDA' ? 'selected' : ''}>SAÍDA</option>
      </select>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

// Função para confirmar exclusão
function confirmDelete() {
  const modal = document.getElementById('confirm-delete-modal');
  document.getElementById('confirm-cpf-input').value = ''; // Limpa o campo
  modal.classList.remove('hidden');
}

// Função auxiliar para fechar modais
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
}

// Função para salvar edições
async function saveEdits() {
  const btn = document.getElementById('save-edit-btn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    const response = await fetch(`/fichas/${currentFichaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        nome_cliente: document.getElementById('edit-nome').value,
        cpf_cnpj: document.getElementById('edit-cpf').value,
        telefone: document.getElementById('edit-telefone').value,
        email: document.getElementById('edit-email').value,
        valor: parseFloat(document.getElementById('edit-valor').value),
        data: document.getElementById('edit-data').value,
        descricao: document.getElementById('edit-descricao').value,
        status: document.getElementById('edit-status').value
      })
    });

    if (response.ok) {
      closeAllModals();
      await loadDashboardData(); // Recarrega os dados
    }
  } catch (error) {
    console.error('Erro ao editar:', error);
    alert('Erro ao salvar alterações');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar Alterações';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Fechar modais ao clicar no X ou fora
  document.querySelectorAll('.close-modal, .modal').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
        closeAllModals();
      }
    });
  });

  // Abrir visualização ao clicar em ficha
  document.querySelectorAll('.user-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.actions')) {
        const fichaId = item.dataset.id;
        const ficha = getFichaById(fichaId);
        openViewModal(ficha);
      }
    });
  });

  // Botão Editar
  document.getElementById('edit-table-btn').addEventListener('click', () => {
    const ficha = getFichaById(currentFichaId);
    closeAllModals();
    openEditModal(ficha);
  });

  // Botão Excluir
  document.getElementById('delete-table-btn').addEventListener('click', confirmDelete);

  // Botão Cancelar Exclusão
  document.getElementById('cancel-delete-btn').addEventListener('click', closeAllModals);

  // Confirmar Exclusão
  document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    const btn = document.getElementById('confirm-delete-btn');
    btn.disabled = true;
    btn.textContent = 'Excluindo...';

    const cpfInput = document.getElementById('confirm-cpf-input').value;
    
    try {
      const response = await fetch(`/fichas/${currentFichaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ cpf_cnpj: cpfInput })
      });

      if (response.ok) {
        document.querySelector(`.user-item[data-id="${currentFichaId}"]`).remove();
        closeAllModals();
      } else {
        throw new Error('Falha ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir ficha. Verifique o CPF/CNPJ e tente novamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmar Exclusão';
    }
  });

  // Salvar Edições
  document.getElementById('save-edit-btn').addEventListener('click', saveEdits);
});

// Função para carregar dados (exemplo)
async function loadDashboardData() {
  // Implemente conforme sua API
}

// Função auxiliar para buscar ficha por ID
function getFichaById(id) {
  // Implemente conforme sua estrutura de dados
}