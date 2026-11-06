# Requerimientos — Proyecto Ecclesia (Sistema Nacional de Gestión de Iglesias)

> **Cliente:** Coordinación Nacional de Templos (caso del 30 de octubre de 2026). **Fase 1:** análisis del caso y arnés.
> **Equipo:** Santiago Asahel Pech Ake · Nataly Marisol Santos Miam · Genaro Aurelio Antonio Pacheco · Oscar Michel Matos May (líder).
> **Herramienta de IA:** Claude Code (una sola en todo el proyecto). Arnés: carpeta [`arnes-ia/`](../arnes-ia/README.md).

## Cómo se llena este documento (léelo antes de escribir)

1. Cada integrante escribe **solo su sección** (ver tabla) y usa **solo su rango de IDs**, así nada choca al juntar.
2. Todo requerimiento lleva **origen**: una cita textual del caso entre «comillas» y el apartado de donde sale. **Sin origen, se descarta.**
3. Redacción **verificable**: quién hace qué y qué se ve. ✅ «El visitante elige un estado y ve la lista de sus iglesias activas». ❌ «El sistema debe ser fácil».
4. **Prioridad**: `Obligatorio` o `Deseable` (deseable = lo que el cliente pide «si alcanza el tiempo»).
5. Lo ambiguo **no se inventa**: va como pregunta en la sección 8 con tu rango `P-`.
6. Al terminar, marca en la lista de «párrafos a cubrir» de tu sección cuáles quedaron cubiertos y con qué IDs.

| Integrante | Apartados del caso | RF | RN | CA | P |
|---|---|---|---|---|---|
| Nataly | Las iglesias · El patrimonio · Las iglesias más reconocidas | RF-01–29 | RN-01–19 | CA-01–09 | P-01–09 |
| Genaro | Los servicios y las pláticas · Las misas y los padres | RF-30–59 | RN-20–39 | CA-10–19 | P-10–19 |
| Oscar | El diezmo · Las criptas y otros espacios · Quién usará el sistema · Si alcanza el tiempo | RF-60–89 | RN-40–59 | CA-20–29 | P-20–29 |
| Santiago | Quiénes somos y qué nos pasa · requerimientos no funcionales · integración | — | — | — | P-30–39 (RNF-01–20) |

---

## 1. Actores y sus objetivos

| Actor | Quién es | Qué quiere lograr | Origen |
|---|---|---|---|
| Visitante | Cualquier persona, sin cuenta, casi siempre desde el celular | Consultar iglesias, servicios, pláticas, misas e iglesias reconocidas | «Cualquier persona podrá consultar iglesias, servicios, pláticas, misas e iglesias reconocidas sin crear una cuenta, casi siempre desde el celular» (Quién usará el sistema) |
| Investigador | Visitante que busca por patrimonio | Buscar iglesias por tipo de objeto y antigüedad en un estado, municipio o ciudad | «Los investigadores también nos piden búsquedas como "todas las iglesias de Puebla con imágenes de 300 años o más"» (Las iglesias más reconocidas) |
| Solicitante de espacio | Visitante que pide una cripta, nicho, columbario u osario | Pedir un espacio sin crear cuenta, dar seguimiento con folio y clave, aceptar o rechazar la cotización | «Quien necesita un espacio llena una solicitud con sus datos de contacto, sin crear una cuenta, y recibe un folio y una clave» (Las criptas y otros espacios) |
| Personal de la Coordinación | Usuario de la Coordinación Nacional de Templos | Administrar catálogos, iglesias, usuarios y los criterios del índice | «El personal de la Coordinación administrará los catálogos, las iglesias, los usuarios y los criterios del índice» (Quién usará el sistema) |
| Administrador de iglesia | Usuario asignado a una iglesia | Llevar datos, objetos, servicios, pláticas, padres, horarios, misas y solicitudes de **su** iglesia | «En cada iglesia habrá un administrador que lleve sus datos, objetos, servicios, pláticas, padres, horarios, misas y solicitudes» (Quién usará el sistema) |
| Tesorero de iglesia | Usuario asignado a una iglesia | Capturar y corregir el diezmo de cada misa de **su** iglesia y ver sus reportes | «y un tesorero que capture el diezmo» (Quién usará el sistema) |

> Oscar: revisa esta tabla al cubrir «Quién usará el sistema» y agrega lo que falte.

---

## 2. Requerimientos funcionales

Formato de cada fila: `| ID | Requerimiento | Prioridad | Origen |`

### 2.1 Iglesias, patrimonio e iglesias reconocidas — **Nataly** (RF-01–29)

