import { supabase } from "../config/supabase-client.js";

export async function getTransactions() {
  return await supabase.from("transacoes").select("*");
}

export async function addTransaction(data) {
  return await supabase.from("transacoes").insert(data);
}

export async function updateTransaction(id, updates) {
  return await supabase.from("transacoes").update(updates).eq("id", id);
}

export async function deleteTransaction(id) {
  return await supabase.from("transacoes").delete().eq("id", id);
}
