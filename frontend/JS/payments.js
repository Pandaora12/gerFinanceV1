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

  // Carregar dados e inicializar a página
  console.log("Carregando dados de pagamentos...");
  await loadPaymentsData(1);
  
  // Configurar filtros
  document.getElementById("apply-filters").addEventListener("click", async () => {
    await loadPaymentsData(1);
  });
  
  // Configurar botões de paginação
  setupPaginationButtons();
  
  // Garantir que o botão anterior esteja oculto na inicialização
  const prevButton = document.getElementById("prev-page-btn");
  if (prevButton) {
    prevButton.style.display = "none";
    console.log("Botão anterior ocultado na inicialização (pagamentos)");
  }
});

// Variável global para controlar a página atual
let currentPage = 1;
// Número de registros por página
const RECORDS_PER_PAGE = 5;

// Configurar botões de paginação
function setupPaginationButtons() {
  const prevButton = document.getElementById("prev-page-btn");
  const nextButton = document.getElementById("next-page-btn");
  
  if (prevButton) {
    prevButton.addEventListener("click", async () => {
      if (currentPage > 1) {
        currentPage--;
        await loadPaymentsData(currentPage);
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener("click", async () => {
      currentPage++;
      
      // Mostrar o botão "Anterior" quando clicar em "Próxima"
      if (prevButton && currentPage > 1) {
        prevButton.style.display = "inline-flex";
        console.log("Exibindo botão anterior (pagamentos)");
      }
      
      await loadPaymentsData(currentPage);
    });
  }
}

async function loadPaymentsData(page = 1) {
  // Atualizar visibilidade do botão anterior com base na página atual
  const prevButton = document.getElementById("prev-page-btn");
  if (prevButton) {
    if (page > 1) {
      prevButton.style.display = "inline-flex";
      console.log("Exibindo botão anterior no carregamento (pagamentos)");
    } else {
      prevButton.style.display = "none";
      console.log("Ocultando botão anterior no carregamento (pagamentos)");
    }
  }
  try {
    console.log(`Carregando pagamentos da página ${page}...`);
    
    const statusFilter = document.getElementById("filter-status").value;
    const paymentFilter = document.getElementById("filter-payment").value;
    
    let url = `http://localhost:3000/fichas?page=${page}&limit=${RECORDS_PER_PAGE}`;
    
    // Adicionar filtros à URL se selecionados
    if (statusFilter !== "all") {
      url += `&status=${statusFilter}`;
    }
    
    if (paymentFilter !== "all") {
      url += `&payment_status=${paymentFilter}`;
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
      throw new Error(errorData.error || "Erro ao carregar dados financeiros");
    }

    const data = await response.json();
    console.log("Dados recebidos:", data);
    
    // Garantir que fichas é um array
    const fichas = Array.isArray(data.fichas) ? data.fichas : [];
    console.log("Fichas processadas:", fichas);
    
    // Renderizar tabela e gráficos
    renderPaymentsTable(fichas);
    renderCharts(fichas);
    
    // Atualizar controles de paginação
    const currentPageNum = parseInt(data.currentPage) || 1;
    const totalPagesNum = parseInt(data.totalPages) || 1;
    
    updatePaginationControls(currentPageNum, totalPagesNum);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    // Em caso de erro, renderizar tabela vazia
    renderPaymentsTable([]);
    renderEmptyCharts();
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
      console.log("Botão anterior ocultado (pagamentos)");
    } else {
      prevButton.style.display = "inline-flex";
      console.log("Botão anterior exibido (pagamentos)");
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

function renderPaymentsTable(fichas) {
  console.log("Renderizando tabela de pagamentos:", fichas);
  
  const tableBody = document.getElementById("payments-table-body");
  if (!tableBody) {
    console.error("Elemento payments-table-body não encontrado");
    return;
  }
  
  tableBody.innerHTML = "";

  if (!Array.isArray(fichas) || fichas.length === 0) {
    console.log("Nenhum registro encontrado");
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="8" style="text-align: center;">Nenhum registro encontrado</td>';
    tableBody.appendChild(row);
    return;
  }

  fichas.forEach((ficha) => {
    if (!ficha) {
      console.log("Ficha inválida encontrada, pulando...");
      return; // Pular itens nulos ou indefinidos
    }
    
    console.log("Renderizando ficha na tabela:", ficha);
    
    const row = document.createElement("tr");
    
    // Formatar valores para exibição
    const valorFormatado = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(ficha.valor || 0);
    
    const entradaFormatada = ficha.entrada ? new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(ficha.entrada) : '-';
    
    const parcelasFormatadas = ficha.parcelas ? 
      `${ficha.parcelas}x de ${new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format((ficha.valor - (ficha.entrada || 0)) / ficha.parcelas)}` : '-';
    
    // Determinar classe de status de pagamento
    let paymentStatusClass = 'unpaid';
    let paymentStatusText = 'Não Pago';
    
    if (ficha.payment_status) {
      switch (ficha.payment_status) {
        case "PAGO":
          paymentStatusClass = 'paid';
          paymentStatusText = 'Pago';
          break;
        case "PARCIALMENTE_PAGO":
          paymentStatusClass = 'partial';
          paymentStatusText = 'Parcial';
          break;
      }
    }
    
    // Formatar CPF/CNPJ
    const cpfCnpj = ficha.cpf_cnpj && ficha.cpf_cnpj.length === 11 ? 
      ficha.cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
      ficha.cpf_cnpj ? ficha.cpf_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '-';

    row.innerHTML = `
      <td>${ficha.nome_cliente || 'Cliente sem nome'}</td>
      <td>${cpfCnpj}</td>
      <td>${valorFormatado}</td>
      <td>${entradaFormatada}</td>
      <td>${parcelasFormatadas}</td>
      <td>${ficha.status || 'Sem status'}</td>
      <td class="payment-status-cell ${paymentStatusClass}">${paymentStatusText}</td>
      <td>
        <div class="payment-actions">
          <button class="btn-payment-status btn-paid" data-id="${ficha.id}" data-status="PAGO">Pago</button>
          <button class="btn-payment-status btn-partial" data-id="${ficha.id}" data-status="PARCIALMENTE_PAGO">Parcial</button>
          <button class="btn-payment-status btn-unpaid" data-id="${ficha.id}" data-status="NAO_PAGO">Não Pago</button>
          <button class="btn-payment-status btn-view" data-id="${ficha.id}">Ver</button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  console.log("Tabela de pagamentos renderizada com sucesso");
  
  // Adicionar event listeners para os botões de status de pagamento
  document.querySelectorAll('.btn-payment-status').forEach(button => {
    button.addEventListener('click', async (e) => {
      const fichaId = e.target.dataset.id;
      const status = e.target.dataset.status;
      
      if (status) {
        // Atualizar status de pagamento
        await updatePaymentStatus(fichaId, status);
      } else if (e.target.classList.contains('btn-view')) {
        // Botão "Ver" - redirecionar para o dashboard com a ficha aberta
        localStorage.setItem('openFichaId', fichaId);
        window.location.href = 'dashboard.html';
      }
    });
  });
}

async function updatePaymentStatus(fichaId, status) {
  try {
    console.log(`Atualizando status de pagamento da ficha ${fichaId} para ${status}...`);
    
    const updateResponse = await fetch(`http://localhost:3000/fichas/${fichaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({
        payment_status: status
      }),
    });

    console.log("Status da resposta (PUT):", updateResponse.status);
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.error || "Erro ao atualizar status de pagamento");
    }

    // Recarregar dados
    await loadPaymentsData(currentPage);
    
    // Feedback ao usuário
    if (window.notifications) {
      window.notifications.show(`Status de pagamento atualizado com sucesso!`, 'success');
    } else {
      alert(`Status de pagamento atualizado com sucesso!`);
    }
  } catch (error) {
    console.error("Erro ao atualizar status de pagamento:", error);
    
    if (window.notifications) {
      window.notifications.show(`Erro: ${error.message}`, 'error');
    } else {
      alert(`Erro: ${error.message}`);
    }
  }
}