Párrafos a cubrir:
- [ ] «la persona elige su estado y quiere ver todas las iglesias que hay en él» (Las iglesias)
- [ ] «puede acotar por municipio, ciudad, tipo, nombre o capacidad» (Las iglesias)
- [ ] «al elegir una iglesia espera encontrar en un solo lugar todo lo que sabemos de ella» (Las iglesias)
- [ ] Datos de la iglesia: nombre, tipo, dirección, localidad, municipio, estado (catálogo INEGI), capacidad, año, contacto, coordenadas (Las iglesias)
- [ ] Iglesia cerrada: conserva su historia pero no aparece en consultas (Las iglesias)
- [ ] Objetos: qué es, tipo, año o siglo, material, estado de conservación, ubicación en el templo, catalogado por INAH (El patrimonio)
- [ ] Objeto perdido, prestado o dado de baja: deja de contar, no se borra (El patrimonio)
- [ ] Índice de valor patrimonial y distinción junto a cada iglesia (Las iglesias más reconocidas)
- [ ] Ranking nacional, por estado, municipio y ciudad, sin cerradas ni iglesias sin objetos (Las iglesias más reconocidas)
- [ ] Criterios del índice ajustables sin reprogramar (Las iglesias más reconocidas)
- [ ] Búsqueda por tipo de objeto y antigüedad en un estado, municipio o ciudad (Las iglesias más reconocidas)

| ID | Requerimiento | Prioridad | Origen |
|---|---|---|---|
| RF-01 | El visitante elige un estado y ve la lista de sus iglesias activas. | Obligatorio | «la persona elige su estado y quiere ver todas las iglesias que hay en él» (Las iglesias) |
| RF-02 | _…_ | | |

### 2.2 Servicios, pláticas, misas y padres — **Genaro** (RF-30–59)

Párrafos a cubrir:
- [ ] Servicios de cada iglesia (bautizo, primera comunión, confirmación, casamiento y otros): costo o gratuito/donativo, requisitos, duración, si requiere cita, días y horarios (Los servicios y las pláticas)
- [ ] Pláticas de preparación: días, hora, número de sesiones, costo, cupo, lugar y quién la imparte (Los servicios y las pláticas)
- [ ] «¿cuándo son las pláticas de bautizo?» como consulta frecuente (Los servicios y las pláticas)
- [ ] Horario semanal de misas: días, hora, tipo (diaria, dominical, especial) e idioma (Las misas y los padres)
- [ ] Padre que oficia cada misa (Las misas y los padres)
- [ ] Un padre en varias iglesias; sin dos misas a la misma hora en templos distintos; una hora por misa salvo otra duración (Las misas y los padres)
- [ ] Agenda semanal de cada padre (Las misas y los padres)
- [ ] Misa celebrada como hecho: quién la dio realmente, quién hizo el cambio y por qué (Las misas y los padres)
- [ ] Hora local de cada iglesia (varias zonas horarias) (Las misas y los padres)

| ID | Requerimiento | Prioridad | Origen |
|---|---|---|---|
| RF-30 | _…_ | | |

### 2.3 Diezmo, espacios, usuarios y deseables — **Oscar** (RF-60–89)

Párrafos a cubrir:
- [ ] El tesorero captura el diezmo de cada misa ya celebrada, una sola vez por misa (El diezmo)
- [ ] Corrección con registro de quién, cuándo y cantidad anterior (El diezmo)
- [ ] Reportes: total del periodo, promedio por misa, misas con más y con menos; por día, semana, mes, horario y padre; solo personal de la iglesia (El diezmo)
- [ ] Tipos de espacio visibles al público, sin precios (Las criptas y otros espacios)
- [ ] Solicitud sin cuenta con folio y clave; revisión del administrador; cotización o aviso de que no hay lugar (Las criptas y otros espacios)
- [ ] Aceptar o rechazar; vigencia de 15 días; cancelar mientras no acepte; datos privados (Las criptas y otros espacios)
- [ ] Roles y alcance por iglesia: nadie modifica la información de otra iglesia (Quién usará el sistema)
- [ ] Deseables: pláticas por municipio, misas semanales generadas desde el horario, comparar diezmo entre iglesias (solo Coordinación), inventario de criptas (Si alcanza el tiempo)

| ID | Requerimiento | Prioridad | Origen |
|---|---|---|---|
| RF-60 | _…_ | | |

---

## 3. Requerimientos no funcionales — **Santiago** (RNF-01–20)

