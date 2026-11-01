import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Users } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { crearQueryClient } from '@/lib/queryClient';
import { BadgeEstado } from './BadgeEstado';
import { CampoMoneda, SelectEnum } from './CamposFormulario';
import { ConfirmDialog } from './ConfirmDialog';
import { type Columna, DataTable } from './DataTable';
import { EmptyState, ErrorState, SkeletonTabla, StatCard } from './Estados';
import { CampoBusqueda, DateRangePicker } from './Filtros';
import { FormField } from './FormField';
import { PageHeader } from './PageHeader';
import { Paginacion } from './Paginacion';

interface Fila {
  id: string;
  nombre: string;
}
const FILAS: Fila[] = [
  { id: '1', nombre: 'Ana' },
  { id: '2', nombre: 'Luis' },
];
const COLUMNAS: Columna<Fila>[] = [
  { clave: 'nombre', encabezado: 'Nombre', celda: (f) => f.nombre, ordenable: true },
];

function conQuery(nodo: ReactNode) {
  return <QueryClientProvider client={crearQueryClient()}>{nodo}</QueryClientProvider>;
}

describe('PageHeader', () => {
  it('muestra título y acciones', () => {
    render(<PageHeader titulo="Miembros" acciones={<button>Nuevo</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Miembros' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  it('renderiza filas y alterna el orden', async () => {
    const alOrdenar = vi.fn();
    render(
      <DataTable
        etiqueta="Prueba"
        columnas={COLUMNAS}
        datos={FILAS}
        obtenerId={(f) => f.id}
        orden="nombre:asc"
        alOrdenar={alOrdenar}
      />,
    );
    const tabla = screen.getByRole('table', { name: 'Prueba' });
    expect(within(tabla).getByText('Luis')).toBeInTheDocument();
    expect(within(tabla).getByRole('columnheader', { name: /Nombre/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await userEvent.click(within(tabla).getByRole('button', { name: /Nombre/ }));
    expect(alOrdenar).toHaveBeenCalledWith('nombre:desc');
  });

  it('permite seleccionar todas las filas', async () => {
    function ConSeleccion() {
      const [sel, setSel] = useState<string[]>([]);
      return (
        <>
          <DataTable
            etiqueta="Prueba"
            columnas={COLUMNAS}
            datos={FILAS}
            obtenerId={(f) => f.id}
            seleccionados={sel}
            alSeleccionar={setSel}
          />
          <output>{sel.join(',')}</output>
        </>
      );
    }
    render(<ConSeleccion />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar todos' }));
    expect(screen.getByRole('status')).toHaveTextContent('1,2');
  });
});

describe('Paginacion', () => {
  it('muestra el rango y cambia de página', async () => {
    const alCambiar = vi.fn();
    render(
      <Paginacion
        meta={{ page: 1, limit: 20, total: 45, totalPages: 3 }}
        alCambiarPagina={alCambiar}
      />,
    );
    expect(screen.getByText('1–20 de 45')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(alCambiar).toHaveBeenCalledWith(2);
  });
});

describe('CampoBusqueda', () => {
  it('espera 300 ms antes de notificar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const alCambiar = vi.fn();
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CampoBusqueda valor="" alCambiar={alCambiar} placeholder="Buscar" />);
    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'ana');
    expect(alCambiar).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(alCambiar).toHaveBeenCalledOnce();
    expect(alCambiar).toHaveBeenCalledWith('ana');
    vi.useRealTimers();
  });
});

describe('estados', () => {
  it('EmptyState, ErrorState, SkeletonTabla, StatCard y BadgeEstado', async () => {
    const reintentar = vi.fn();
    render(
      <>
        <EmptyState icono={Users} titulo="Sin miembros" accion={<button>Registrar</button>} />
        <ErrorState
          error={{ status: 500, code: 'INTERNAL_ERROR', message: 'Falló' }}
          alReintentar={reintentar}
        />
        <SkeletonTabla />
        <StatCard titulo="Miembros activos" valor="120" />
        <BadgeEstado activo />
        <BadgeEstado activo={false} />
      </>,
    );
    expect(screen.getByText('Sin miembros')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(reintentar).toHaveBeenCalled();
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });
});

describe('DateRangePicker', () => {
  it('muestra el rango y permite quitarlo', async () => {
    const alCambiar = vi.fn();
    render(
      <DateRangePicker
        valor={{ desde: '2026-10-01', hasta: '2026-10-31' }}
        alCambiar={alCambiar}
      />,
    );
    expect(screen.getByText('01/10/2026 – 31/10/2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Quitar rango de fechas' }));
    expect(alCambiar).toHaveBeenCalledWith({});
  });
});

describe('useFiltrosURL', () => {
  it('lee y escribe filtros en la query string y vuelve a la página 1', async () => {
    function Ver() {
      const [filtros, setFiltros] = useFiltrosURL({ q: '', estado: 'activo', page: 1 });
      const { search } = useLocation();
      return (
        <>
          <output>{`${filtros.q}|${filtros.estado}|${filtros.page}|${search}`}</output>
          <button onClick={() => setFiltros({ q: 'ana' })}>buscar</button>
        </>
      );
    }
    render(
      <MemoryRouter initialEntries={['/?estado=inactivo&page=3']}>
        <Ver />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('|inactivo|3|?estado=inactivo&page=3');
    await userEvent.click(screen.getByRole('button', { name: 'buscar' }));
    expect(screen.getByRole('status')).toHaveTextContent('ana|inactivo|1|?estado=inactivo&q=ana');
  });
});

describe('FormField', () => {
  it('asocia label, hint y error al control', () => {
    render(
      <FormField label="Correo" hint="Usa tu correo institucional" error="Correo no válido.">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Correo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Usa tu correo institucional Correo no válido.');
  });
});

describe('SelectEnum', () => {
  it('muestra la etiqueta de la opción seleccionada', () => {
    render(
      <SelectEnum
        opciones={[{ valor: 'ADMIN', etiqueta: 'Administrador' }]}
        valor="ADMIN"
        alCambiar={() => {}}
        aria-label="Rol"
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Rol' })).toHaveTextContent('Administrador');
  });
});

describe('CampoMoneda', () => {
  it('acepta máximo 2 decimales y completa .00 al salir', async () => {
    function Monto() {
      const [v, setV] = useState('');
      return <CampoMoneda valor={v} alCambiar={setV} aria-label="Monto" />;
    }
    render(conQuery(<Monto />));
    const campo = screen.getByLabelText('Monto');
    await userEvent.type(campo, '150.555');
    expect(campo).toHaveValue('150.55');
    await userEvent.clear(campo);
    await userEvent.type(campo, '20');
    await userEvent.tab();
    expect(campo).toHaveValue('20.00');
  });
});

describe('ConfirmDialog', () => {
  it('con motivo obligatorio no permite confirmar con motivo vacío', async () => {
    const alConfirmar = vi.fn();
    render(
      <ConfirmDialog
        abierto
        alCambiarAbierto={() => {}}
        titulo="Anular donación"
        motivo="obligatorio"
        peligro
        textoConfirmar="Anular"
        alConfirmar={alConfirmar}
      />,
    );
    const confirmar = screen.getByRole('button', { name: 'Anular' });
    expect(confirmar).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Motivo/), '   ');
    expect(confirmar).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Motivo/), 'Registro duplicado');
    await userEvent.click(confirmar);
    expect(alConfirmar).toHaveBeenCalledWith('Registro duplicado');
  });

  it('si la acción falla, muestra el error y sigue abierto', async () => {
    const alCambiarAbierto = vi.fn();
    render(
      <ConfirmDialog
        abierto
        alCambiarAbierto={alCambiarAbierto}
        titulo="Desactivar"
        alConfirmar={() =>
          Promise.reject({ status: 422, code: 'BUSINESS_RULE', message: 'Regla de negocio.' })
        }
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Regla de negocio.');
    expect(alCambiarAbierto).not.toHaveBeenCalledWith(false);
  });
});
