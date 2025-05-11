import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configurações
const JWT_SECRET = '582bb1877bc6cf5537c1c62b8f8578de5a1039837b4414640a5c3c90c5e7a0bc'; // Substitua por uma chave segura
const app = express();
const port = 3000;

// Configuração do Supabase
const db = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  user: 'postgres.eipzrerphviykmmzvdfl',
  password: '2gIiIUrwczFaKkE9',
  database: 'postgres',
  port: 5432,
});

// Middleware
app.use(cors({
    origin: 'http://localhost',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
app.use(bodyParser.json());

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.userId = decoded.userId;
    next();
  });
};

// Rotas de Autenticação
app.post('/api/auth/register', async (req, res) => {
  const { nome_completo, email, telefone, senha } = req.body;

  try {
    const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = await db.query(
      'INSERT INTO usuarios (nome_completo, email, telefone, senha) VALUES ($1, $2, $3, $4) RETURNING id, nome_completo, email, telefone',
      [nome_completo, email, telefone, hashedPassword]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
      user: newUser.rows[0],
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(senha, user.rows[0].senha);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      user: {
        id: user.rows[0].id,
        nome_completo: user.rows[0].nome_completo,
        email: user.rows[0].email,
        telefone: user.rows[0].telefone
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rotas CRUD para Fichas
app.get('/fichas', authenticate, async (req, res) => {
  try {
    const fichas = await db.query('SELECT * FROM fichas WHERE user_id = $1', [req.userId]);
    res.json(fichas.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar fichas' });
  }
});

// Rota para buscar uma ficha específica
app.get('/fichas/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const ficha = await db.query(
      'SELECT * FROM fichas WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (ficha.rows.length === 0) {
      return res.status(404).json({ error: 'Ficha não encontrada' });
    }
    
    res.json(ficha.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ficha' });
  }
});

app.post('/fichas', authenticate, async (req, res) => {
  let { nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status, entrada, parcelas, payment_status } = req.body;

  // Validação e formatação
  if (!nome_cliente || nome_cliente.length < 3) {
    return res.status(400).json({ error: 'Nome inválido' });
  }

  cpf_cnpj = cpf_cnpj.replace(/\D/g, '');
  telefone = telefone.replace(/\D/g, '');
  
  // Converter valor para número
  if (typeof valor === 'string') {
    valor = parseFloat(
      valor.replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.')
    );
  }
  
  if (isNaN(valor)) {
    return res.status(400).json({ error: 'Valor inválido' });
  }
  
  // Converter entrada para número se existir
  if (entrada && typeof entrada === 'string') {
    entrada = parseFloat(
      entrada.replace('R$ ', '')
        .replace(/\./g, '')
        .replace(',', '.')
    );
  }

  // Definir status de pagamento padrão se não fornecido
  if (!payment_status) {
    payment_status = 'NAO_PAGO';
  }

  try {
    const newFicha = await db.query(
      `INSERT INTO fichas (
        user_id, nome_cliente, cpf_cnpj, telefone, email, 
        valor, data, descricao, status, entrada, parcelas, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [req.userId, nome_cliente, cpf_cnpj, telefone, email, 
       valor, data, descricao, status, entrada, parcelas, payment_status]
    );
    
    res.status(201).json(newFicha.rows[0]);
  } catch (err) {
    console.error('Erro ao criar ficha:', err);
    res.status(500).json({ error: 'Erro ao criar ficha' });
  }
});

app.put('/fichas/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  let { nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status, entrada, parcelas, payment_status } = req.body;

  try {
    // Verifica se a ficha pertence ao usuário
    const ficha = await db.query(
      'SELECT * FROM fichas WHERE id = $1 AND user_id = $2', 
      [id, req.userId]
    );
    
    if (ficha.rows.length === 0) {
      return res.status(404).json({ error: 'Ficha não encontrada' });
    }

    // Formatação dos dados
    if (cpf_cnpj) cpf_cnpj = cpf_cnpj.replace(/\D/g, '');
    if (telefone) telefone = telefone.replace(/\D/g, '');
    
    // Converter valor para número se fornecido
    if (valor !== undefined) {
      if (typeof valor === 'string') {
        valor = parseFloat(
          valor.replace('R$ ', '')
            .replace(/\./g, '')
            .replace(',', '.')
        );
      }
    } else {
      valor = ficha.rows[0].valor;
    }
    
    // Converter entrada para número se fornecido
    if (entrada !== undefined) {
      if (typeof entrada === 'string') {
        entrada = parseFloat(
          entrada.replace('R$ ', '')
            .replace(/\./g, '')
            .replace(',', '.')
        );
      }
    } else {
      entrada = ficha.rows[0].entrada;
    }

    // Usar valores existentes se não fornecidos
    nome_cliente = nome_cliente || ficha.rows[0].nome_cliente;
    cpf_cnpj = cpf_cnpj || ficha.rows[0].cpf_cnpj;
    telefone = telefone || ficha.rows[0].telefone;
    email = email || ficha.rows[0].email;
    data = data || ficha.rows[0].data;
    descricao = descricao !== undefined ? descricao : ficha.rows[0].descricao;
    status = status || ficha.rows[0].status;
    parcelas = parcelas !== undefined ? parcelas : ficha.rows[0].parcelas;
    payment_status = payment_status || ficha.rows[0].payment_status;

    const updatedFicha = await db.query(
      `UPDATE fichas SET 
        nome_cliente = $1, cpf_cnpj = $2, telefone = $3, email = $4,
        valor = $5, data = $6, descricao = $7, status = $8, entrada = $9, parcelas = $10, payment_status = $11
       WHERE id = $12 AND user_id = $13 RETURNING *`,
      [nome_cliente, cpf_cnpj, telefone, email, 
       valor, data, descricao, status, entrada, parcelas, payment_status, id, req.userId]
    );
    
    res.json(updatedFicha.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar ficha:', err);
    res.status(500).json({ error: 'Erro ao atualizar ficha' });
  }
});

app.delete('/fichas/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM fichas WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ficha não encontrada' });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir ficha' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});