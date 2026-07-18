// api/create-checkout.js
// Gera um link de pagamento InfinitePay para o Ebook, "carimbando" o e-mail
// do comprador dentro do order_nsu (sem precisar de banco de dados).
//
// Variáveis de ambiente necessárias (configurar no painel da Vercel):
//   INFINITEPAY_HANDLE  -> sua InfiniteTag, ex: "codingtech" (sem o $)
//   SITE_URL            -> URL pública do site depois de publicado,
//                           ex: "https://seusite.vercel.app"
//   EBOOK_PRICE_CENTS    -> preço em centavos, ex: "100" para R$ 1,00

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    const handle = process.env.INFINITEPAY_HANDLE;
    const siteUrl = process.env.SITE_URL;
    const priceCents = parseInt(process.env.EBOOK_PRICE_CENTS || '100', 10);

    if (!handle || !siteUrl) {
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    // Guarda o e-mail dentro do próprio order_nsu (base64url), sem precisar de banco.
    const orderNsu = Buffer.from(email).toString('base64url');

    const response = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        order_nsu: orderNsu,
        redirect_url: `${siteUrl}/download.html`,
        webhook_url: `${siteUrl}/api/webhook`,
        items: [
          {
            quantity: 1,
            price: priceCents,
            description: 'Ebook Time de Resultados',
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      console.error('Erro InfinitePay:', data);
      return res.status(502).json({ error: 'Não foi possível gerar o link de pagamento' });
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