| ID | Requerimiento | Prioridad | Origen |
|---|---|---|---|
| RNF-01 | Las consultas públicas (iglesias, servicios, pláticas, misas e iglesias reconocidas) funcionan sin iniciar sesión. | Obligatorio | «que cualquiera pueda consultar» (Quiénes somos) · «sin crear una cuenta» (Quién usará el sistema) |
| RNF-02 | Las pantallas públicas se usan sin desplazamiento horizontal en un celular de 360 px de ancho. | Obligatorio | «casi siempre desde el celular» (Quién usará el sistema) |
| RNF-03 | Un cambio guardado por el personal se ve en las consultas públicas en la siguiente consulta, sin procesos manuales. | Obligatorio | «Queremos un sistema en línea, siempre al día» (Quiénes somos) |
| RNF-04 | Las consultas de iglesias de un estado responden en menos de 2 segundos con los datos de prueba. | Obligatorio | «tardamos días en responder» (Quiénes somos) — *umbral por confirmar (P-30)* |
| RNF-05 | Estados, municipios y localidades se cargan del catálogo oficial del INEGI y solo se aceptan valores de ese catálogo. | Obligatorio | «deben coincidir con el catálogo oficial del INEGI» (Las iglesias) |
| RNF-06 | Los montos de dinero (diezmo, costos, cotizaciones) se guardan y suman como decimales exactos de 2 cifras; nunca con punto flotante. | Obligatorio | «Son cuentas de dinero: no aceptamos diferencias de centavos» (El diezmo) |
| RNF-07 | La hora de cada misa se guarda y se muestra en la hora local de la zona horaria de su iglesia. | Obligatorio | «la hora de cada misa es la hora local de su iglesia» (Las misas y los padres) |
| RNF-08 | Los datos de contacto de un solicitante de espacio solo los ve el personal de la iglesia a la que hizo la solicitud. | Obligatorio | «Sus datos son privados: solo los ve el personal de esa iglesia» (Las criptas) |
| RNF-09 | Los reportes de diezmo solo los ven el administrador y el tesorero de esa iglesia. | Obligatorio | «Esos reportes son solo para el personal de cada iglesia» (El diezmo) |
| RNF-10 | Un usuario de una iglesia no puede crear, modificar ni borrar datos de otra iglesia; el servidor lo rechaza aunque la petición se arme a mano. | Obligatorio | «Nadie de una iglesia debe poder modificar la información de otra» (Quién usará el sistema) |
| RNF-11 | Iglesias cerradas y objetos dados de baja no se borran físicamente; quedan con su fecha y motivo. | Obligatorio | «No queremos perder su historia» (Las iglesias) · «su registro no se borra» (El patrimonio) |
| RNF-12 | Cada corrección de diezmo y cada sustitución de padre guarda quién la hizo y cuándo, y no se puede editar ese historial. | Obligatorio | «debe quedar quién lo cambió, cuándo y qué cantidad había antes» (El diezmo) · «quién hizo el cambio y por qué» (Las misas) |
| RNF-13 | Los criterios del índice (rangos de edad, multiplicadores, puntos INAH y umbrales de distinción) se guardan como datos y se cambian sin desplegar código. | Obligatorio | «queremos ajustarlos sin tener que reprogramar el sistema» (Las iglesias más reconocidas) |
| RNF-14 | El folio y la clave de una solicitud no se pueden adivinar: la clave es aleatoria y el sistema solo muestra la solicitud con folio y clave correctos. | Obligatorio | «recibe un folio y una clave para darle seguimiento» (Las criptas) · «Sus datos son privados» |
| RNF-15 | Las contraseñas se guardan con bcrypt o argon2, los tokens de sesión expiran y los secretos viven en un `.env` fuera del repositorio. | Obligatorio | Lineamientos técnicos del curso |
| RNF-16 | La API se versiona en `/api/v1`, responde JSON, pagina los listados, documenta todo en OpenAPI y usa un solo formato de error (código, mensaje y detalles). | Obligatorio | Lineamientos técnicos del curso |
| RNF-17 | Toda entrada se valida con esquemas (Zod) antes de llegar a la lógica de negocio. | Obligatorio | Lineamientos técnicos del curso |
| RNF-18 | Cada regla de negocio tiene al menos una prueba; cobertura mínima de 70 % en dominio y servicios. | Obligatorio | Lineamientos técnicos del curso |
| RNF-19 | La arquitectura se hace cumplir con reglas de dependencias (dependency-cruiser) que corren en el pre-commit y en el CI. | Obligatorio | Lineamientos técnicos del curso |
| RNF-20 | El README permite levantar el sistema con datos de prueba en menos de 10 minutos. | Obligatorio | Lineamientos técnicos del curso |

---

