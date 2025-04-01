document.getElementById("logout-btn").addEventListener("click", () => {
    // Limpeza de sessão (se aplicável)
    sessionStorage.clear();
    localStorage.clear();
    // Redirecionar para a área de login
    window.location.href = "login.html";
  });
  