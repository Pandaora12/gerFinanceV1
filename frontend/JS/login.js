document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = loginForm.querySelector("button");

  loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
          alert("Preencha todos os campos!");
          return;
      }

      try {
          // Feedback visual
          loginButton.disabled = true;
          loginButton.textContent = "Autenticando...";

          const response = await fetch("http://localhost:3000/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, senha: password })
          });

          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.error || "Falha no login");
          }

          // Salva token e dados do usuário
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(data.user));

          // Redireciona para o dashboard
          window.location.href = "dashboard.html"; // Verifique o caminho!

      } catch (error) {
          console.error("Erro:", error);
          alert(error.message || "Erro ao conectar ao servidor.");
      } finally {
          loginButton.disabled = false;
          loginButton.textContent = "Entrar";
      }
  });
});