/**
 * Reporte → PDF con PDFKit (B4-09): encabezado con logo y nombre de la iglesia, filtros,
 * cifras clave, tablas con encabezado repetido en cada página y pie "Página X de Y".
 * Helvetica (fuente estándar de PDF con codificación WinAnsi) cubre acentos, ñ, ¿ y ¡.
 */
import PDFDocument from 'pdfkit';
import { type ContextoReporte, formatearCelda, type Reporte, type Seccion } from './reporte';

const MARGEN = 40;
const ALTO_FILA = 16;
const ALTO_PIE = 24;
const COLOR = {
  primario: '#1E3A8A',
  texto: '#0F172A',
  suave: '#475569',
  cebra: '#F1F5F9',
  borde: '#CBD5E1',
};

type Doc = InstanceType<typeof PDFDocument>;

const NUMERICOS = new Set(['moneda', 'numero', 'porcentaje']);

function limiteInferior(doc: Doc) {
  return doc.page.height - MARGEN - ALTO_PIE;
}

function encabezado(doc: Doc, reporte: Reporte, ctx: ContextoReporte) {
  const ancho = doc.page.width - MARGEN * 2;
  let x = MARGEN;
  if (ctx.logo) {
    try {
      doc.image(ctx.logo, MARGEN, MARGEN, { fit: [44, 44] });
      x += 54;
    } catch {
      // Logo ilegible: el reporte sigue sin él
    }
  }
  doc
    .fillColor(COLOR.suave)
    .font('Helvetica')
    .fontSize(10)
    .text(ctx.nombreIglesia, x, MARGEN, { width: ancho - (x - MARGEN) });
  doc
    .fillColor(COLOR.primario)
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(reporte.titulo, x, doc.y + 2, { width: ancho - (x - MARGEN) });
  if (reporte.subtitulo) {
    doc
      .fillColor(COLOR.texto)
      .font('Helvetica')
      .fontSize(10)
      .text(reporte.subtitulo, x, doc.y + 2, { width: ancho - (x - MARGEN) });
  }
  doc.y = Math.max(doc.y, ctx.logo ? MARGEN + 48 : doc.y) + 6;

  const filtros = reporte.filtros.map(
    (f) => `${f.etiqueta}: ${formatearCelda(f.valor, f.tipo, ctx)}`,
  );
  if (filtros.length > 0) {
    doc
      .fillColor(COLOR.suave)
      .fontSize(9)
      .text(filtros.join('   ·   '), MARGEN, doc.y, { width: ancho });
  }

  if (reporte.resumen.length > 0) {
    doc.moveDown(0.6);
    const porFila = Math.min(4, reporte.resumen.length);
    const anchoCaja = ancho / porFila;
    reporte.resumen.forEach((dato, i) => {
      if (i > 0 && i % porFila === 0) doc.y += 34;
      const cx = MARGEN + (i % porFila) * anchoCaja;
      const cy = doc.y;
      doc
        .fillColor(COLOR.suave)
        .font('Helvetica')
        .fontSize(8)
        .text(dato.etiqueta, cx, cy, {
          width: anchoCaja - 8,
          lineBreak: false,
        });
      doc
        .fillColor(COLOR.texto)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(formatearCelda(dato.valor, dato.tipo, ctx), cx, cy + 11, {
          width: anchoCaja - 8,
          lineBreak: false,
        });
      doc.y = cy;
    });
    doc.y += 34;
  }
  doc.x = MARGEN;
}

function anchosDe(doc: Doc, seccion: Seccion) {
  const ancho = doc.page.width - MARGEN * 2;
  const pesos = seccion.columnas.map((c) => c.ancho ?? 1);
  const suma = pesos.reduce((a, b) => a + b, 0);
  return pesos.map((p) => (p / suma) * ancho);
}

