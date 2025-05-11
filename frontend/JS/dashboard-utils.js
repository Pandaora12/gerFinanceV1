/**
 * Utilitários para o dashboard
 */

// Função para gerar PDF a partir dos dados da ficha
function generatePDF(ficha) {
  // Esta é uma função de exemplo que seria implementada com uma biblioteca real de PDF
  console.log('Gerando PDF para a ficha:', ficha);
  
  // Aqui seria implementada a geração real do PDF usando uma biblioteca como jsPDF
  // Por exemplo:
  /*
  const doc = new jsPDF();
  
  // Adicionar cabeçalho
  doc.setFontSize(22);
  doc.text('Ficha Financeira', 105, 20, { align: 'center' });
  
  // Adicionar dados do cliente
  doc.setFontSize(14);
  doc.text(`Cliente: ${ficha.nome_cliente}`, 20, 40);
  doc.text(`CPF/CNPJ: ${ficha.cpf_cnpj}`, 20, 50);
  doc.text(`Telefone: ${ficha.telefone}`, 20, 60);
  doc.text(`Email: ${ficha.email}`, 20, 70);
  
  // Adicionar dados financeiros
  doc.text(`Valor: R$ ${ficha.valor.toFixed(2)}`, 20, 90);
  
  if (ficha.entrada) {
    doc.text(`Entrada: R$ ${ficha.entrada.toFixed(2)}`, 20, 100);
  }
  
  if (ficha.parcelas) {
    const valorParcela = (ficha.valor - (ficha.entrada || 0)) / ficha.parcelas;
    doc.text(`Parcelas: ${ficha.parcelas}x de R$ ${valorParcela.toFixed(2)}`, 20, 110);
  }
  
  doc.text(`Data: ${new Date(ficha.data).toLocaleDateString('pt-BR')}`, 20, 120);
  doc.text(`Status: ${ficha.status}`, 20, 130);
  
  // Adicionar descrição
  doc.text('Descrição:', 20, 150);
  doc.setFontSize(12);
  
  const splitText = doc.splitTextToSize(ficha.descricao || 'Nenhuma descrição fornecida', 170);
  doc.text(splitText, 20, 160);
  
  // Salvar o PDF
  doc.save(`ficha_${ficha.id}.pdf`);
  */
  
  // Por enquanto, apenas mostrar um alerta
  alert(`PDF da ficha ${ficha.id} - ${ficha.nome_cliente} seria gerado aqui.`);
}

// Função para calcular valor da parcela
function calcularValorParcela(valorTotal, entrada, numeroParcelas) {
  if (!valorTotal || !numeroParcelas || numeroParcelas <= 0) {
    return 0;
  }
  
  const valorEntrada = entrada || 0;
  return (valorTotal - valorEntrada) / numeroParcelas;
}

// Função para formatar valor monetário
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor);
}

// Exportar funções
window.dashboardUtils = {
  generatePDF,
  calcularValorParcela,
  formatarMoeda
};