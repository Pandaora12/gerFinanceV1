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
    // Resetar para a primeira página ao buscar
    currentPage = 1;
    loadDashboardData(currentPage, searchTerm);
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

      console.log("Enviando dados:", formData);

      const response = await fetch("http://localhost:3000/fichas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar ficha");
      }
      
      closeAllModals();
      await loadDashboardData(currentPage);
      this.reset();
      
      // Mostrar notificação de sucesso
      if (window.notifications) {
        window.notifications.show("Ficha criada com sucesso!", "success");
      } else {
        alert("Ficha criada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar ficha:", error);
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

  // Verificar se há notificações de pagamentos pendentes
  try {
    if (window.notifications && localStorage.getItem('notify_payments') !== 'false') {
      // Desativando temporariamente para evitar o erro 500
      // window.notifications.checkPendingPayments();
    }
  } catch (error) {
    console.error("Erro ao verificar pagamentos pendentes:", error);
  }

  // Verificar se há uma ficha para abrir (redirecionamento da página de pagamentos)
  const openFichaId = localStorage.getItem('openFichaId');
  if (openFichaId) {
    try {
      const ficha = await getFichaById(openFichaId);
      if (ficha) {
        openViewModal(ficha);
      }
      localStorage.removeItem('openFichaId');
    } catch (error) {
      console.error("Erro ao abrir ficha:", error);
    }
  }

  // Configurar botões de paginação
  setupPaginationButtons();
  
  // Garantir que o botão anterior esteja oculto na inicialização
  const prevButton = document.getElementById("prev-page-btn");
  if (prevButton) {
    prevButton.style.display = "none";
    console.log("Botão anterior ocultado na inicialização (dashboard)");
  }

  // Inicializar com a primeira página
  console.log("Carregando dashboard data...");
  await loadDashboardData(1); // Forçar página 1 na inicialização
  console.log("Dashboard data carregado");
});

// Variável global para controlar a página atual
let currentPage = 1;
// Número de registros por página
const RECORDS_PER_PAGE = 5;
// Variável para armazenar o termo de busca atual
let currentSearchTerm = "";

