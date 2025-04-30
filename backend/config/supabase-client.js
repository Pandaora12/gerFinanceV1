// supabase-client.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// URL e chave do Supabase (copie da aba Configuração/API)
const supabaseUrl = "https://eipzrerphviykmmzvdfl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcHpyZXJwaHZpeWttbXp2ZGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTc3NjIsImV4cCI6MjA1ODY5Mzc2Mn0.nWJIYoP4fenCh0naMpdyj2rie01BAcechxuc8tiKqo8";

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);



//MÉTODOS DE CRUD 

/*

//Método de inserção de dados (Insert)

const { data, error } = await supabase
  .from("usuarios")
  .insert([{ email: "exemplo@email.com", senha: "123456" }]);

if (error) {
  console.error("Erro ao inserir dados:", error.message);
} else {
  console.log("Dados inseridos:", data);
}

//Método de visualização de dados (select)

const { data, error } = await supabase
  .from("usuarios")
  .select("*");

if (error) {
  console.error("Erro ao buscar dados:", error.message);
} else {
  console.log("Dados encontrados:", data);
}

//Método de atualização de dados (update)

const { error } = await supabase
  .from("usuarios")
  .update({ senha: "novaSenha123" })
  .eq("email", "exemplo@email.com");

if (error) {
  console.error("Erro ao atualizar dados:", error.message);
} else {
  console.log("Dados atualizados com sucesso.");
}


//Método de exclusão de dados (delete)

const { error } = await supabase
  .from("usuarios")
  .delete()
  .eq("email", "exemplo@email.com");

if (error) {
  console.error("Erro ao excluir dados:", error.message);
} else {
  console.log("Dados excluídos com sucesso.");
}

*/