function renderCharts(fichas) {
  try {
    console.log("Renderizando gráficos...");
    renderPieChart(fichas);
    renderLineChart(fichas);
  } catch (error) {
    console.error("Erro ao renderizar gráficos:", error);
    renderEmptyCharts();
  }
}

function renderEmptyCharts() {
  console.log("Renderizando gráficos vazios");
  // Renderizar gráficos vazios
  renderPieChart([]);
  renderLineChart([]);
}

function renderPieChart(fichas) {
  console.log("Renderizando gráfico de pizza...");
  
  // Calcular totais por status
  const totals = {
    ENTRADA: 0,
    SAÍDA: 0,
    CAIXA: 0
  };
  
  if (Array.isArray(fichas)) {
    fichas.forEach(ficha => {
      if (ficha && ficha.status in totals) {
        totals[ficha.status] += parseFloat(ficha.valor || 0);
      }
    });
  }
  
  console.log("Totais calculados:", totals);
  
  // Configurar dados do gráfico
  const data = {
    labels: ['Entradas', 'Saídas', 'Caixa'],
    datasets: [{
      data: [totals.ENTRADA, totals.SAÍDA, totals.CAIXA],
      backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f'],
      borderWidth: 0
    }]
  };
  
  // Configurar opções do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(value);
          }
        }
      }
    }
  };
  
  // Destruir gráfico anterior se existir
  if (window.pieChart) {
    window.pieChart.destroy();
  }
  
  // Verificar se o elemento canvas existe
  const ctx = document.getElementById('pie-chart');
  if (!ctx) {
    console.error("Elemento pie-chart não encontrado");
    return;
  }
  
  // Criar novo gráfico
  try {
    window.pieChart = new Chart(ctx.getContext('2d'), {
      type: 'pie',
      data: data,
      options: options
    });
    console.log("Gráfico de pizza renderizado com sucesso");
  } catch (error) {
    console.error("Erro ao criar gráfico de pizza:", error);
  }
}

