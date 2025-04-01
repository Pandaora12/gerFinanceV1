// Função para gerar código aleatório
function generateCode() {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  document.getElementById("generated-code").value = code;

  // Configurar expiração em 1 hora
  setTimeout(() => {
    document.getElementById("generated-code").value = "Código expirado";
  }, 3600000); // 3600000ms = 1 hora
}

// Adicionar evento ao botão de gerar código
document.getElementById("generate-code-btn").addEventListener("click", generateCode);

// Função para mudar tema
document.getElementById("change-theme-btn").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  alert("Tema alterado!");
});

// Função para excluir conta
document.getElementById("delete-account-btn").addEventListener("click", async () => {
  const confirmDelete = confirm("Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.");
  if (confirmDelete) {
    try {
      // Supabase: exclusão de conta
      const { error } = await supabase.auth.user.delete();
      if (error) {
        alert("Erro ao excluir conta: " + error.message);
      } else {
        alert("Conta excluída com sucesso!");
        window.location.href = "login.html"; // Redirecionar para a tela de login
      }
    } catch (err) {
      console.error("Erro inesperado:", err.message);
    }
  }
});
