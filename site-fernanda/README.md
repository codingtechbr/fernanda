# Site + venda automática do Ebook — Fernanda Meyrelly

## O que esse projeto faz
1. O visitante digita o e-mail e clica em "Quero garantir meu ebook".
2. O site gera, na hora, um link de pagamento InfinitePay (Pix ou cartão) já
   vinculado a esse e-mail.
3. Depois do pagamento, a InfinitePay avisa o site (webhook).
4. O site confere o pagamento e manda o ebook em PDF automaticamente por
   e-mail, na hora.

Tudo isso roda de graça na Vercel (plano Hobby) + Resend (plano grátis, até
3.000 e-mails/mês).

---

## Passo 1 — Habilitar o Checkout Integrado na InfinitePay
1. Abra o app InfinitePay (ou o site).
2. Vá em **Vendas → Checkout → Configurações → Habilitar Checkout Integrado**.
   (Sem isso, a API de geração de link com webhook não funciona.)

## Passo 2 — Criar conta na Resend (envio de e-mail)
1. Crie uma conta grátis em https://resend.com
2. Em **API Keys**, gere uma chave e copie (começa com `re_...`).
3. (Recomendado) Em **Domains**, adicione seu domínio e configure os
   registros DNS indicados, para poder enviar de um e-mail tipo
   `ebook@seudominio.com`. Enquanto não configurar um domínio, você só
   consegue enviar e-mails de teste para o seu próprio e-mail — não vai
   funcionar para clientes reais.

## Passo 3 — Publicar na Vercel
1. Crie uma conta grátis em https://vercel.com
2. Suba esta pasta para um repositório no GitHub (ou use `vercel deploy`
   pela CLI, se preferir).
3. Na Vercel, clique em **Add New → Project** e importe o repositório.
4. Antes de publicar, adicione estas variáveis de ambiente
   (**Settings → Environment Variables**):

   | Nome | Valor |
   |---|---|
   | `INFINITEPAY_HANDLE` | `codingtech` (sua InfiniteTag, sem o $) |
   | `SITE_URL` | a URL que a Vercel vai te dar, ex: `https://fernanda-meyrelly.vercel.app` |
   | `EBOOK_PRICE_CENTS` | `100` (R$ 1,00 — troque depois para o preço final) |
   | `RESEND_API_KEY` | a chave que você copiou da Resend |
   | `RESEND_FROM` | ex: `Fernanda Meyrelly <ebook@seudominio.com>` |

   ⚠️ **Atenção com o `SITE_URL`**: como o valor depende da própria URL que a
   Vercel gera, faça o primeiro deploy, copie a URL final, depois volte em
   Environment Variables, cole o valor certo e clique em **Redeploy**.

5. Clique em **Deploy**.

## Passo 4 — Testar
1. Abra o site publicado.
2. Na seção do ebook, digite um e-mail seu e clique no botão.
3. Você será redirecionado pro checkout da InfinitePay — pague os R$ 1,00
   (Pix é o mais rápido pra testar).
4. Em alguns segundos, o e-mail com o PDF deve chegar na caixa de entrada
   (confira o spam também).

Se não chegar, veja os logs da função em **Vercel → seu projeto → Deployments
→ Functions → api/webhook** — qualquer erro aparece ali.

## Trocar o preço depois
Quando for cobrar o valor final do ebook, troque `EBOOK_PRICE_CENTS` nas
variáveis de ambiente da Vercel (em centavos, ex: `2790` para R$ 27,90) e
clique em Redeploy. Não precisa mexer no código.