function renderLineChart(fichas) {
  console.log("Renderizando gráfico de linha...");
  
  // Agrupar dados por mês
  const monthlyData = {};
  
  if (Array.isArray(fichas)) {
    fichas.forEach(ficha => {
      if (!ficha || !ficha.data) return;
      
      const date = new Date(ficha.data);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          ENTRADA: 0,
          SAÍDA: 0
        };
      }
      
      if (ficha.status === 'ENTRADA') {
        monthlyData[monthYear].ENTRADA += parseFloat(ficha.valor || 0);
      } else if (ficha.status === 'SAÍDA') {
        monthlyData[monthYear].SAÍDA += parseFloat(ficha.valor || 0);
      }
    });
  }
  
  console.log("Dados mensais calculados:", monthlyData);
  
  // Ordenar meses
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return monthA - monthB;
  });
  
  // Preparar dados para o gráfico
  const labels = sortedMonths;
  const entradas = sortedMonths.map(month => monthlyData[month].ENTRADA);
  const saidas = sortedMonths.map(month => monthlyData[month].SAÍDA);
  
  // Configurar dados do gráfico
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Entradas',
        data: entradas,
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Saídas',
        data: saidas,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  // Configurar opções do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    }
  };
  
  // Destruir gráfico anterior se existir
  if (window.lineChart) {
    window.lineChart.destroy();
  }
  
  // Verificar se o elemento canvas existe
  const ctx = document.getElementById('line-chart');
  if (!ctx) {
    console.error("Elemento line-chart não encontrado");
    return;
  }
  
  // Criar novo gráfico
  try {
    window.lineChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: data,
      options: options
    });
    console.log("Gráfico de linha renderizado com sucesso");
  } catch (error) {
    console.error("Erro ao criar gráfico de linha:", error);
  }
}