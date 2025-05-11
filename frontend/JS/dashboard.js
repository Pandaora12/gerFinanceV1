document.addEventListener("DOMContentLoaded", async function () {
  const authToken = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!authToken || !userData) {
    alert("Você precisa estar logado!");
    window.location.href = "login.html";
    return;
  }

  // Exibir o primeiro nome do usuário
  document.getElementById("user-name").textContent = userData.nome_completo.split(" ")[0];

  // Configuração dos eventos do menu e logout
  document.getElementById("menu-toggle").addEventListener("click", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebarMenu = document.getElementById("sidebar-menu");
    
    menuToggle.classList.toggle("active");
    sidebarMenu.classList.toggle("active");
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "login.html";
  });

  // Abre o modal de criação de ficha
  document.getElementById("create-table-btn").addEventListener("click", () => {
    document.getElementById("create-table-modal").classList.remove("hidden");
    
    // Definir data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("date").value = today;
  });

  // Configura o botão de busca
  document.getElementById("search-btn").addEventListener("click", () => {
    const searchTerm = document.getElementById("search-input").value.trim();
    loadDashboardData(searchTerm);
  });
  
  // Evento de criação de ficha
  document.getElementById("create-table-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    try {
      const valorInput = document.getElementById("value").value;
      const valorNumerico = parseFloat(
        valorInput
          .replace('R$ ', '')
          .replace(/\./g, '')
          .replace(',', '.')
      );
      
      // Processar entrada e parcelas
      let entradaNumerico = 0;
      let parcelas = 0;
      
      if (document.getElementById("entry-value")) {
        const entradaInput = document.getElementById("entry-value").value;
        if (entradaInput) {
          entradaNumerico = parseFloat(
            entradaInput
              .replace('R$ ', '')
              .replace(/\./g, '')
              .replace(',', '.')
          );
        }
      }
      
      if (document.getElementById("installments")) {
        parcelas = parseInt(document.getElementById("installments").value) || 0;
      }
    
      const formData = {
        nome_cliente: document.getElementById("client-name").value,
        cpf_cnpj: document.getElementById("cpf-cnpj").value.replace(/\D/g, ''),
        telefone: document.getElementById("phone-number").value.replace(/\D/g, ''),
        email: document.getElementById("email").value,
        valor: valorNumerico,
        data: document.getElementById("date").value,
        descricao: document.getElementById("description").value,
        status: document.getElementById("status").value,
        entrada: entradaNumerico || null,
        parcelas: parcelas || null,
        payment_status: document.getElementById("payment-status").value
      };

      const response = await fetch("http://localhost:3000/fichas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Erro ao criar ficha");
      
      closeAllModals();
      await loadDashboardData();
      this.reset();
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  });

  // Calcular valor da parcela quando entrada ou número de parcelas mudar
  if (document.getElementById("value") && document.getElementById("entry-value") && document.getElementById("installments")) {
    const calcularParcela = () => {
      const valorTotal = parseFloat(document.getElementById("value").value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
      const entrada = parseFloat(document.getElementById("entry-value").value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
      const parcelas = parseInt(document.getElementById("installments").value) || 1;
      
      if (valorTotal > 0 && parcelas > 0) {
        const valorParcela = (valorTotal - entrada) / parcelas;
        
        if (valorParcela > 0) {
          const valorFormatado = new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(valorParcela);
          
          document.getElementById("installment-value").textContent = `Valor da parcela: ${valorFormatado}`;
        } else {
          document.getElementById("installment-value").textContent = "";
        }
      } else {
        document.getElementById("installment-value").textContent = "";
      }
    };
    
    document.getElementById("value").addEventListener("input", calcularParcela);
    document.getElementById("entry-value").addEventListener("input", calcularParcela);
    document.getElementById("installments").addEventListener("input", calcularParcela);
  }

  // Mesmo cálculo para o modal de edição
  if (document.getElementById("edit-valor") && document.getElementById("edit-entrada") && document.getElementById("edit-parcelas")) {
    const calcularParcelaEdit = () => {
      const valorTotal = parseFloat(document.getElementById("edit-valor").value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
      const entrada = parseFloat(document.getElementById("edit-entrada").value.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
      const parcelas = parseInt(document.getElementById("edit-parcelas").value) || 1;
      
      if (valorTotal > 0 && parcelas > 0) {
        const valorParcela = (valorTotal - entrada) / parcelas;
        
        if (valorParcela > 0) {
          const valorFormatado = new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(valorParcela);
          
          document.getElementById("edit-installment-value").textContent = `Valor da parcela: ${valorFormatado}`;
        } else {
          document.getElementById("edit-installment-value").textContent = "";
        }
      } else {
        document.getElementById("edit-installment-value").textContent = "";
      }
    };
    
    document.getElementById("edit-valor").addEventListener("input", calcularParcelaEdit);
    document.getElementById("edit-entrada").addEventListener("input", calcularParcelaEdit);
    document.getElementById("edit-parcelas").addEventListener("input", calcularParcelaEdit);
  }

  // Adicionar botão de paginação
  const addPaginationButton = () => {
    const container = document.getElementById("user-list-container");
    const paginationButton = document.createElement("button");
    paginationButton.id = "pagination-btn";
    paginationButton.className = "pagination-button";
    paginationButton.textContent = "Carregar mais";
    paginationButton.addEventListener("click", () => {
      // Implementação futura de paginação
      alert("Funcionalidade de paginação será implementada em breve!");
    });
    
    container.appendChild(paginationButton);
  };

  await loadDashboardData();
  addPaginationButton();
});

async function loadDashboardData(searchTerm = "") {
  try {
    const response = await fetch("http://localhost:3000/fichas", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar fichas");
    }

    let fichas = await response.json();
    
    // Filtra localmente se houver termo de busca
    if (searchTerm) {
      const searchTermClean = searchTerm.replace(/\D/g, '');
      fichas = fichas.filter(f => 
        (f.cpf_cnpj && f.cpf_cnpj.includes(searchTermClean)) || 
        (f.nome_cliente && f.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    renderFichasList(fichas);
  } catch (error) {
    console.error("Erro ao carregar fichas:", error);
    alert(`Erro ao carregar fichas: ${error.message}`);
  }
}

function getStatusClass(status) {
  switch (status) {
    case "ENTRADA":
      return "green";
    case "CAIXA":
      return "yellow";
    case "SAÍDA":
      return "red";
    default:
      return "gray";
  }
}

function getPaymentStatusClass(status) {
  switch (status) {
    case "PAGO":
      return "paid";
    case "PARCIALMENTE_PAGO":
      return "partially-paid";
    case "NAO_PAGO":
    default:
      return "not-paid";
  }
}

function getPaymentStatusText(status) {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "PARCIALMENTE_PAGO":
      return "Parcial";
    case "NAO_PAGO":
    default:
      return "Não Pago";
  }
}

function renderFichasList(fichas) {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  if (fichas.length === 0) {
    userList.innerHTML = '<li class="no-results">Nenhuma ficha encontrada</li>';
    return;
  }

  fichas.forEach((ficha) => {
    const li = document.createElement("li");
    li.className = "user-item";
    li.dataset.id = ficha.id;

    // Adicionar status de pagamento se existir
    const paymentStatusHtml = ficha.payment_status ? 
      `<span class="payment-status ${getPaymentStatusClass(ficha.payment_status)}">${getPaymentStatusText(ficha.payment_status)}</span>` : '';

    li.innerHTML = `
      <span class="user-name">${ficha.nome_cliente} ${paymentStatusHtml}</span>
      <span class="status">
        <span class="status-circle ${getStatusClass(ficha.status)}"></span>
        <span class="status-text">${ficha.status}</span>
      </span>
    `;

    li.addEventListener("click", () => openViewModal(ficha));
    userList.appendChild(li);
  });
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => modal.classList.add("hidden"));
  
  // Remover botão de PDF se existir
  const pdfButton = document.getElementById('generate-pdf-btn');
  if (pdfButton) {
    pdfButton.remove();
  }
}