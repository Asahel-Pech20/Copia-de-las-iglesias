import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { parsearMarkdown } from '@/app/features/anuncios/markdown-simple';
import { db } from '@/mocks/db';
import { abrirApp, escribir, esperarA, textoPagina } from './entorno';

afterEach(() => {
  document.body.innerHTML = '';
  TestBed.resetTestingModule();
});

const botones = () => [...document.querySelectorAll<HTMLElement>('button, a')];
const conTexto = (texto: string | RegExp) =>
  botones().find((b) =>
    typeof texto === 'string' ? b.textContent?.trim() === texto : texto.test(b.textContent ?? ''),
  );

describe('calendario de eventos (F3-01)', () => {
  it('muestra los eventos del mes y una leyenda con texto e ícono (no solo color)', async () => {
    await abrirApp('/eventos', { como: 'secretario@iglesia.local' });
    await esperarA(() => textoPagina().includes('Reunión de jóvenes'));
    const leyenda = document.querySelector('ul[aria-label="Leyenda de categorías"]')!;
    for (const texto of ['Culto', 'Reunión', 'Actividad', 'Otro', 'Cancelado']) {
      expect(leyenda.textContent).toContain(texto);
    }
    expect(conTexto('Nuevo evento')).toBeDefined();
  });

  it('en móvil la vista por defecto es Lista', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('max-width: 767px'),
      media: query,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    try {
      await abrirApp('/eventos', { como: 'secretario@iglesia.local' });
      await esperarA(() => textoPagina().includes('Reunión de jóvenes'));
      expect(document.querySelector('[aria-label="Calendario mensual"]')).toBeNull();
      expect(document.querySelector('app-lista-eventos')).not.toBeNull();
    } finally {
      window.matchMedia = original;
    }
  });

  it('TESORERO solo consulta: no ve "Nuevo evento"', async () => {
    await abrirApp('/eventos', { como: 'tesorero@iglesia.local' });
    await esperarA(() => textoPagina().includes('Reunión de jóvenes'));
    expect(conTexto('Nuevo evento')).toBeUndefined();
  });
});

