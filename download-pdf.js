// api/download-pdf.js
// Confere o pagamento de novo (segurança) e, se aprovado, envia o PDF
// como download direto pro navegador do comprador.

import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  try {
    const { order_nsu: orderNsu, transaction_nsu: transactionNsu, slug } = req.query;
    const handle = process.env.INFINITEPAY_HANDLE;

    if (!orderNsu) {
      return res.status(400).send('Parâmetros ausentes.');
    }

    const checkResp = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
    });
    const checkData = await checkResp.json();

    if (!checkResp.ok || !checkData.paid) {
      return res.status(402).send('Pagamento não confirmado.');
    }

    const pdfPath = path.join(process.cwd(), 'api', 'assets', 'EBOOK_NANDA.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Time-de-Resultados.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('Erro em download-pdf:', err);
    return res.status(500).send('Erro interno.');
  }
}
