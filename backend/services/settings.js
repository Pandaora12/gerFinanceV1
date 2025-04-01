// Importa o cliente Supabase centralizado
import { supabase } from "../config/supabase-client.js";

// Função para salvar o código gerado
export async function saveGeneratedCode(userId, code) {
  try {
    const { data, error } = await supabase
      .from("transacoes")
      .update({ compartilhado_com: code })
      .eq("usuario_id", userId);

    if (error) {
      throw error;
    }

    console.log("Código salvo com sucesso:", data);
    return data;
  } catch (error) {
    console.error("Erro ao salvar código:", error.message);
    return null;
  }
}
