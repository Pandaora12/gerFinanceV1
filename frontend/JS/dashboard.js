document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const logoutBtn = document.getElementById("logout-btn");

  // Alternar o menu ao clicar no botão
  menuToggle.addEventListener("click", function () {
      sidebarMenu.classList.toggle("active");
  });

  // Lógica para o botão de logout (pode ser ajustada para limpar sessão/token)
  logoutBtn.addEventListener("click", function () {
    sessionStorage.clear(); // Limpa dados de sessão
    localStorage.clear(); // Limpa dados persistentes
    alert("Você saiu!");
    window.location.href = "login.html";
  });
});



async function loadUsers() {
  const { data, error } = await supabase.from("usuarios").select("*");
  if (error) {
    console.error("Erro ao carregar usuários:", error.message);
    return;
  }

  const userList = document.getElementById("user-list");
  userList.innerHTML = ""; // Limpar lista atual

  data.forEach(user => {
    const li = document.createElement("li");
    li.className = "user-item";
    li.innerHTML = `
      <span class="user-name">${user.name}</span>
      <span class="status">
        <span class="status-circle ${user.statusColor}"></span>
        <span class="status-text">${user.status}</span>
      </span>
    `;
    li.addEventListener("click", () => openTable(user.id));
    userList.appendChild(li);
  });
}

document.querySelectorAll(".user-item").forEach(item => {
  item.addEventListener("click", () => {
    const popup = document.getElementById("table-popup");
    popup.classList.remove("hidden");

    // Exemplo: carregar dados específicos do cliente clicado
    const clientName = item.querySelector(".user-name").textContent;
    document.querySelector("#table-popup h2").textContent = `Dados da Tabela - ${clientName}`;
  });
});

// Botão de fechar o pop-up
const closePopup = document.querySelector(".popup");
closePopup.addEventListener("click", (event) => {
  if (event.target === closePopup) {
    closePopup.classList.add("hidden");
  }
});

document.getElementById("delete-table-btn").addEventListener("click", () => {
  const confirmationPopup = document.getElementById("confirmation-popup");
  confirmationPopup.classList.remove("hidden");
});




document.addEventListener("DOMContentLoaded", function () {
  const createTableBtn = document.getElementById("create-table-btn");
  const createTablePopup = document.getElementById("create-table-popup");

  // Mostrar o pop-up ao clicar no botão "CRIE UMA NOVA TABELA"
  createTableBtn.addEventListener("click", () => {
    console.log("Botão clicado!"); // Para verificar no console
    createTablePopup.classList.remove("hidden");
  });

  // Fechar o pop-up ao clicar fora dele (opcional)
  createTablePopup.addEventListener("click", (event) => {
    if (event.target === createTablePopup) {
      createTablePopup.classList.add("hidden");
    }
  });
});




document.addEventListener("DOMContentLoaded", function () {
  const createPopup = document.getElementById("create-table-popup");
  const sharedCodeSection = document.getElementById("shared-code-section");
  const addSharedCodeBtn = document.getElementById("add-shared-code-btn");

  // Abrir ou fechar seção de código compartilhado
  addSharedCodeBtn.addEventListener("click", () => {
    sharedCodeSection.classList.toggle("hidden");
  });

  // Salvando nova tabela (exemplo básico)
  document.getElementById("create-table-form").addEventListener("submit", (event) => {
    event.preventDefault();

    // Capturando dados do formulário
    const clientName = document.getElementById("client-name").value;
    const cpfCnpj = document.getElementById("cpf-cnpj").value;
    const phone = document.getElementById("phone-number").value;
    const email = document.getElementById("email").value;
    const value = document.getElementById("value").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;
    const status = document.getElementById("status").value;
    const sharedCode = document.getElementById("shared-code").value || null;

    // Exemplo: Salvando dados (lógica real depende do backend)
    console.log("Dados da tabela:", {
      clientName,
      cpfCnpj,
      phone,
      email,
      value,
      date,
      description,
      status,
      sharedCode,
    });

    alert("Tabela criada com sucesso!");
    createPopup.classList.add("hidden");
  });
});


loadUsers();



