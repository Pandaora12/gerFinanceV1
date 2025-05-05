document.addEventListener("DOMContentLoaded", async function () {
  // Verifica autenticação
  const authToken = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!authToken || !userData) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  // Elementos do DOM
  const userNameElement = document.getElementById("user-name");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const logoutBtn = document.getElementById("logout-btn");
  const createTableBtn = document.getElementById("create-table-btn");
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  // Exibe nome do usuário
  if (userData.nome_completo) {
    userNameElement.textContent = userData.nome_completo.split(" ")[0];
  }

  // Configura eventos
  menuToggle.addEventListener("click", () => sidebarMenu.classList.toggle("active"));

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = "login.html";
  });

  createTableBtn.addEventListener("click", () => {
    document.getElementById('create-table-modal').classList.remove('hidden');
  });

  searchBtn.addEventListener("click", () => {
    loadDashboardData(searchInput.value.trim());
  });

  // Configura formatação de campos
  setupFormatters();
  
  // Carrega dados iniciais
  await loadDashboardData();
});

// Variáveis globais
let currentFichaId = null;

// Função para carregar fichas
async function loadDashboardData(searchTerm = '') {
  try {
    const url = searchTerm 
      ? `http://localhost:3000/fichas?search=${encodeURIComponent(searchTerm)}` 
      : 'http://localhost:3000/fichas';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar fichas');
      }
    
      const fichas = await response.json();
      renderFichasList(fichas);
    } catch (error) {
      console.error("Erro:", error);
      alert(`Erro ao carregar fichas: ${error.message}`);
    }
  }

// Renderiza a lista de fichas
function renderFichasList(fichas) {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  if (fichas.length === 0) {
    userList.innerHTML = '<li class="no-results">Nenhuma ficha encontrada</li>';
    return;
  }

  fichas.forEach(ficha => {
    const li = document.createElement('li');
    li.className = 'user-item';
    li.dataset.id = ficha.id;
    
    li.innerHTML = `
      <span class="user-name">${ficha.nome_cliente}</span>
      <span class="status">
        <span class="status-circle ${getStatusClass(ficha.status)}"></span>
        <span class="status-text">${ficha.status}</span>
      </span>
    `;
    
    li.addEventListener('click', () => openViewModal(ficha));
    userList.appendChild(li);
  });
}

// Configura formatação automática
function setupFormatters() {
  // CPF/CNPJ
  document.getElementById('cpf-cnpj').addEventListener('input', function(e) {
    this.value = formatCPFCNPJ(this.value);
  });

  // Telefone
  document.getElementById('phone-number').addEventListener('input', function(e) {
    this.value = formatPhone(this.value);
  });

  // Valor monetário
  document.getElementById('value').addEventListener('input', function(e) {
    this.value = formatMoney(this.value);
  });
}

// Funções de formatação
function formatCPFCNPJ(value) {
  value = value.replace(/\D/g, '');
  
  if (value.length <= 11) { // CPF
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else { // CNPJ
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return value;
}

function formatPhone(value) {
  value = value.replace(/\D/g, '');
  
  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else {
    value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return value;
}

function formatMoney(value) {
  let num = value.replace(/\D/g, '');
  num = (num / 100).toFixed(2) + '';
  num = num.replace('.', ',');
  num = num.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');
  num = num.replace(/(\d)(\d{3}),/g, '$1.$2,');
  return 'R$ ' + num;
}

// Funções auxiliares
function getStatusClass(status) {
  switch(status) {
    case 'ENTRADA': return 'green';
    case 'CAIXA': return 'yellow';
    case 'SAÍDA': return 'red';
    default: return 'gray';
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Manipulação de modais
function openViewModal(ficha) {
  currentFichaId = ficha.id;
  const modal = document.getElementById('view-table-modal');
  const detailsDiv = document.getElementById('table-details');
  
  detailsDiv.innerHTML = `
    <p><strong>Nome:</strong> ${ficha.nome_cliente}</p>
    <p><strong>CPF/CNPJ:</strong> ${formatCPFCNPJ(ficha.cpf_cnpj)}</p>
    <p><strong>Telefone:</strong> ${formatPhone(ficha.telefone)}</p>
    <p><strong>Email:</strong> ${ficha.email}</p>
    <p><strong>Valor:</strong> ${formatMoney(ficha.valor.toString())}</p>
    <p><strong>Data:</strong> ${new Date(ficha.data).toLocaleDateString('pt-BR')}</p>
    <p><strong>Status:</strong> ${ficha.status}</p>
    <p><strong>Descrição:</strong> ${ficha.descricao || 'Nenhuma descrição'}</p>
  `;

  modal.classList.remove('hidden');
}

// Formulário de criação
document.getElementById('create-table-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = document.getElementById('save-table-btn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    const formData = {
      nome_cliente: document.getElementById('client-name').value,
      cpf_cnpj: document.getElementById('cpf-cnpj').value,
      telefone: document.getElementById('phone-number').value,
      email: document.getElementById('email').value,
      valor: document.getElementById('value').value,
      data: document.getElementById('date').value,
      descricao: document.getElementById('description').value,
      status: document.getElementById('status').value
    };

    // Validações básicas
    if (formData.nome_cliente.length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }

    if (!validateEmail(formData.email)) {
      throw new Error('Email inválido');
    }

    const response = await fetch('http://localhost:3000/fichas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar ficha');
    }

    closeAllModals();
    document.getElementById('create-table-form').reset();
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
});

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
}