## 4. Reglas de negocio

Formato: `| ID | Regla | Prioridad | Origen |`. Cada quien en su rango (Nataly RN-01–19 · Genaro RN-20–39 · Oscar RN-40–59).

Ejemplos ya listos para Nataly (índice patrimonial, apartado «Las iglesias más reconocidas»):

| ID | Regla | Prioridad | Origen |
|---|---|---|---|
| RN-01 | Puntos por antigüedad del objeto: < 50 años = 1; 50–99 = 2; 100–199 = 4; 200–299 = 7; ≥ 300 = 10. | Obligatorio | «Con menos de 50 años vale 1 punto; de 50 a 99, 2 puntos…» |
| RN-02 | Si solo se conoce el siglo, el año es la mitad del siglo («siglo XVIII» = 1750). | Obligatorio | «"siglo XVIII" cuenta como 1750» (El patrimonio) |
| RN-03 | Multiplicador por tipo: imágenes de santos, vírgenes y cristos ×1.5; retablos, pinturas y murales ×1.3; órganos y pianos ×1.2; orfebrería, mobiliario litúrgico y documentos ×1; otra pieza ×0.8. | Obligatorio | «Ese puntaje se multiplica según el tipo de objeto…» |
| RN-04 | Un objeto catalogado por el INAH suma 5 puntos después de multiplicar. | Obligatorio | «Si el objeto está catalogado por el INAH, se le suman 5 puntos» |
| RN-05 | El índice de la iglesia es la suma de sus objetos vigentes (no perdidos, prestados ni dados de baja). | Obligatorio | «El índice de una iglesia es la suma de sus objetos vigentes» |
| RN-06 | Distinción: ≥ 40 Patrimonio sobresaliente; 20 a < 40 Alto valor patrimonial; 8 a < 20 Valor patrimonial; < 8 sin distinción. | Obligatorio | «con 40 puntos o más, Patrimonio sobresaliente…» |

> Nataly: confirma en P- si la antigüedad se calcula contra el año actual o contra un año fijo de cálculo (el ejemplo dice «calculado en 2026»).

---

## 5. Criterios de aceptación de los flujos principales

Formato: **CA-xx · Flujo** — Dado … / Cuando … / Entonces … · Requerimientos: RF/RN.

**CA-01 · Índice patrimonial del ejemplo del cliente** (Nataly completa el desglose)
- **Dado** una parroquia con: imagen de San Miguel Arcángel de 1720 catalogada por el INAH; retablo lateral del siglo XVIII; par de candelabros de plata de 1890; piano vertical de 1950, calculado en 2026,
- **Cuando** el sistema calcula su índice,
- **Entonces** el índice es **35.5** y la distinción es **Alto valor patrimonial**. · RN-01–RN-06

---

## 6. Glosario

| Término | Significado | Origen |
|---|---|---|
| Índice de valor patrimonial | Puntaje de una iglesia: suma de los puntos de sus objetos vigentes (RN-01–RN-05) | Las iglesias más reconocidas |
| Objeto vigente | Objeto que no está perdido, prestado ni dado de baja | El patrimonio |
| _…_ | Cada quien agrega los términos de sus apartados | |

---

## 7. Diagrama de estados de la solicitud de espacio (Oscar)

Pendiente: estados y transiciones de la solicitud (recibida, cotizada, sin lugar, aceptada, rechazada, vencida, cancelada…), con quién provoca cada cambio. Se dibuja en `docs/` cuando estén validados.

---

## 8. Preguntas al cliente y respuestas

| ID | Pregunta | Respuesta del cliente | Apartado |
|---|---|---|---|
| P-30 | ¿Qué tiempo de respuesta es aceptable para una consulta pública? (RNF-04 propone 2 s) | _pendiente_ | Quiénes somos |
| P-31 | ¿La consulta pública debe funcionar también sin conexión o con datos móviles lentos? | _pendiente_ | Quién usará el sistema |
| P-32 | ¿Cuánto tiempo deben conservarse los datos de los solicitantes de espacio después de cerrada la solicitud? | _pendiente_ | Las criptas |

---

## 9. Matriz de trazabilidad

| Requerimiento | Párrafo del caso | Código | Prueba |
|---|---|---|---|
| RF-01 | Las iglesias, párrafo 2 | _por implementar_ | _por implementar_ |
| RN-01 – RN-06, CA-01 | Las iglesias más reconocidas, párrafos 2–4 | _por implementar_ | _por implementar_ |

> Santiago completa la matriz al juntar las secciones: una fila por requerimiento, y cada párrafo del caso con al menos un requerimiento.