function fila(
  doc: Doc,
  seccion: Seccion,
  anchos: number[],
  valores: string[],
  opciones: { fondo?: string; color: string; negrita?: boolean; bordeSuperior?: boolean },
) {
  const y = doc.y;
  const ancho = doc.page.width - MARGEN * 2;
  if (opciones.fondo) doc.rect(MARGEN, y, ancho, ALTO_FILA).fill(opciones.fondo);
  if (opciones.bordeSuperior) {
    doc
      .moveTo(MARGEN, y)
      .lineTo(MARGEN + ancho, y)
      .lineWidth(0.8)
      .stroke(COLOR.borde);
  }
  doc
    .font(opciones.negrita ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(8.5)
    .fillColor(opciones.color);
  let x = MARGEN;
  seccion.columnas.forEach((col, i) => {
    const w = anchos[i] ?? 0;
    doc.text(valores[i] ?? '', x + 4, y + 4, {
      width: w - 8,
      height: ALTO_FILA - 4,
      ellipsis: true,
      lineBreak: false,
      align: NUMERICOS.has(col.tipo ?? 'texto') ? 'right' : 'left',
    });
    x += w;
  });
  doc.x = MARGEN;
  doc.y = y + ALTO_FILA;
}

function encabezadoTabla(doc: Doc, seccion: Seccion, anchos: number[]) {
  fila(
    doc,
    seccion,
    anchos,
    seccion.columnas.map((c) => c.titulo),
    { fondo: COLOR.primario, color: '#FFFFFF', negrita: true },
  );
}

function tabla(doc: Doc, seccion: Seccion, ctx: ContextoReporte) {
  const anchos = anchosDe(doc, seccion);
  if (doc.y + ALTO_FILA * 4 > limiteInferior(doc)) doc.addPage();
  doc
    .fillColor(COLOR.texto)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(seccion.titulo, MARGEN, doc.y);
  doc.y += 4;
  encabezadoTabla(doc, seccion, anchos);

  if (seccion.filas.length === 0) {
    doc
      .fillColor(COLOR.suave)
      .font('Helvetica-Oblique')
      .fontSize(9)
      .text('Sin datos para los filtros elegidos.', MARGEN + 4, doc.y + 4);
    doc.y += 8;
  }
  seccion.filas.forEach((datos, i) => {
    if (doc.y + ALTO_FILA > limiteInferior(doc)) {
      doc.addPage();
      encabezadoTabla(doc, seccion, anchos);
    }
    const valores = seccion.columnas.map((c) =>
      formatearCelda(datos[c.clave] ?? null, c.tipo, ctx),
    );
    fila(doc, seccion, anchos, valores, {
      fondo: i % 2 === 1 ? COLOR.cebra : undefined,
      color: COLOR.texto,
    });
  });
  if (seccion.totales) {
    if (doc.y + ALTO_FILA > limiteInferior(doc)) doc.addPage();
    const totales = seccion.totales;
    const valores = seccion.columnas.map((c) =>
      totales[c.clave] === undefined ? '' : formatearCelda(totales[c.clave] ?? null, c.tipo, ctx),
    );
    fila(doc, seccion, anchos, valores, { color: COLOR.texto, negrita: true, bordeSuperior: true });
  }
  doc.y += 14;
}

function pies(doc: Doc, reporte: Reporte, ctx: ContextoReporte) {
  const { start, count } = doc.bufferedPageRange();
  const generado = `Generado el ${formatearCelda(reporte.generadoEn, 'fechaHora', ctx)} por ${reporte.generadoPor}`;
  for (let i = start; i < start + count; i++) {
    doc.switchToPage(i);
    // Escribir en el margen inferior sin que PDFKit agregue una página nueva
    const margenInferior = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - MARGEN - 10;
    const ancho = doc.page.width - MARGEN * 2;
    doc.fillColor(COLOR.suave).font('Helvetica').fontSize(8);
    doc.text(generado, MARGEN, y, { width: ancho / 2, lineBreak: false });
    doc.text(`Página ${i - start + 1} de ${count}`, MARGEN + ancho / 2, y, {
      width: ancho / 2,
      align: 'right',
      lineBreak: false,
    });
    doc.page.margins.bottom = margenInferior;
  }
}

/** Genera el PDF en memoria. Horizontal si alguna tabla tiene más de 5 columnas. */
export function aPdf(reporte: Reporte, ctx: ContextoReporte): Promise<Buffer> {
  const horizontal = reporte.secciones.some((s) => s.columnas.length > 5);
  const doc = new PDFDocument({
    size: 'A4',
    layout: horizontal ? 'landscape' : 'portrait',
    margin: MARGEN,
    bufferPages: true,
    info: { Title: reporte.titulo, Author: ctx.nombreIglesia, Creator: 'AppIglesia' },
  });
  const partes: Buffer[] = [];
  const terminado = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (parte: Buffer) => partes.push(parte));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);
  });
  encabezado(doc, reporte, ctx);
  for (const seccion of reporte.secciones) tabla(doc, seccion, ctx);
  pies(doc, reporte, ctx);
  doc.end();
  return terminado;
}
