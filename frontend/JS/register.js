document.addEventListener("DOMContentLoaded", () => {
  console.log("Script de registro carregado!");

  // Elementos do DOM
  const registerForm = document.getElementById("register-form");
  const registerPopup = document.getElementById("register-popup");
  const closePopupBtn = document.getElementById("close-popup-btn");
  const registerBtn = document.getElementById("register-btn");
  const btnText = document.getElementById("btn-text");
  const btnSpinner = document.getElementById("btn-spinner");

  // Constantes
  const API_URL = "http://localhost:3000"; // Substitua por .env em produção

  // Formatação de telefone (opcional)
  document.getElementById("register-phone").addEventListener("input", (e) => {
    e.target.value = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  });

  // Evento de envio do formulário
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Dados do formulário
    const formData = {
      nome_completo: document.getElementById("register-name").value.trim(),
      email: document.getElementById("register-email").value.trim().toLowerCase(),
      telefone: document.getElementById("register-phone").value.replace(/\D/g, ""),
      senha: document.getElementById("register-password").value.trim(),
      confirmPassword: document.getElementById("register-confirm-password").value.trim()
    };

    // Validações básicas
    if (!Object.values(formData).every(Boolean)) {
      showAlert("Por favor, preencha todos os campos.");
      return;
    }

    if (formData.senha !== formData.confirmPassword) {
      showAlert("As senhas não coincidem!");
      return;
    }

    if (formData.senha.length < 6) {
      showAlert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    // Feedback visual durante o registro
    toggleLoading(true);

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_completo: formData.nome_completo,
          email: formData.email,
          telefone: formData.telefone,
          senha: formData.senha
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro desconhecido");
      }

      // Sucesso
      showPopup();
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);

    } catch (error) {
      console.error("Erro no registro:", error);
      let errorMessage = "Erro ao cadastrar. Email já cadastrado.";
      if (error.message.includes("duplicate key value")) {
        errorMessage = "Este e-mail já está cadastrado.";
        }
        showAlert(errorMessage);
    } finally {
      toggleLoading(false);
    }
  });

  // Fecha o pop-up
  closePopupBtn?.addEventListener("click", () => {
    registerPopup.classList.add("hidden");
    window.location.href = "login.html";
  });

  // Funções auxiliares
  function toggleLoading(isLoading) {
    if (isLoading) {
      btnText.classList.add("hidden");
      btnSpinner.classList.remove("hidden");
      registerBtn.disabled = true;
    } else {
      btnText.classList.remove("hidden");
      btnSpinner.classList.add("hidden");
      registerBtn.disabled = false;
    }
  }

  function showAlert(message) {
    alert(message); // Substitua por um toast/sweetAlert em produção
  }

  function showPopup() {
    if (registerPopup) {
      registerPopup.classList.remove("hidden");
    }
  }
});