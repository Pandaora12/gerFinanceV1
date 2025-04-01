import { supabase } from "./config/supabase-client.js"; // Importa a conexão Supabase já configurada

(async () => {
  const { data, error } = await supabase
    .from("Clientes")
    .insert([
      {
        id: 2,
        user_id: "2", // Certifique-se de que o ID é válido na tabela usuarios
        nome_cliente: "Bruno Luiz",
        cpf_cnpj: "449.599.848-05",
        telefone: "(11) 99412-8922",
        email_cliente: "bruno@email.com",
        valor: 1200.50,
        descricao: "Roubo a mercado.",
        data_inicial: "2025-03-28",
        data_final: "2025-04-28",
        status: "PENDENTE",
      },
    ]);

    if (error) {
        console.error("Erro ao inserir dados:", error);
      } else {
        console.log("Conta cadastrada com sucesso:", data);
      }
})();
