# 🚀 ResolvTI: Modernizando o Suporte Técnico com Automação e Eficiência

**👨‍💻 Desenvolvido por Cleiton Ferrugem e Lucas Gades**

---

## 🎯 O Desafio do Suporte Técnico Tradicional

Em muitas organizações, o suporte de TI ainda acontece por telefone – um método que dificulta o registro, o acompanhamento e a análise dos chamados, além de gerar perda de informações e retrabalho. Foi justamente esse cenário, vivido na Procuradoria-Geral da Fazenda Nacional (4ª Região), que motivou o desenvolvimento do ResolvTI.

---

## 💡 O que é o ResolvTI?

O **ResolvTI** é uma plataforma web criada para transformar o atendimento de TI. Com ela, a abertura, acompanhamento e solução de chamados passam a ser centralizados, organizados e automatizados, trazendo mais agilidade, controle e eficiência ao suporte técnico.

---

## ⚖️ ResolvTI x GLPI x Freshdesk x Zendesk

| Critério                | ResolvTI      | GLPI           | Freshdesk      | Zendesk        |
|-------------------------|---------------|----------------|----------------|----------------|
| Facilidade de uso       | ⭐⭐⭐⭐⭐        | ⭐⭐⭐           | ⭐⭐⭐⭐          | ⭐⭐⭐⭐          |
| Personalização          | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐          | ⭐⭐⭐           | ⭐⭐⭐           |
| Integração com sistemas | ⭐⭐⭐⭐         | ⭐⭐⭐⭐          | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐         |
| Custo                   | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐         | ⭐⭐            | ⭐             |
| Foco em automação TI    | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐          | ⭐⭐⭐           | ⭐⭐⭐           |
| Dashboard em tempo real | ⭐⭐⭐⭐⭐        | ⭐⭐⭐           | ⭐⭐⭐⭐          | ⭐⭐⭐⭐          |

> **Notas atribuídas com base em análise de documentação oficial, experiência prática, pesquisa de mercado e feedbacks de usuários. Para detalhes, consulte a justificativa ao final deste artigo.*

**Diferenciais do ResolvTI:**  
- Interface leve, moderna e responsiva  
- Dashboard centralizado e personalizável  
- Filtros avançados, atribuição de tarefas e atualização automática  
- Flexível para atender empresas de todos os portes e segmentos (públicos e privados)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React (Vite) + TailwindCSS  
- **Backend:** Node.js + Express + TypeScript  
- **Banco de Dados:** PostgreSQL (Supabase)  
- **Autenticação:** Supabase Auth + JWT  
- **Notificações:** Nodemailer (em implementação)  
- **Deploy:** Render/Vercel (planejado)

---

## 🔐 Segurança e Permissões

- JWT para autenticação e controle de acesso  
- RLS no Supabase, garantindo que cada usuário veja apenas seus chamados  
- Permissões por nível: cliente (usuário padrão) e staff (admin)

---

## 🧪 Funcionalidades já disponíveis

- Cadastro e listagem de chamados via formulário digital  
- Categorização de chamados por tipo (hardware, sistemas, programas, outros)  
- API REST integrada ao Supabase  
- Autenticação de usuários (cliente e staff)  
- Dashboard inicial para equipe técnica

---

## 🚧 Em desenvolvimento

- Filtros avançados por prioridade, status, período e categoria  
- Notificações automáticas por e-mail sobre comentários nos chamados  
- Dashboard com atualização automática (refresh a cada 10-15 segundos)  
- Indicação clara do período dos dados exibidos (“últimos 7 dias” etc.)  
- Análise comparativa detalhada na documentação

---

## 📅 Roadmap (Resumo)

- Finalizar filtros e tela de envio de chamados  
- Publicação do MVP em Render ou Vercel  
- Entrega de modelagens (Canvas, personas, fluxogramas)  
- Ampliar documentação e análise de mercado

---

## ✅ Pontos Fortes

- Atende a uma necessidade real, comum em equipes de TI de diferentes setores  
- Interface amigável e personalizável  
- Tecnologias modernas, robustas e seguras  
- Projeto funcional já disponível  
- Categorização dos chamados para facilitar o suporte

---

## 🛠️ Pontos a Melhorar

- Detalhar os diferenciais em relação a softwares burocráticos e engessados do mercado  
- Aprimorar autenticação para evitar lentidão e mensagens de espera no login  
- Melhorar a dashboard: implementar categorização dos chamados (hardware, sistemas, programas, outros) e indicação clara do período dos dados exibidos  

---

## 🔗 Links Importantes

- [Repositório no GitHub](https://github.com/cferrugem/resolv-)
- [Artigo Medium antigo](https://medium.com/@lucasgades39/resolv-sistema-de-chamados-t%C3%A9cnicos-995456e941ac)

---

## 🏁 Conclusão

O ResolvTI é uma solução inovadora para os desafios do suporte técnico, trazendo automação, organização, categorização de demandas e uma experiência moderna para equipes de TI de qualquer tipo de organização. O projeto segue evoluindo, com a meta de entregar uma solução cada vez mais robusta, eficiente e adaptada à realidade dos usuários.

---
