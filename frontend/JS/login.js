// Configurando Supabase e Electron
const { ipcRenderer } = window.electron.ipcRenderer.send("open-dashboard");// Certifique-se que o Electron está configurado para Node.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Instância do cliente Supabase
const supabase = createClient(
  "https://eipzrerphviykmmzvdfl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcHpyZXJwaHZpeWttbXp2ZGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTc3NjIsImV4cCI6MjA1ODY5Mzc2Mn0.nWJIYoP4fenCh0naMpdyj2rie01BAcechxuc8tiKqo8"
);

const loginForm = document.getElementById("login-form");

// Listener para o evento de submit
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o comportamento padrão do formulário

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validação de campos
  if (!email || !password) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  console.log("Tentativa de login com:", { email });

  try {
    // Autenticação no Supabase
    console.log("Tentativa de login com:", { email, password });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("Erro no login:", error);
      alert("Erro ao fazer login: " + error.message);
      return;
    }
    
    console.log("Resposta do Supabase:", data);

    console.log("Login bem-sucedido:", data);
    alert(`Bem-vindo, ${data.user.email}`);

    // Enviar evento ao Electron para abrir o dashboard
    ipcRenderer.send("open-dashboard");
  } catch (err) {
    console.error("Erro inesperado:", err.message);
    alert("Erro inesperado. Por favor, tente novamente.");
  }
});
