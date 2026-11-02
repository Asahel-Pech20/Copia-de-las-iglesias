/**
 * Reporte → Excel con ExcelJS (B4-09): una hoja por tabla, encabezado en negrita, anchos
 * automáticos, fechas y montos como valores reales (se pueden ordenar y sumar en Excel)
 * y fila de totales.
 */
import ExcelJS from 'exceljs';
import {
  type Celda,
  type Columna,
  type ContextoReporte,
  formatearCelda,
  type Reporte,
} from './reporte';

const AZUL = 'FF1E3A8A';
const INVALIDOS_HOJA = /[\\/?*[\]:]/g;

function valorExcel(valor: Celda, col: Columna): ExcelJS.CellValue {
  if (valor === null || valor === '') return null;
  switch (col.tipo) {
    case 'fecha':
      return new Date(`${String(valor).slice(0, 10)}T00:00:00.000Z`);
    case 'fechaHora':
      return new Date(valor);
    case 'moneda':
    case 'numero':
      return Number(valor);
    case 'porcentaje':
      return Number(valor) / 100;
    default:
      return String(valor);
  }
}

function formatoNumero(col: Columna) {
  switch (col.tipo) {
    case 'fecha':
      return 'dd/mm/yyyy';
    case 'fechaHora':
      return 'dd/mm/yyyy hh:mm';
    case 'moneda':
      return '#,##0.00';
    case 'numero':
      return '#,##0';
    case 'porcentaje':
      return '0.0%';
    default:
      return undefined;
  }
}

/** Nombre de hoja válido y único (máx. 31 caracteres, sin \ / ? * [ ] :). */
function nombreHoja(titulo: string, usados: Set<string>) {
  const base =
    titulo.replace(INVALIDOS_HOJA, ' ').replace(/\s+/g, ' ').trim().slice(0, 28) || 'Hoja';
  let nombre = base;
  for (let i = 2; usados.has(nombre.toLowerCase()); i++) nombre = `${base} ${i}`;
  usados.add(nombre.toLowerCase());
  return nombre;
}

export async function aExcel(reporte: Reporte, ctx: ContextoReporte): Promise<Buffer> {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'AppIglesia';
  libro.title = reporte.titulo;
  libro.created = new Date(reporte.generadoEn);
  const usados = new Set<string>();

  for (const seccion of reporte.secciones) {
    const hoja = libro.addWorksheet(nombreHoja(seccion.titulo, usados));
    const columnas = seccion.columnas.length;

    hoja.addRow([`${ctx.nombreIglesia} — ${reporte.titulo}`]).font = { bold: true, size: 14 };
    if (reporte.subtitulo) hoja.addRow([reporte.subtitulo]);
    const filtros = reporte.filtros.map(
      (f) => `${f.etiqueta}: ${formatearCelda(f.valor, f.tipo, ctx)}`,
    );
    if (filtros.length > 0) hoja.addRow([filtros.join(' · ')]);
    for (const dato of reporte.resumen) {
      hoja.addRow([dato.etiqueta, formatearCelda(dato.valor, dato.tipo, ctx)]);
    }
    hoja.addRow([
      `Generado el ${formatearCelda(reporte.generadoEn, 'fechaHora', ctx)} por ${reporte.generadoPor}`,
    ]).font = { italic: true, color: { argb: 'FF475569' } };
    hoja.addRow([]);

    const titulos = seccion.columnas.map((c) =>
      c.tipo === 'moneda' ? `${c.titulo} (${ctx.moneda})` : c.titulo,
    );
    const encabezado = hoja.addRow(titulos);
    encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezado.eachCell((celda) => {
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    });
    hoja.views = [{ state: 'frozen', ySplit: encabezado.number }];

    for (const datos of seccion.filas) {
      hoja.addRow(seccion.columnas.map((c) => valorExcel(datos[c.clave] ?? null, c)));
    }
    if (seccion.totales) {
      const totales = seccion.totales;
      const filaTotales = hoja.addRow(
        seccion.columnas.map((c) => valorExcel(totales[c.clave] ?? null, c)),
      );
      filaTotales.font = { bold: true };
      filaTotales.eachCell((celda) => {
        celda.border = { top: { style: 'thin' } };
      });
    }

    // Formatos por columna y ancho automático (8–50 caracteres)
    seccion.columnas.forEach((col, i) => {
      const columna = hoja.getColumn(i + 1);
      const formato = formatoNumero(col);
      if (formato) {
        columna.eachCell((celda, numFila) => {
          if (numFila > encabezado.number) celda.numFmt = formato;
        });
      }
      const largos = [
        titulos[i]?.length ?? 0,
        ...seccion.filas.map((f) => formatearCelda(f[col.clave] ?? null, col.tipo, ctx).length),
      ];
      columna.width = Math.min(50, Math.max(8, ...largos) + 2);
    });
    if (columnas > 0)
      hoja.autoFilter = {
        from: { row: encabezado.number, column: 1 },
        to: { row: encabezado.number, column: columnas },
      };
  }

  return Buffer.from(await libro.xlsx.writeBuffer());
}