// Configurar botões de paginação
function setupPaginationButtons() {
  const prevButton = document.getElementById("prev-page-btn");
  const nextButton = document.getElementById("next-page-btn");
  
  if (prevButton) {
    prevButton.addEventListener("click", async () => {
      if (currentPage > 1) {
        currentPage--;
        await loadDashboardData(currentPage, currentSearchTerm);
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener("click", async () => {
      currentPage++;
      
      // Mostrar o botão "Anterior" quando clicar em "Próxima"
      if (prevButton && currentPage > 1) {
        prevButton.style.display = "inline-flex";
        console.log("Exibindo botão anterior (dashboard)");
      }
      
      await loadDashboardData(currentPage, currentSearchTerm);
    });
  }
}

async function loadDashboardData(page = 1, searchTerm = "") {
  // Atualizar visibilidade do botão anterior com base na página atual
  const prevButton = document.getElementById("prev-page-btn");
  if (prevButton) {
    if (page > 1) {
      prevButton.style.display = "inline-flex";
      console.log("Exibindo botão anterior no carregamento (dashboard)");
    } else {
      prevButton.style.display = "none";
      console.log("Ocultando botão anterior no carregamento (dashboard)");
    }
  }
  try {
    console.log(`Carregando fichas da página ${page}...`);
    currentSearchTerm = searchTerm;
    
    let url = `http://localhost:3000/fichas?page=${page}&limit=${RECORDS_PER_PAGE}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    console.log("URL da requisição:", url);
    console.log("Token:", localStorage.getItem("authToken"));
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status da resposta:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar fichas");
    }

    const data = await response.json();
    console.log("Dados recebidos:", data);
    
    // Garantir que fichas é um array
    const fichas = Array.isArray(data.fichas) ? data.fichas : [];
    console.log("Fichas processadas:", fichas);
    
    // Filtrar localmente se houver termo de busca (caso a API não suporte busca)
    let fichasFiltradas = fichas;
    if (searchTerm && !url.includes('search=')) {
      const searchTermClean = searchTerm.replace(/\D/g, '');
      fichasFiltradas = fichas.filter(f => 
        (f.cpf_cnpj && f.cpf_cnpj.includes(searchTermClean)) || 
        (f.nome_cliente && f.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    renderFichasList(fichasFiltradas);
    
    // Garantir que os valores de paginação são números
    const currentPageNum = parseInt(data.currentPage) || 1;
    const totalPagesNum = parseInt(data.totalPages) || 1;
    
    updatePaginationControls(currentPageNum, totalPagesNum);
  } catch (error) {
    console.error("Erro ao carregar fichas:", error);
    // Em caso de erro, renderizar lista vazia
    renderFichasList([]);
    updatePaginationControls(1, 1);
  }
}

// Atualizar controles de paginação
function updatePaginationControls(currentPage, totalPages) {
  const prevButton = document.getElementById("prev-page-btn");
  const nextButton = document.getElementById("next-page-btn");
  const pageInfo = document.getElementById("page-info");
  
  console.log("Atualizando controles de paginação:", { currentPage, totalPages });
  
  if (prevButton) {
    prevButton.disabled = currentPage <= 1;
    prevButton.classList.toggle("disabled", currentPage <= 1);
    
    // Esconder o botão "Anterior" na primeira página
    if (currentPage <= 1) {
      prevButton.style.display = "none";
      console.log("Botão anterior ocultado (dashboard)");
    } else {
      prevButton.style.display = "inline-flex";
      console.log("Botão anterior exibido (dashboard)");
    }
  }
  
  if (nextButton) {
    nextButton.disabled = currentPage >= totalPages;
    nextButton.classList.toggle("disabled", currentPage >= totalPages);
  }
  
  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  }
}

async function getFichaById(fichaId) {
  try {
    console.log(`Buscando ficha com ID ${fichaId}...`);
    
    const response = await fetch(`http://localhost:3000/fichas/${fichaId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Status da resposta:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar ficha");
    }

    const ficha = await response.json();
    console.log("Ficha encontrada:", ficha);
    return ficha;
  } catch (error) {
    console.error("Erro ao buscar ficha:", error);
    return null;
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
  console.log("Renderizando lista de fichas:", fichas);
  
  const userList = document.getElementById("user-list");
  if (!userList) {
    console.error("Elemento user-list não encontrado");
    return;
  }
  
  userList.innerHTML = "";

  // Garantir que fichas é um array
  if (!Array.isArray(fichas) || fichas.length === 0) {
    console.log("Nenhuma ficha encontrada");
    userList.innerHTML = '<li class="no-results">Nenhuma ficha encontrada</li>';
    return;
  }

  fichas.forEach((ficha) => {
    if (!ficha) {
      console.log("Ficha inválida encontrada, pulando...");
      return; // Pular itens nulos ou indefinidos
    }
    
    console.log("Renderizando ficha:", ficha);
    
    const li = document.createElement("li");
    li.className = "user-item";
    li.dataset.id = ficha.id;

    // Adicionar status de pagamento se existir
    const paymentStatusHtml = ficha.payment_status ? 
      `<span class="payment-status ${getPaymentStatusClass(ficha.payment_status)}">${getPaymentStatusText(ficha.payment_status)}</span>` : '';

    li.innerHTML = `
      <span class="user-name">${ficha.nome_cliente || 'Cliente sem nome'} ${paymentStatusHtml}</span>
      <span class="status">
        <span class="status-circle ${getStatusClass(ficha.status)}"></span>
        <span class="status-text">${ficha.status || 'Sem status'}</span>
      </span>
    `;

    li.addEventListener("click", () => openViewModal(ficha));
    userList.appendChild(li);
  });
  
  console.log("Lista de fichas renderizada com sucesso");
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => modal.classList.add("hidden"));
  
  // Remover botão de PDF se existir
  const pdfButton = document.getElementById('generate-pdf-btn');
  if (pdfButton) {
    pdfButton.remove();
  }
}