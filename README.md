# 🍔 An?Burgueria

> **"Bateu a dúvida do que comer hoje?"**  
> Sistema web de cardápio digital e pedidos online desenvolvido como projeto final da disciplina de **Desenvolvimento Web**, simulando uma hamburgueria artesanal localizada em Barra Seca, São Francisco de Itabapoana - RJ.

---

## ✨ Funcionalidades Principais

- **Página Inicial Dinâmica (`index.html`):** Destaques da semana, promoções carregadas via JSON e cupom de desconto copiável com um clique (`DUVIDA15`).
- **Cardápio Interativo (`cardapio.html`):** Listagem dinâmica via `fetch` com filtros por categoria (*Todos*, *Hambúrgueres*, *Acompanhamentos* e *Bebidas*).
- **Personalização de Pedidos:** Modal para adicionar extras (blend extra, bacon, cheddar, cebola caramelizada, molhos) com cálculo automático de valor e campo de observações para a cozinha.
- **Sacola Lateral:** Resumo em tempo real dos itens, adicionais, observações, remoção individual e soma total.
- **Checkout Inteligente:**
  - Escolha entre **Entrega (Delivery)** ou **Retirar na Loja**.
  - Preenchimento automático de endereço via **API ViaCEP** com validação do raio de entrega (São Francisco de Itabapoana - RJ).
  - Persistência dos dados e endereço do cliente via **`localStorage`**.
  - Validação completa de formulário, cupom de desconto, opção de pagamento via **PIX ou Cartão (Crédito/Débito)** ou **Dinheiro** (com troco) e aviso de pagamento na entrega.
- **Controle de Horário:** Validação automática do expediente (Terça a Quinta das 18h às 23h; Sexta a Domingo das 18h às 00h; fechado às segundas), bloqueando pedidos fora do horário.
- **Sobre & Contato (`sobre.html`):** História da marca, mapa interativo incorporado e formulário de contato.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3** (estilização e animações `@keyframes`)
- **JavaScript (ES6+)** (manipulação do DOM, `fetch`, ViaCEP, validações e `localStorage`)
- **Bootstrap 5 & Bootstrap Icons**

---

## 📁 Estrutura do Projeto

```text
├── index.html          # Página inicial e destaques
├── cardapio.html       # Cardápio, sacola e finalização de pedido
├── sobre.html          # História, localização e contato
├── css/
│   └── style.css       # Estilos e animações
├── js/
│   └── app.js          # Lógica do carrinho, CEP, horário e validações
├── data/
│   ├── cardapio.json   # Produtos do cardápio
│   ├── destaques.json  # Promoções e cupons
│   └── frases.json     # Mensagens dos avisos flutuantes
└── img/                # Imagens e logotipo
