// api/webhook.js
// Recebe a notificação de pagamento da InfinitePay e envia o ebook
// por e-mail para o comprador (o e-mail vem embutido no order_nsu).
//
// Variáveis de ambiente necessárias:
//   RESEND_API_KEY       -> chave de API da Resend (resend.com)
//   RESEND_FROM          -> remetente, ex: "Fernanda Meyrelly <ebook@seudominio.com>"
//   EBOOK_PRICE_CENTS     -> mesmo valor usado no create-checkout.js, para validar o valor pago

import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  try {
    const payload = req.body;
    console.log('Webhook recebido:', payload);

    const {
      order_nsu: orderNsu,
      paid_amount: paidAmount,
      amount,
      capture_method: captureMethod,
    } = payload || {};

    if (!orderNsu) {
      // Responde 200 mesmo assim para não gerar retentativas em eventos
      // que não reconhecemos, mas não faz nada.
      return res.status(200).send('ok');
    }

    // Validação básica do valor pago, pra evitar chamadas forjadas.
    const expected = parseInt(process.env.EBOOK_PRICE_CENTS || '100', 10);
    const valuePaid = paidAmount ?? amount;
    if (valuePaid && valuePaid < expected) {
      console.warn('Valor pago menor que o esperado, ignorando.', valuePaid);
      return res.status(200).send('ok');
    }

    // Decodifica o e-mail do comprador a partir do order_nsu.
    let email;
    try {
      email = Buffer.from(orderNsu, 'base64url').toString('utf-8');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('inválido');
    } catch {
      console.error('order_nsu não é um e-mail válido:', orderNsu);
      return res.status(200).send('ok');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const pdfPath = path.join(process.cwd(), 'api', 'assets', 'EBOOK_NANDA.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: 'Seu Ebook — Time de Resultados 📖',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
          <h2 style="color:#7A3348;">Obrigada pela sua compra! 🎉</h2>
          <p>Seu ebook <strong>Time de Resultados</strong> está em anexo neste e-mail.</p>
          <p>Pagamento confirmado via ${captureMethod === 'pix' ? 'Pix' : 'cartão'}.</p>
          <p>Qualquer dúvida, é só responder este e-mail.</p>
          <p style="margin-top:24px;color:#888;font-size:13px;">Fernanda Meyrelly — Gestão e Liderança</p>
        </div>
      `,
      attachments: [
        {
          filename: 'Time-de-Resultados.pdf',
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Erro no webhook:', err);
    // Retorna 200 para evitar reenvios em loop; o erro já foi logado.
    return res.status(200).send('erro registrado');
  }
}
