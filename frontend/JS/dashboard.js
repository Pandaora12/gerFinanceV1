document.addEventListener("DOMContentLoaded", async function () {
  // Verifica se o usuário está autenticado
  const authToken = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!authToken || !userData) {
    alert("Você precisa estar logado para acessar o dashboard!");
    window.location.href = "login.html";
    return;
  }

  // Elementos do DOM
  const menuToggle = document.getElementById("menu-toggle");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const logoutBtn = document.getElementById("logout-btn");
  const createTableBtn = document.getElementById("create-table-btn");

  // Exibe o nome do usuário (primeiro nome)
  if (userData && userData.nome_completo) {
    const firstName = userData.nome_completo.split(" ")[0];
    document.getElementById("user-name").textContent = firstName;
  }

  // Alternar menu lateral
  menuToggle.addEventListener("click", () => sidebarMenu.classList.toggle("active"));

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    alert("Você saiu!");
    window.location.href = "login.html";
  });

  // Abrir pop-up de criação
  createTableBtn.addEventListener("click", () => openPopup("create-table-popup"));

  // Carrega as fichas do usuário
  await loadDashboardData(userData.id);
});

// Restante do código permanece igual...
async function loadDashboardData(userId) {
  try {
    const response = await fetch(`http://localhost:3000/fichas?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Erro ao carregar fichas');
    
    const fichas = await response.json();
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";

    fichas.forEach(ficha => addFichaToList(ficha));
  } catch (error) {
    console.error("Erro:", error);
    alert(error.message);
  }
}

// ... (outras funções permanecem iguais)