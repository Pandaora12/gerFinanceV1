import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_fallback';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Configuração do Banco de Dados
const db = new Pool({
    host: 'aws-0-us-east-1.pooler.supabase.com', // Substitua pelo Supabase ou host local
    user: 'postgres.eipzrerphviykmmzvdfl',
    password: '2gIiIUrwczFaKkE9',
    database: 'postgres',
    port: 5432,
});

// Testar conexão
db.connect()
    .then(() => console.log('Conectado ao banco de dados!'))
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
        process.exit(-1);
    });
       


    // Rota para cadastrar usuários

    app.post('/usuarios', async (req, res) => {
        const { nome_completo, email, telefone, senha } = req.body;
      
        // Validação básica
        if (!nome_completo || !email || !telefone || !senha) {
          return res.status(400).json({ message: 'Preencha todos os campos!' });
        }
      
        try {
          // Verifica se e-mail já existe
          const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
          if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'E-mail já cadastrado!' });
          }
      
          // Criptografa a senha e insere no banco
          const hashedPassword = await bcrypt.hash(senha, 10);
          await db.query(
            'INSERT INTO usuarios (nome_completo, email, telefone, senha) VALUES ($1, $2, $3, $4)',
            [nome_completo, email, telefone, hashedPassword]
          );
      
          res.status(201).json({ message: 'Usuário criado com sucesso!' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Erro interno no servidor.' });
        }
      });


      // Rota para autenticar o login do usuário
    app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha inválida.' });
        }

        // Gera o token JWT (com expiração de 1 hora)
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Retorna os dados do usuário (evite incluir a senha no retorno)
        res.json({
            message: 'Login realizado com sucesso!',
            user: {
                id: user.id,
                nome_completo: user.nome_completo,
                email: user.email,
                telefone: user.telefone
            },
            token: token  // Você pode gerar um JWT no futuro
        });
    } catch (err) {
        console.error('Erro ao autenticar:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Rotas - CRUD para Fichas

         // Middleware de autenticação (mover para fora das rotas)
        const authenticate = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.sendStatus(401);
      
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) return res.sendStatus(403);
          req.userId = decoded.userId;
          next();
            });
        };

    app.get('/fichas', authenticate, async (req, res) => {
    app.get('/fichas', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM fichas');
        res.json(results.rows);
    } catch (err) {
        console.error('Erro ao buscar fichas:', err);
        res.status(500).send('Erro ao buscar fichas');
    }
});

app.post('/fichas', async (req, res) => {
    const { user_id, nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status } = req.body;
    try {
        await db.query(
            'INSERT INTO fichas (user_id, nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status, criado_em) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())',
            [user_id, nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status]
        );
        res.status(201).send('Ficha criada com sucesso!');
    } catch (err) {
        console.error('Erro ao criar ficha:', err);
        res.status(500).send('Erro ao criar ficha');
    }
});

app.put('/fichas/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status } = req.body;
    try {
        await db.query(
            'UPDATE fichas SET nome_cliente = $1, cpf_cnpj = $2, telefone = $3, email = $4, valor = $5, data = $6, descricao = $7, status = $8 WHERE id = $9',
            [nome_cliente, cpf_cnpj, telefone, email, valor, data, descricao, status, id]
        );
        res.send('Ficha atualizada com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar ficha:', err);
        res.status(500).send('Erro ao atualizar ficha');
    }
});

app.delete('/fichas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM fichas WHERE id = $1', [id]);
        res.status(204).send('Ficha excluída com sucesso!');
    } catch (err) {
        console.error('Erro ao excluir ficha:', err);
        res.status(500).send('Erro ao excluir ficha');
    }
});

});

// Iniciar Servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
