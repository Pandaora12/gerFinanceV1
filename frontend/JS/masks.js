document.addEventListener('DOMContentLoaded', () => {
    // Máscara dinâmica para CPF/CNPJ
function cpfCnpjMask(value) {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 11) { // CPF
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ
      return cleaned
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
    }
  }
  
    // Máscara de telefone
function phoneMask(value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
    // Máscara para Valor Monetário
    function currencyMask(value) {
        let valor = value.replace(/\D/g, '');
        valor = (valor/100).toFixed(2) + '';
        valor = valor.replace(".", ",");
        valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        return 'R$ ' + valor;
      }
  
    // Aplicar máscaras dinamicamente
    function applyMasks() {
      document.querySelectorAll('[id*="cpf"], [id*="phone"], [id*="valor"]').forEach(input => {
        input.addEventListener('input', (e) => {
          const value = e.target.value;
          
          if (input.id.includes('cpf')) {
            e.target.value = cpfCnpjMask(value);
          }
          else if (input.id.includes('phone') || input.id.includes('telefone')) {
            e.target.value = phoneMask(value);
          }
          else if (input.id.includes('valor')) {
            e.target.value = currencyMask(value);
          }
        });
      });
    }

    function validatePatterns() {
        document.querySelectorAll('input').forEach(input => {
          input.addEventListener('input', () => {
            if (input.checkValidity()) {
              input.style.borderColor = '#2ecc71'; // Verde para válido
            } else {
              input.style.borderColor = '#e74c3c'; // Vermelho para inválido
            }
          });
        });
      }
  
    // Validação de Email
    function validateEmail() {
      document.querySelectorAll('[type="email"]').forEach(input => {
        input.addEventListener('blur', (e) => {
          if (!e.target.value.includes('@')) {
            input.setCustomValidity('Email inválido');
            input.reportValidity();
          } else {
            input.setCustomValidity('');
          }
        });
      });
    }
  
    applyMasks();
    validateEmail();
  });