import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

export interface Correo {
  para: string;
  asunto: string;
  texto: string;
  html: string;
}

/** En pruebas los correos no se envían: se guardan aquí para verificarlos. */
export const correosEnviados: Correo[] = [];

// En desarrollo apunta a Mailpit (docker compose): http://localhost:8025
const transporte =
  env.NODE_ENV === 'test'
    ? null
    : nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: false });

export async function enviarCorreo(correo: Correo) {
  if (!transporte) {
    correosEnviados.push(correo);
    return;
  }
  try {
    await transporte.sendMail({
      from: env.SMTP_FROM,
      to: correo.para,
      subject: correo.asunto,
      text: correo.texto,
      html: correo.html,
    });
  } catch (err) {
    // No se revela al usuario (forgot-password responde 204 siempre); queda en el log
    logger.error({ err, asunto: correo.asunto }, 'No se pudo enviar el correo');
  }
}

function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Plantilla simple con un botón de enlace. */
export function plantillaEnlace(opciones: {
  saludo: string;
  mensaje: string;
  textoBoton: string;
  enlace: string;
  pie: string;
}): Pick<Correo, 'texto' | 'html'> {
  const { saludo, mensaje, textoBoton, enlace, pie } = opciones;
  return {
    texto: `${saludo}\n\n${mensaje}\n\n${textoBoton}: ${enlace}\n\n${pie}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;color:#0f172a">
  <p>${escaparHtml(saludo)}</p>
  <p>${escaparHtml(mensaje)}</p>
  <p><a href="${escaparHtml(enlace)}" style="display:inline-block;background:#1e3a8a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">${escaparHtml(textoBoton)}</a></p>
  <p style="color:#475569;font-size:13px">${escaparHtml(pie)}</p>
</div>`,
  };
}
