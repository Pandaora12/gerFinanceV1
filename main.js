import { app, BrowserWindow, ipcMain } from "electron";

let mainWindow; // Janela de Login
let dashboardWindow; // Janela do Dashboard

// Função para criar a janela de login
function createLoginWindow() {
  if (mainWindow) return; // Garante que não criamos a janela novamente

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Carregar o arquivo HTML principal (login)
  mainWindow.loadFile("./frontend/html/dashboard.html");

  // Quando a janela principal for fechada
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Função para criar a janela do dashboard
function createDashboardWindow() {
  if (dashboardWindow) return; // Garante que não criamos o dashboard novamente

  dashboardWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: __dirname + "/preload.js", // Carrega o preload.js
      contextIsolation: true, // Mantém o contexto isolado
      enableRemoteModule: false, // Context isolation desabilitado se precisar de integração direta
    },
  });

  // Carregar o arquivo HTML do dashboard
  dashboardWindow.loadFile("./frontend/html/dashboard.html");

  // Quando o dashboard for fechado
  dashboardWindow.on("closed", () => {
    dashboardWindow = null;
  });
}

// Quando o aplicativo estiver pronto
app.on("ready", () => {
  createLoginWindow(); // Cria a janela de login
});

// Evento para abrir o dashboard
ipcMain.on("open-dashboard", () => {
  console.log("📢 Recebido evento para abrir o dashboard!");
  if (dashboardWindow) {
    dashboardWindow.focus(); // Se o dashboard já estiver aberto, traz para frente
    return;
  }
  if (mainWindow) {
    mainWindow.close(); // Fecha a janela de login se ainda estiver aberta
  }
  createDashboardWindow(); // Cria a janela do dashboard
});

// Encerrar o aplicativo quando todas as janelas forem fechadas (exceto no Mac)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// No Mac, reabre a janela quando o ícone do app é clicado
app.on("activate", () => {
  if (mainWindow === null && dashboardWindow === null) {
    createLoginWindow(); // Reabre a janela de login
  }
});
