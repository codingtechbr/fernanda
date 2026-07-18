// api/verify-payment.js
// Confere junto à InfinitePay se o pagamento referente aos parâmetros
// recebidos foi realmente aprovado, antes de liberar o download do ebook.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { order_nsu: orderNsu, transaction_nsu: transactionNsu, slug } = req.body || {};
    const handle = process.env.INFINITEPAY_HANDLE;

    if (!orderNsu) {
      return res.status(400).json({ paid: false, error: 'order_nsu ausente' });
    }

    const response = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        order_nsu: orderNsu,
        transaction_nsu: transactionNsu,
        slug,
      }),
    });

    const data = await response.json();
    console.log('payment_check resposta:', data);

    if (!response.ok || !data.paid) {
      return res.status(200).json({ paid: false });
    }

    return res.status(200).json({ paid: true });
  } catch (err) {
    console.error('Erro em verify-payment:', err);
    return res.status(500).json({ paid: false, error: 'Erro interno' });
  }
}
