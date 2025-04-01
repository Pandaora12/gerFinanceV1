document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    // Simulação: verifica login com email e senha fictícios
    if (email === "teste@email.com" && password === "123456") {
      alert("Login teste bem-sucedido! Redirecionando...");
      window.location.href = "dashboard.html"; // Redirecionar para o dashboard
    } else {
      alert("Credenciais inválidas. Tente novamente!");
    }
  });
  