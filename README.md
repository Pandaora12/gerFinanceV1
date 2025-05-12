# GerFinance V1

Sistema de gerenciamento financeiro desenvolvido para controle de fichas financeiras, pagamentos e relatórios.

## Funcionalidades

- Autenticação de usuários (login/registro)
- Dashboard de fichas financeiras
- Criação, edição e exclusão de fichas
- Controle de status de pagamento
- Visualização de gráficos e relatórios
- Geração de PDF das fichas
- Sistema de parcelamento com entrada

## Tecnologias Utilizadas

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Banco de Dados: PostgreSQL (Supabase)
- Autenticação: JWT
- Gráficos: Chart.js
- PDF: jsPDF

## Instalação

1. Clone o repositório
2. Instale as dependências:
```
npm install
```
3. Execute as migrações do banco de dados:
```
node backend/migrations/add_installment_fields.js
node backend/migrations/add_payment_status_field.js
```
4. Inicie o servidor:
```
npm start
```

## Estrutura do Projeto

```
gerFinanceV1/
├── assets/             # Recursos estáticos
├── backend/            # Código do servidor
│   ├── config/         # Configurações
│   ├── migrations/     # Scripts de migração
│   └── services/       # Serviços da API
├── docs/               # Documentação
├── frontend/           # Interface do usuário
│   ├── CSS/            # Estilos
│   ├── html/           # Páginas HTML
│   └── JS/             # Scripts JavaScript
├── main.js             # Ponto de entrada do Electron
└── package.json        # Dependências e scripts
```

## Melhorias Recentes

- Adicionado suporte para entrada e parcelamento
- Implementado sistema de status de pagamento
- Adicionada página de visualização de pagamentos com gráficos
- Corrigido problema de formatação de valores monetários
- Implementada geração de PDF das fichas
- Melhorada a interface do menu de navegação
- Implementado sistema de paginação no dashboard e na página de pagamentos
- Adicionado sistema de notificações para pagamentos pendentes
- Implementada página de contratos com modelos personalizáveis
- Adicionadas configurações de tema (claro/escuro)

## Próximos Passos

- Adicionar filtros avançados
- Implementar relatórios personalizados
- Melhorar a responsividade para dispositivos móveis
- Implementar sistema de backup automático
- Adicionar dashboard com métricas avançadas