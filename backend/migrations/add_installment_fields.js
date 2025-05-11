import { Pool } from 'pg';

// Configuração do Supabase
const db = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  user: 'postgres.eipzrerphviykmmzvdfl',
  password: '2gIiIUrwczFaKkE9',
  database: 'postgres',
  port: 5432,
});

async function addInstallmentFields() {
  try {
    console.log('Iniciando migração para adicionar campos de entrada e parcelas...');
    
    // Verificar se as colunas já existem
    const checkColumns = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fichas' 
      AND column_name IN ('entrada', 'parcelas')
    `);
    
    if (checkColumns.rows.length === 2) {
      console.log('Colunas já existem. Pulando migração.');
      return;
    }
    
    // Adicionar colunas se não existirem
    await db.query(`
      ALTER TABLE fichas 
      ADD COLUMN IF NOT EXISTS entrada NUMERIC DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT NULL
    `);
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await db.end();
  }
}

// Executar a migração
addInstallmentFields();