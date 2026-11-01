import { useState } from 'react';
import { FormField } from '@/components/comunes/FormField';
import { SelectorMiembros } from '@/features/miembros/components/SelectorMiembros';

/** Ejemplo de SelectorMiembros (F2-06) para F3 y F4. Requiere sesión iniciada (consulta /miembros). */
export function SelectorMiembrosDemo() {
  const [uno, setUno] = useState<string | null>(null);
  const [varios, setVarios] = useState<string[]>([]);
  return (
    <section className="flex flex-col gap-6 border-t pt-8">
      <h2 className="text-lg font-semibold">SelectorMiembros (features/miembros)</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Responsable (simple)" hint={`Valor: ${uno ?? 'ninguno'}`}>
          <SelectorMiembros valor={uno} alCambiar={setUno} />
        </FormField>
        <FormField label="Integrantes (múltiple)" hint={`Valor: [${varios.join(', ')}]`}>
          <SelectorMiembros modo="multiple" valor={varios} alCambiar={setVarios} />
        </FormField>
      </div>
    </section>
  );
}
