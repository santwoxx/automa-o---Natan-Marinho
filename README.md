# ZapFlow - Automação de Mensagens para WhatsApp & E-mail

O **ZapFlow** é um sistema web responsivo, simples e intuitivo para preparar e disparar mensagens personalizadas em lote para o WhatsApp e E-mail de seus contatos. 

Desenvolvido inteiramente em **HTML5, CSS3 e JavaScript (Vanilla)** com uma interface moderna no estilo *Glassmorphism* (Modo Escuro), ele roda de forma 100% cliente-side (diretamente no seu navegador). Isso significa total privacidade (seus dados não são enviados para nenhum servidor externo) e rapidez (sem necessidade de instalação de softwares complexos).

---

## 🚀 Como Iniciar

1. Navegue até a pasta do projeto.
2. Dê um duplo clique no arquivo `index.html` para abri-lo em qualquer navegador (Chrome, Edge, Firefox, Safari, etc.).
3. O sistema estará pronto para uso imediatamente!

---

## 🛠️ Recursos e Como Utilizar

### 1. Importação de Contatos
Você pode carregar sua lista de duas maneiras:
- **Importar CSV/TXT**: Arraste e solte seu arquivo CSV ou clique na área pontilhada para selecionar.
  - O sistema é inteligente e tentará identificar as colunas automaticamente pelos cabeçalhos (ex: `Nome`, `Telefone`, `Email`, `VariavelExtra`).
  - Você pode clicar no botão **"Baixar Modelo CSV"** para obter um arquivo de exemplo formatado.
  - *Nota sobre Telefones:* O ZapFlow limpa os números automaticamente (remove parênteses, traços e espaços) e adiciona o código de país `55` (Brasil) se ele estiver faltando.
- **Cadastro Manual**: Clique em "Cadastro Manual", preencha os campos e salve para inserir um contato individual na tabela.

### 2. Personalização das Mensagens (Templates)
Na aba **"Personalizar Mensagens"**, você pode escrever o modelo de texto padrão.
- Use as abas para alternar entre **WhatsApp** e **E-mail**.
- Você pode clicar nos botões de variáveis dinâmicas (como `{Nome}`, `{Telefone}`, `{E-mail}` ou `{Variável Extra}`) para inseri-las na posição do cursor.
- O painel de **Pré-visualização em Tempo Real** mostrará exatamente como a mensagem ficará para o contato atualmente selecionado na tabela.

### 3. Disparo Sequencial Inteligente
Para evitar bloqueios e banimentos do seu número por parte do WhatsApp (o que ocorre ao usar APIs de disparo em massa automatizadas não-oficiais), o ZapFlow utiliza um **Fluxo de Disparo Sequencial**:
1. Clique no botão grande **"Iniciar Disparo Sequencial"**.
2. O assistente em modal será aberto exibindo os dados do primeiro contato pendente e a mensagem personalizada dele.
3. Clique em **"Enviar Mensagem"**:
   - O sistema abrirá o WhatsApp Web (ou seu cliente de e-mail) pré-preenchido em uma nova guia.
   - O contato será marcado como **"Enviado"** na lista principal.
   - O assistente avançará automaticamente para o próximo contato da fila.
4. Você também pode **Pular** um contato ou **Marcar como Enviado manualmente**.

### 4. Gerenciamento e Exportação
- Use a barra de pesquisa para filtrar contatos.
- Filtre a tabela entre **Todos**, **Pendentes** ou **Enviados**.
- Clique em **"Exportar CSV"** para baixar a lista atualizada com a coluna de status de envio para acompanhamento.
- Use **"Limpar Tudo"** para apagar a lista local e começar do zero.
- Os dados (contatos e templates) são salvos automaticamente no seu navegador (`localStorage`), ou seja, se você fechar ou recarregar a página, não perderá o seu progresso.

---

## 🎨 Design System & Tecnologias
- **Tipografia**: Outfit & Inter (Google Fonts)
- **Ícones**: Lucide Icons
- **Efeitos**: Glassmorphism, Neon Glow e Micro-animações responsivas.
