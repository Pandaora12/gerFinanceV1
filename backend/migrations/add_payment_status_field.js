import { Pool } from 'pg';

// Configuração do Supabase
const db = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  user: 'postgres.eipzrerphviykmmzvdfl',
  password: '2gIiIUrwczFaKkE9',
  database: 'postgres',
  port: 5432,
});

async function addPaymentStatusField() {
  try {
    console.log('Iniciando migração para adicionar campo de status de pagamento...');
    
    // Verificar se a coluna já existe
    const checkColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fichas' 
      AND column_name = 'payment_status'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('Coluna payment_status já existe. Pulando migração.');
      return;
    }
    
    // Adicionar coluna se não existir
    await db.query(`
      ALTER TABLE fichas 
      ADD COLUMN payment_status VARCHAR(20) DEFAULT 'NAO_PAGO'
    `);
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await db.end();
  }
}

// Executar a migração
addPaymentStatusField();