/**
 * API Route: Geração de QR Code
 * Rota: /api/generate-qrcode?url=<URL>
 *
 * Recebe uma URL e retorna uma imagem PNG do QR Code
 */

import QRCode from 'qrcode';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório' });
  }

  try {
    // Gerar QR Code como buffer PNG
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      type: 'image/png',
      errorCorrectionLevel: 'M', // Nível médio de correção de erros
      scale: 8, // Tamanho (pixels por módulo)
      margin: 2, // Margem ao redor
    });

    // Configurar resposta como imagem
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Enviar imagem
    res.send(qrCodeBuffer);

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ error: 'Falha ao gerar QR Code' });
  }
}
