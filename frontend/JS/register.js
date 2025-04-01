import bcrypt from "bcrypt";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Script carregado!");

  const registerForm = document.getElementById("register-form");
  const registerPopup = document.getElementById("register-popup");
  const closePopupBtn = document.getElementById("close-popup-btn");

  console.log("registerForm:", registerForm);
  console.log("registerPopup:", registerPopup);
  console.log("closePopupBtn:", closePopupBtn);

  // Evento de envio do formulário
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document.getElementById("register-confirm-password").value.trim();

    if (!name || !email || !phone || !password || !confirmPassword) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (!email.includes("@")) {
      alert("Insira um email válido.");
      return;
    }

    if (password.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      console.log("Tentando registrar:", { email, password });
      const { data, error } = await supabase.auth.signUp({ email, password });

      console.log("Resposta do Supabase:", data, error);

      if (error) {
        console.error("Erro ao registrar:", error.message);
        alert("Erro ao registrar: " + error.message);
        return;
      }

      console.log("Usuário registrado com sucesso!");

      if (registerPopup) {
        console.log("Exibindo pop-up...");
        registerPopup.classList.remove("hidden");
      } else {
        console.error("Elemento register-popup não encontrado!");
      }

      if (closePopupBtn) {
        closePopupBtn.addEventListener("click", () => {
          registerPopup.classList.add("hidden");
          window.location.href = "login.html";
        });
      }

      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    } catch (err) {
      console.error("Erro inesperado ao registrar:", err.message);
      alert("Erro inesperado ao registrar. Tente novamente.");
    }
  });
});