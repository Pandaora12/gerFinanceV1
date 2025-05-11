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
  await loadPaymentsData();
  
  // Configurar filtros
  document.getElementById("apply-filters").addEventListener("click", async () => {
    await loadPaymentsData();
  });
});

async function loadPaymentsData() {
  try {
    const response = await fetch("http://localhost:3000/fichas", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar dados financeiros");
    }

    let fichas = await response.json();
    
    // Aplicar filtros se selecionados
    const statusFilter = document.getElementById("filter-status").value;
    const paymentFilter = document.getElementById("filter-payment").value;
    
    if (statusFilter !== "all") {
      fichas = fichas.filter(ficha => ficha.status === statusFilter);
    }
    
    if (paymentFilter !== "all") {
      fichas = fichas.filter(ficha => ficha.payment_status === paymentFilter);
    }

    // Renderizar tabela e gráficos
    renderPaymentsTable(fichas);
    renderCharts(fichas);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    alert(`Erro ao carregar dados: ${error.message}`);
  }
}

function renderPaymentsTable(fichas) {
  const tableBody = document.getElementById("payments-table-body");
  tableBody.innerHTML = "";

  if (fichas.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="8" style="text-align: center;">Nenhum registro encontrado</td>';
    tableBody.appendChild(row);
    return;
  }

  fichas.forEach((ficha) => {
    const row = document.createElement("tr");
    
    // Formatar valores para exibição
    const valorFormatado = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(ficha.valor);
    
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
    const cpfCnpj = ficha.cpf_cnpj.length === 11 ? 
      ficha.cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
      ficha.cpf_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

    row.innerHTML = `
      <td>${ficha.nome_cliente}</td>
      <td>${cpfCnpj}</td>
      <td>${valorFormatado}</td>
      <td>${entradaFormatada}</td>
      <td>${parcelasFormatadas}</td>
      <td>${ficha.status}</td>
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
  
  // Adicionar event listeners para os botões de status de pagamento
  document.querySelectorAll('.btn-payment-status').forEach(button => {
    button.addEventListener('click', async (e) => {
      const fichaId = e.target.dataset.id;
      const status = e.target.dataset.status;
      
      if (status) {
        // Atualizar status de pagamento
        await updatePaymentStatus(fichaId, status);
      } else {
        // Botão "Ver" - redirecionar para o dashboard com a ficha aberta
        localStorage.setItem('openFichaId', fichaId);
        window.location.href = 'dashboard.html';
      }
    });
  });
}

async function updatePaymentStatus(fichaId, status) {
  try {
    // Primeiro, buscar a ficha atual
    const response = await fetch(`http://localhost:3000/fichas/${fichaId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar ficha");
    }

    const ficha = await response.json();
    
    // Atualizar apenas o status de pagamento
    const updateResponse = await fetch(`http://localhost:3000/fichas/${fichaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({
        ...ficha,
        payment_status: status
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Erro ao atualizar status de pagamento");
    }

    // Recarregar dados
    await loadPaymentsData();
    
    // Feedback ao usuário
    alert(`Status de pagamento atualizado com sucesso!`);
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

function renderCharts(fichas) {
  renderPieChart(fichas);
  renderLineChart(fichas);
}

function renderPieChart(fichas) {
  // Calcular totais por status
  const totals = {
    ENTRADA: 0,
    SAÍDA: 0,
    CAIXA: 0
  };
  
  fichas.forEach(ficha => {
    if (ficha.status in totals) {
      totals[ficha.status] += parseFloat(ficha.valor);
    }
  });
  
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
  
  // Criar novo gráfico
  const ctx = document.getElementById('pie-chart').getContext('2d');
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
  });
}

function renderLineChart(fichas) {
  // Agrupar dados por mês
  const monthlyData = {};
  
  fichas.forEach(ficha => {
    const date = new Date(ficha.data);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        ENTRADA: 0,
        SAÍDA: 0
      };
    }
    
    if (ficha.status === 'ENTRADA') {
      monthlyData[monthYear].ENTRADA += parseFloat(ficha.valor);
    } else if (ficha.status === 'SAÍDA') {
      monthlyData[monthYear].SAÍDA += parseFloat(ficha.valor);
    }
  });
  
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
  
  // Criar novo gráfico
  const ctx = document.getElementById('line-chart').getContext('2d');
  window.lineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
  });
}