describe('formulario de evento (F3-02)', () => {
  it('valida título y que la hora de fin no sea anterior a la de inicio', async () => {
    const { harness } = await abrirApp('/eventos/nuevo', { como: 'secretario@iglesia.local' });
    const raiz = harness.routeNativeElement!;
    escribir(raiz.querySelector('input[formcontrolname=horaFin]'), '08:00');
    (raiz.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await esperarA(() => textoPagina().includes('Escribe el título.'));
    expect(textoPagina()).toContain('La hora de fin debe ser igual o posterior a la de inicio.');
  });

  it('precarga ?fecha= y ?ministerioId=, crea el evento y abre su detalle', async () => {
    const { harness, router } = await abrirApp(
      '/eventos/nuevo?fecha=2030-05-17&ministerioId=min-musica',
      { como: 'secretario@iglesia.local' },
    );
    const raiz = harness.routeNativeElement!;
    expect((raiz.querySelector('input[formcontrolname=fecha]') as HTMLInputElement).value).toBe(
      '2030-05-17',
    );
    escribir(raiz.querySelector('input[formcontrolname=titulo]'), 'Concierto de primavera');
    escribir(raiz.querySelector('input[formcontrolname=lugar]'), 'Explanada');
    (raiz.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await esperarA(() => /^\/eventos\/[^/]+$/.test(router.url) && router.url !== '/eventos/nuevo');
    await esperarA(() => textoPagina().includes('Concierto de primavera'));
    const creado = db.eventos.find((e) => e.titulo === 'Concierto de primavera');
    expect(creado).toMatchObject({ ministerioId: 'min-musica', creadoPorId: 'u-secretario' });
    expect(new Date(creado!.fechaInicio).getDate()).toBe(17);
  });

  it('COORDINADOR debe elegir uno de sus ministerios', async () => {
    const { harness } = await abrirApp('/eventos/nuevo', { como: 'coordinador@iglesia.local' });
    const raiz = harness.routeNativeElement!;
    escribir(raiz.querySelector('input[formcontrolname=titulo]'), 'Convivencia');
    escribir(raiz.querySelector('input[formcontrolname=lugar]'), 'Parque');
    (raiz.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await esperarA(() => textoPagina().includes('Elige uno de los ministerios que coordinas.'));
  });
});

describe('detalle del evento (F3-03, F3-04, F3-05)', () => {
  it('muestra datos, responsables, asistencia y acciones según permisos', async () => {
    await abrirApp('/eventos/ev-culto-pasado', { como: 'secretario@iglesia.local' });
    await esperarA(() => textoPagina().includes('Culto dominical'));
    expect(document.querySelector('ul[aria-label="Responsables"]')?.textContent).toContain(
      'José Chan May',
    );
    expect(textoPagina()).toContain('Presentes');
    expect(conTexto('Pasar lista')).toBeDefined();
    expect(conTexto('Editar')).toBeDefined();
  });

  it('evento cancelado muestra el motivo y oculta Editar y Pasar lista', async () => {
    await abrirApp('/eventos/ev-cancelado', { como: 'admin@iglesia.local' });
    await esperarA(() => textoPagina().includes('Convivencia de jóvenes'));
    expect(textoPagina()).toContain('Pronóstico de lluvia intensa');
    expect(conTexto('Editar')).toBeUndefined();
    expect(conTexto('Pasar lista')).toBeUndefined();
    expect(conTexto('Cancelar evento')).toBeUndefined();
  });

  it('COORDINADOR no edita eventos de otros ministerios', async () => {
    await abrirApp('/eventos/ev-ensayo', { como: 'coordinador@iglesia.local' });
    await esperarA(() => textoPagina().includes('Ensayo de alabanza'));
    expect(conTexto('Editar')).toBeUndefined();
    expect(conTexto('Pasar lista')).toBeUndefined();
  });

  it('cancelar pide motivo y el evento queda cancelado', async () => {
    await abrirApp('/eventos/ev-ensayo', { como: 'pastor@iglesia.local' });
    await esperarA(() => textoPagina().includes('Ensayo de alabanza'));
    conTexto('Cancelar evento')!.click();
    const botonDialogo = (texto: string) =>
      [...document.querySelectorAll('mat-dialog-container button')].find(
        (b) => b.textContent?.trim() === texto,
      ) as HTMLButtonElement | undefined;
    await esperarA(() => botonDialogo('Cancelar evento') !== undefined);
    const dialogo = document.querySelector('mat-dialog-container')!;
    const confirmar = botonDialogo('Cancelar evento')!;
    expect(confirmar.disabled).toBe(true);
    escribir(dialogo.querySelector('textarea'), 'Falta de músicos');
    await esperarA(() => !confirmar.disabled);
    confirmar.click();
    await esperarA(() => textoPagina().includes('Motivo: Falta de músicos'));
    expect(db.eventos.find((e) => e.id === 'ev-ensayo')?.estado).toBe('CANCELADO');
  });
});

describe('selección de evento y pase de lista (F3-06, F3-07)', () => {
  it('lista los eventos de hoy con acceso al pase de lista', async () => {
    await abrirApp('/asistencia', { como: 'secretario@iglesia.local' });
    await esperarA(() => document.querySelector('ul[aria-label="Eventos del día"]') !== null);
    const lista = document.querySelector('ul[aria-label="Eventos del día"]')!;
    expect(lista.textContent).toContain('Culto de oración');
    expect(lista.textContent).toContain('Reunión de jóvenes');
  });

  it('COORDINADOR solo ve eventos de sus ministerios', async () => {
    await abrirApp('/asistencia', { como: 'coordinador@iglesia.local' });
    await esperarA(() => document.querySelector('ul[aria-label="Eventos del día"]') !== null);
    const lista = document.querySelector('ul[aria-label="Eventos del día"]')!;
    expect(lista.textContent).toContain('Reunión de jóvenes');
    expect(lista.textContent).not.toContain('Culto de oración');
  });

  it('TESORERO no tiene acceso a asistencia', async () => {
    const { router } = await abrirApp('/asistencia', { como: 'tesorero@iglesia.local' });
    expect(router.url).toBe('/sin-acceso');
  });

  it('marca, cuenta en vivo y guarda la asistencia', async () => {
    await abrirApp('/eventos/ev-culto-hoy/asistencia', { como: 'secretario@iglesia.local' });
    await esperarA(() => textoPagina().includes('Pase de lista: Culto de oración'));
    expect(textoPagina()).toContain('0 presentes');
    const guardar = conTexto('Guardar asistencia') as HTMLButtonElement;
    expect(guardar.disabled).toBe(true);

    const presente = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Presente: José Chan May"]',
    )!;
    presente.click();
    await esperarA(() => presente.getAttribute('aria-pressed') === 'true');
    conTexto(/Marcar restantes como ausentes/)!.click();
    await esperarA(() => textoPagina().includes('7 ausentes'));
    expect(textoPagina()).toContain('1 presentes');

    guardar.click();
    await esperarA(() => db.asistencias.filter((a) => a.eventoId === 'ev-culto-hoy').length === 8);
    expect(
      db.asistencias.find((a) => a.eventoId === 'ev-culto-hoy' && a.miembroId === 'm-jose')
        ?.presente,
    ).toBe(true);
    await esperarA(() => textoPagina().includes('Todo guardado'));

    // Una marca guardada no se puede quitar (no se borraría en el servidor): solo cambiar
    const presenteJose = () =>
      document.querySelector<HTMLButtonElement>('button[aria-label="Presente: José Chan May"]')!;
    await esperarA(() => textoPagina().includes('Guardada: solo se puede cambiar'));
    presenteJose().click();
    await esperarA(() => presenteJose().getAttribute('aria-pressed') === 'true');
    expect(textoPagina()).toContain('Todo guardado');
  });

  it('evento cancelado: pantalla bloqueada con mensaje', async () => {
    await abrirApp('/eventos/ev-cancelado/asistencia', { como: 'admin@iglesia.local' });
    await esperarA(() => textoPagina().includes('Este evento está cancelado'));
    expect(conTexto('Guardar asistencia')).toBeUndefined();
  });

  it('muestra el error del servidor (evento a más de 1 día)', async () => {
    await abrirApp('/eventos/ev-junta/asistencia', { como: 'admin@iglesia.local' });
    await esperarA(() => textoPagina().includes('Pase de lista: Junta administrativa'));
    conTexto(/Marcar todos presentes/)!.click();
    await esperarA(() => !(conTexto('Guardar asistencia') as HTMLButtonElement).disabled);
    conTexto('Guardar asistencia')!.click();
    await esperarA(() =>
      textoPagina().includes('Solo se puede pasar lista desde un día antes del inicio del evento.'),
    );
  });
});

describe('historial y resumen de asistencia (F3-08, F3-09)', () => {
  it('el historial lee los filtros de la URL', async () => {
    await abrirApp('/asistencia?tab=historial&eventoId=ev-culto-pasado', {
      como: 'secretario@iglesia.local',
    });
    await esperarA(
      () => document.querySelector('table[aria-label="Historial de asistencia"]') !== null,
    );
    const filas = document.querySelectorAll(
      'table[aria-label="Historial de asistencia"] tr[mat-row], table[aria-label="Historial de asistencia"] tr.mat-mdc-row',
    );
    expect(filas).toHaveLength(5);
  });

  it('el historial vacío muestra su estado vacío', async () => {
    const { router } = await abrirApp('/', { como: 'secretario@iglesia.local' });
    db.asistencias = [];
    await router.navigateByUrl('/asistencia?tab=historial');
    await esperarA(() => textoPagina().includes('No hay asistencia registrada con estos filtros'));
  });

  it('el resumen incluye una tabla accesible equivalente a la gráfica', async () => {
    await abrirApp('/asistencia?tab=resumen', { como: 'pastor@iglesia.local' });
    await esperarA(
      () => document.querySelector('table[aria-label="Resumen de asistencia"]') !== null,
    );
    const tabla = document.querySelector('table[aria-label="Resumen de asistencia"]')!;
    expect(tabla.textContent).toContain('Promedio por evento');
    expect(textoPagina()).toContain('Exportar');
  });
});

describe('anuncios y cartelera (F3-10, F3-11, F3-13)', () => {
  it('vigentes con IMPORTANTE primero; programados y expirados en sus pestañas', async () => {
    await abrirApp('/anuncios', { como: 'secretario@iglesia.local' });
    await esperarA(() => document.querySelector('ul[aria-label="Anuncios vigentes"]') !== null);
    const lista = document.querySelector('ul[aria-label="Anuncios vigentes"]')!;
    const titulos = [...lista.querySelectorAll('h3')].map((h) => h.textContent?.trim());
    expect(titulos).toEqual(['Semana de ayuno y oración', 'Ensayo abierto de alabanza']);
    expect(lista.textContent).toContain('Importante');

    const pestana = (nombre: string) =>
      [...document.querySelectorAll<HTMLElement>('[role=tab]')].find(
        (t) => t.textContent?.trim() === nombre,
      )!;
    pestana('Programados').click();
    await esperarA(() => textoPagina().includes('Inscripciones al campamento'));
    pestana('Expirados').click();
    await esperarA(() => textoPagina().includes('Colecta de víveres'));
  });

  it('roles sin permiso no ven botones de edición', async () => {
    await abrirApp('/anuncios', { como: 'tesorero@iglesia.local' });
    await esperarA(() => document.querySelector('ul[aria-label="Anuncios vigentes"]') !== null);
    expect(conTexto('Nuevo anuncio')).toBeUndefined();
    expect(conTexto(/^Editar/)).toBeUndefined();
    expect(conTexto(/^Eliminar/)).toBeUndefined();
  });

  it('elimina con confirmación', async () => {
    await abrirApp('/anuncios', { como: 'admin@iglesia.local' });
    await esperarA(() => document.querySelector('ul[aria-label="Anuncios vigentes"]') !== null);
    document
      .querySelector<HTMLButtonElement>('button[aria-label="Eliminar Ensayo abierto de alabanza"]')!
      .click();
    const confirmar = () =>
      [...document.querySelectorAll<HTMLButtonElement>('mat-dialog-container button')].find(
        (b) => b.textContent?.trim() === 'Eliminar',
      );
    await esperarA(() => confirmar() !== undefined);
    confirmar()!.click();
    await esperarA(() => !db.anuncios.some((a) => a.id === 'an-ensayo'));
  });

  it('el markdown se convierte en datos y nunca en HTML arbitrario', () => {
    const bloques = parsearMarkdown(
      '<img src=x onerror="alert(1)"> **hola** [mal](javascript:alert(1)) [ok](https://iglesia.org)\n- uno',
    );
    expect(bloques[0]).toMatchObject({ tipo: 'parrafo' });
    const segmentos = (bloques[0] as { lineas: { tipo: string; texto: string; url?: string }[][] })
      .lineas[0]!;
    // el HTML queda como texto, la negrita se reconoce y solo se enlazan URLs http(s)
    expect(segmentos[0]!.texto).toContain('<img src=x onerror="alert(1)">');
    expect(segmentos.find((s) => s.tipo === 'negrita')?.texto).toBe('hola');
    expect(segmentos.filter((s) => s.tipo === 'enlace')).toEqual([
      { tipo: 'enlace', texto: 'ok', url: 'https://iglesia.org' },
    ]);
    expect(bloques[1]).toMatchObject({ tipo: 'lista' });
  });

  it('la cartelera es pública y muestra anuncios, eventos, horarios y acceso del personal', async () => {
    await abrirApp('/cartelera');
    await esperarA(() => textoPagina().includes('Semana de ayuno y oración'));
    expect(textoPagina()).not.toContain('Inscripciones al campamento');
    expect(textoPagina()).toContain('Ensayo de alabanza');
    expect(textoPagina()).not.toContain('Convivencia de jóvenes');
    expect(textoPagina()).toContain('Horarios de reunión');
    expect(
      [...document.querySelectorAll('a')]
        .find((a) => a.textContent?.includes('Acceso del personal'))
        ?.getAttribute('href'),
    ).toBe('/login');
  });
});
