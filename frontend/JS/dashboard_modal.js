let currentFichaId = null;

// Função para buscar ficha pelo ID
async function getFichaById(fichaId) {
  try {
    const response = await fetch(`http://localhost:3000/fichas/${fichaId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar ficha");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar ficha:", error);
    return null;
  }
}

// Função para abrir o modal de visualização
function openViewModal(ficha) {
  currentFichaId = ficha.id;
  const modal = document.getElementById("view-table-modal");
  const detailsDiv = document.getElementById("table-details");

  // Formatar CPF/CNPJ
  const cpfCnpj = ficha.cpf_cnpj.length === 11 ? 
    ficha.cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
    ficha.cpf_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

  // Formatar telefone
  const telefone = ficha.telefone.length === 11 ?
    ficha.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') :
    ficha.telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');

  // Formatar valor para exibição
  const valorFormatado = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(ficha.valor);

  // Status de pagamento
  let paymentStatusText = "Não informado";
  if (ficha.payment_status) {
    switch (ficha.payment_status) {
      case "PAGO":
        paymentStatusText = "Pago Integralmente";
        break;
      case "PARCIALMENTE_PAGO":
        paymentStatusText = "Parcialmente Pago";
        break;
      case "NAO_PAGO":
        paymentStatusText = "Não Pago";
        break;
    }
  }

  detailsDiv.innerHTML = `
    <p><strong>Nome:</strong> ${ficha.nome_cliente}</p>
    <p><strong>CPF/CNPJ:</strong> ${cpfCnpj}</p>
    <p><strong>Telefone:</strong> ${telefone}</p>
    <p><strong>Email:</strong> ${ficha.email}</p>
    <p><strong>Valor:</strong> ${valorFormatado}</p>
    <p><strong>Data:</strong> ${new Date(ficha.data).toLocaleDateString("pt-BR")}</p>
    <p><strong>Status:</strong> ${ficha.status}</p>
    <p><strong>Status de Pagamento:</strong> ${paymentStatusText}</p>
    <p><strong>Descrição:</strong> ${ficha.descricao || "Nenhuma descrição fornecida"}</p>
    ${ficha.entrada ? `<p><strong>Entrada:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ficha.entrada)}</p>` : ''}
    ${ficha.parcelas ? `<p><strong>Parcelas:</strong> ${ficha.parcelas}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((ficha.valor - (ficha.entrada || 0)) / ficha.parcelas)}</p>` : ''}
  `;

  // Adicionar botão de PDF
  const pdfButton = document.createElement('button');
  pdfButton.id = 'generate-pdf-btn';
  pdfButton.className = 'pdf-button';
  pdfButton.innerHTML = '<i class="fas fa-file-pdf"></i>';
  pdfButton.title = 'Gerar PDF';
  pdfButton.onclick = () => generatePDF(ficha);
  
  // Adicionar o botão ao modal
  const modalContent = document.querySelector('#view-table-modal .modal-content');
  modalContent.appendChild(pdfButton);

  modal.classList.remove("hidden");
}

// Função para gerar PDF
function generatePDF(ficha) {
  // Importar a biblioteca jsPDF dinamicamente
  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    .then(() => {
      import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js')
        .then(() => {
          // Criar o PDF
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          // Adicionar cabeçalho
          doc.setFontSize(22);
          doc.text('Ficha Financeira', 105, 20, { align: 'center' });
          
          // Formatar CPF/CNPJ
          const cpfCnpj = ficha.cpf_cnpj.length === 11 ? 
            ficha.cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
            ficha.cpf_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
          
          // Formatar telefone
          const telefone = ficha.telefone.length === 11 ?
            ficha.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') :
            ficha.telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
          
          // Status de pagamento
          let paymentStatusText = "Não informado";
          if (ficha.payment_status) {
            switch (ficha.payment_status) {
              case "PAGO":
                paymentStatusText = "Pago Integralmente";
                break;
              case "PARCIALMENTE_PAGO":
                paymentStatusText = "Parcialmente Pago";
                break;
              case "NAO_PAGO":
                paymentStatusText = "Não Pago";
                break;
            }
          }
          
          // Dados do cliente
          doc.setFontSize(14);
          doc.text(`Cliente: ${ficha.nome_cliente}`, 20, 40);
          doc.text(`CPF/CNPJ: ${cpfCnpj}`, 20, 50);
          doc.text(`Telefone: ${telefone}`, 20, 60);
          doc.text(`Email: ${ficha.email}`, 20, 70);
          
          // Dados financeiros
          doc.text(`Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ficha.valor)}`, 20, 90);
          
          let yPos = 100;
          
          if (ficha.entrada) {
            doc.text(`Entrada: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ficha.entrada)}`, 20, yPos);
            yPos += 10;
          }
          
          if (ficha.parcelas) {
            const valorParcela = (ficha.valor - (ficha.entrada || 0)) / ficha.parcelas;
            doc.text(`Parcelas: ${ficha.parcelas}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorParcela)}`, 20, yPos);
            yPos += 10;
          }
          
          doc.text(`Data: ${new Date(ficha.data).toLocaleDateString('pt-BR')}`, 20, yPos);
          yPos += 10;
          
          doc.text(`Status: ${ficha.status}`, 20, yPos);
          yPos += 10;
          
          doc.text(`Status de Pagamento: ${paymentStatusText}`, 20, yPos);
          yPos += 20;
          
          // Adicionar descrição
          doc.text('Descrição:', 20, yPos);
          yPos += 10;
          
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(ficha.descricao || 'Nenhuma descrição fornecida', 170);
          doc.text(splitText, 20, yPos);
          
          // Salvar o PDF
          doc.save(`ficha_${ficha.id}_${ficha.nome_cliente.replace(/\s+/g, '_')}.pdf`);
        })
        .catch(error => {
          console.error('Erro ao carregar plugin autotable:', error);
          alert('Não foi possível gerar o PDF. Verifique a conexão com a internet.');
        });
    })
    .catch(error => {
      console.error('Erro ao carregar jsPDF:', error);
      alert('Não foi possível gerar o PDF. Verifique a conexão com a internet.');
    });
}

// Função para abrir o modal de edição
async function openEditModal(fichaId) {
  try {
    const ficha = await getFichaById(fichaId);
    if (!ficha) {
      throw new Error("Ficha não encontrada");
    }

    currentFichaId = ficha.id;

    // Adicione tratamento para data undefined
    const rawDate = ficha.data ? ficha.data : new Date().toISOString();
    const formattedDate = rawDate.split("T")[0];
    
    document.getElementById("edit-nome").value = ficha.nome_cliente;
    document.getElementById("edit-cpf").value = ficha.cpf_cnpj;
    document.getElementById("edit-telefone").value = ficha.telefone;
    document.getElementById("edit-email").value = ficha.email;
    document.getElementById("edit-valor").value = `R$ ${parseFloat(ficha.valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    document.getElementById("edit-data").value = formattedDate;
    document.getElementById("edit-descricao").value = ficha.descricao || "";
    document.getElementById("edit-status").value = ficha.status;
    
    // Status de pagamento
    if (document.getElementById("edit-payment-status")) {
      document.getElementById("edit-payment-status").value = ficha.payment_status || "NAO_PAGO";
    }
    
    // Preencher campos de entrada e parcelas se existirem
    if (document.getElementById("edit-entrada")) {
      document.getElementById("edit-entrada").value = ficha.entrada ? 
        `R$ ${parseFloat(ficha.entrada).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
    }
    
    if (document.getElementById("edit-parcelas")) {
      document.getElementById("edit-parcelas").value = ficha.parcelas || '';
      
      // Calcular e mostrar valor da parcela se aplicável
      if (ficha.parcelas && ficha.valor) {
        const valorParcela = (ficha.valor - (ficha.entrada || 0)) / ficha.parcelas;
        document.getElementById("edit-installment-value").textContent = 
          `Valor da parcela: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorParcela)}`;
      }
    }

    document.getElementById("edit-table-modal").classList.remove("hidden");
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

document.addEventListener('click', function(e) {
  if (e.target.id === 'edit-table-btn') {
    e.preventDefault();
    openEditModal(currentFichaId);
  }
  
  if (e.target.id === 'delete-table-btn') {
    e.preventDefault();
    openDeleteModal();
  }

  if (e.target.id === 'save-edit-btn') {
    e.preventDefault();
    saveEdits();
  }

  if (e.target.classList.contains('close-modal') || 
      (e.target.classList.contains('modal') && !e.target.closest('.modal-content'))) {
    closeAllModals();
  }
});

async function saveEdits() {
  try {
    const valorInput = document.getElementById("edit-valor").value;
    const valorNumerico = parseFloat(
      valorInput
        .replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.')
    );

    // Processar entrada e parcelas se existirem
    let entradaNumerico = 0;
    let parcelas = 0;
    
    if (document.getElementById("edit-entrada")) {
      const entradaInput = document.getElementById("edit-entrada").value;
      if (entradaInput) {
        entradaNumerico = parseFloat(
          entradaInput
            .replace('R$ ', '')
            .replace(/\./g, '')
            .replace(',', '.')
        );
      }
    }
    
    if (document.getElementById("edit-parcelas")) {
      parcelas = parseInt(document.getElementById("edit-parcelas").value) || 0;
    }

    const formData = {
      nome_cliente: document.getElementById("edit-nome").value,
      cpf_cnpj: document.getElementById("edit-cpf").value.replace(/\D/g, ''),
      telefone: document.getElementById("edit-telefone").value.replace(/\D/g, ''),
      email: document.getElementById("edit-email").value,
      valor: valorNumerico,
      data: document.getElementById("edit-data").value,
      descricao: document.getElementById("edit-descricao").value,
      status: document.getElementById("edit-status").value,
      entrada: entradaNumerico || null,
      parcelas: parcelas || null,
      payment_status: document.getElementById("edit-payment-status").value
    };

    const response = await fetch(`http://localhost:3000/fichas/${currentFichaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar ficha");
    }

    closeAllModals();
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
}

function openDeleteModal() {
  const modal = document.getElementById("confirm-delete-modal");
  modal.classList.remove("hidden");

  document.getElementById("confirm-cpf-input").value = "";
}

document.getElementById("confirm-delete-btn").addEventListener("click", async function() {
  try {
    const confirmCpf = document.getElementById("confirm-cpf-input").value.replace(/\D/g, '');
    
    if (!confirmCpf) {
      throw new Error("Por favor, digite o CPF/CNPJ para confirmar");
    }
    
    const ficha = await getFichaById(currentFichaId);
    if (!ficha) throw new Error("Ficha não encontrada");
    
    // Verifica se o CPF/CNPJ digitado corresponde
    if (!ficha.cpf_cnpj.includes(confirmCpf)) {
      throw new Error("CPF/CNPJ não confere");
    }

    const response = await fetch(`http://localhost:3000/fichas/${currentFichaId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir ficha");
    }
    
    closeAllModals();
    await loadDashboardData();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("cancel-delete-btn").addEventListener("click", closeAllModals);