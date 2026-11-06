# Requerimientos — Proyecto Ecclesia (Sistema Nacional de Gestión de Iglesias)

> **Cliente:** Coordinación Nacional de Templos (caso del 30 de octubre de 2026). **Fase 1:** análisis del caso y arnés.
> **Equipo:** Santiago Asahel Pech Ake · Nataly Marisol Santos Miam · Genaro Aurelio Antonio Pacheco · Oscar Michel Matos May (líder).
> **Caso del cliente (fuente de todas las citas):** [Proyecto_Ecclesia_Sistema_Nacional_de_Gestion_de_Iglesias.docx](ecclesia/Proyecto_Ecclesia_Sistema_Nacional_de_Gestion_de_Iglesias.docx).
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
- [x] «la persona elige su estado y quiere ver todas las iglesias que hay en él» (Las iglesias) → RF-01, CA-02
- [x] «puede acotar por municipio, ciudad, tipo, nombre o capacidad» (Las iglesias) → RF-02–RF-05, CA-03, P-02, P-03
- [x] «al elegir una iglesia espera encontrar en un solo lugar todo lo que sabemos de ella» (Las iglesias) → RF-06, RF-16, CA-04
- [x] Datos de la iglesia: nombre, tipo, dirección, localidad, municipio, estado (catálogo INEGI), capacidad, año, contacto, coordenadas (Las iglesias) → RF-07–RF-10, RN-08, RN-09, CA-09
- [x] Iglesia cerrada: conserva su historia pero no aparece en consultas (Las iglesias) → RF-11, RF-12, RN-07, P-04
- [x] Objetos: qué es, tipo, año o siglo, material, estado de conservación, ubicación en el templo, catalogado por INAH (El patrimonio) → RF-13, RF-14, RF-17, RN-10, RN-16, P-05, P-06
- [x] Objeto perdido, prestado o dado de baja: deja de contar, no se borra (El patrimonio) → RF-15, RN-11, CA-05, P-08
- [x] Índice de valor patrimonial y distinción junto a cada iglesia (Las iglesias más reconocidas) → RF-18, RN-01–RN-06, RN-15, CA-01, P-01
- [x] Ranking nacional, por estado, municipio y ciudad, sin cerradas ni iglesias sin objetos (Las iglesias más reconocidas) → RF-19–RF-21, RN-12, RN-13, CA-06, P-07
- [x] Criterios del índice ajustables sin reprogramar (Las iglesias más reconocidas) → RF-22, RN-14, CA-07
- [x] Búsqueda por tipo de objeto y antigüedad en un estado, municipio o ciudad (Las iglesias más reconocidas) → RF-23, CA-08, P-09

| ID | Requerimiento | Prioridad | Origen |
|---|---|---|---|
| RF-01 | El visitante elige un estado y ve la lista de sus iglesias activas. | Obligatorio | «la persona elige su estado y quiere ver todas las iglesias que hay en él» (Las iglesias) |
| RF-02 | El visitante acota la lista del estado por municipio y por ciudad o localidad. | Obligatorio | «Después puede acotar por municipio, ciudad, tipo, nombre o capacidad» (Las iglesias) |
| RF-03 | El visitante acota la lista por tipo de iglesia (catedral, basílica, parroquia, templo, capilla o santuario). | Obligatorio | «puede acotar por municipio, ciudad, tipo, nombre o capacidad» · «si es catedral, basílica, parroquia, templo, capilla o santuario» (Las iglesias) |
| RF-04 | El visitante busca iglesias por su nombre dentro de la lista. *(Forma de coincidencia: P-02)* | Obligatorio | «puede acotar por municipio, ciudad, tipo, nombre o capacidad» (Las iglesias) |
| RF-05 | El visitante acota la lista por capacidad (cuántas personas caben). *(Mínimo o rango: P-03)* | Obligatorio | «puede acotar por municipio, ciudad, tipo, nombre o capacidad» · «cuántas personas caben» (Las iglesias) |
| RF-06 | Al elegir una iglesia, el visitante ve su ficha en una sola pantalla: sus datos, sus objetos vigentes, su índice y distinción, y lo que registran los otros módulos de esa iglesia (servicios, pláticas, misas con su padre y tipos de espacio). | Obligatorio | «al elegir una iglesia espera encontrar en un solo lugar todo lo que sabemos de ella» (Las iglesias) |
| RF-07 | El personal de la Coordinación registra una iglesia con nombre, tipo, dirección, ciudad o localidad, municipio, estado, capacidad, año de construcción, contacto y, si las tiene, coordenadas. | Obligatorio | «De cada iglesia necesitamos su nombre, si es catedral, basílica, parroquia, templo, capilla o santuario, y dónde está: dirección, ciudad o localidad, municipio y estado» · «cuántas personas caben, en qué año se construyó, cómo contactarla y, cuando las tenemos, sus coordenadas» (Las iglesias) · «El personal de la Coordinación administrará los catálogos, las iglesias» (Quién usará el sistema) |
| RF-08 | El personal de la Coordinación y el administrador de esa iglesia modifican sus datos; el administrador solo los de su iglesia. | Obligatorio | «En cada iglesia habrá un administrador que lleve sus datos» · «Nadie de una iglesia debe poder modificar la información de otra» (Quién usará el sistema) |
| RF-09 | Al registrar o editar una iglesia, el usuario elige el estado, después un municipio de ese estado y después una localidad de ese municipio, siempre del catálogo del INEGI. | Obligatorio | «Los estados, municipios y localidades deben coincidir con el catálogo oficial del INEGI» (Las iglesias) |
| RF-10 | El personal de la Coordinación carga y actualiza el catálogo de estados, municipios y localidades a partir del catálogo oficial del INEGI. | Obligatorio | «deben coincidir con el catálogo oficial del INEGI» (Las iglesias) · «El personal de la Coordinación administrará los catálogos» (Quién usará el sistema) |
| RF-11 | El personal marca una iglesia como cerrada con la fecha y el motivo (por ejemplo, daños o desuso); desde ese momento no aparece en las consultas públicas, la búsqueda ni el ranking. *(Quién puede cerrarla y si se reabre: P-04)* | Obligatorio | «A veces una iglesia cierra, ya sea por daños, como les pasó a muchas con los sismos de 2017, o porque deja de usarse» · «tampoco que siga apareciendo en las consultas» (Las iglesias) |
| RF-12 | El personal de la Coordinación consulta las iglesias cerradas con sus datos, sus objetos, la fecha y el motivo del cierre. | Obligatorio | «No queremos perder su historia» (Las iglesias) |
| RF-13 | El administrador de la iglesia registra un objeto con qué es, tipo, año o siglo, material, estado de conservación, ubicación en el templo y si está catalogado por el INAH. | Obligatorio | «De cada objeto queremos saber qué es, de qué tipo, de qué año, de qué material, en qué estado se conserva y en qué parte del templo está» · «Algunas están catalogadas como patrimonio por el INAH» (El patrimonio) |
| RF-14 | El administrador modifica los datos de los objetos de su iglesia. | Obligatorio | «En cada iglesia habrá un administrador que lleve sus datos, objetos» (Quién usará el sistema) |
| RF-15 | El administrador marca un objeto como perdido, prestado o dado de baja, con fecha y motivo; el objeto deja de contar en el índice y su registro se conserva. *(Regreso de un préstamo: P-08)* | Obligatorio | «Si un objeto se pierde, se presta o se da de baja, deja de contar, pero su registro no se borra» (El patrimonio) |
| RF-16 | En la ficha de la iglesia, el visitante ve la lista de sus objetos vigentes con qué es, tipo, año o siglo, material y si está catalogado por el INAH. *(Qué datos son públicos: P-05)* | Obligatorio | «al elegir una iglesia espera encontrar en un solo lugar todo lo que sabemos de ella» (Las iglesias) · «Muchas iglesias resguardan objetos de gran valor» (El patrimonio) |
| RF-17 | Si no se conoce el año exacto de un objeto, el administrador captura solo el siglo y el sistema lo muestra como siglo (por ejemplo, «siglo XVIII»). | Obligatorio | «De muchas piezas no conocemos el año exacto, solo el siglo» (El patrimonio) |
| RF-18 | El sistema calcula el índice de valor patrimonial de cada iglesia con los criterios vigentes y muestra la distinción junto a la iglesia en las listas, la ficha y el ranking. | Obligatorio | «Queremos que el sistema lo calcule» · «queremos que la distinción aparezca junto a cada iglesia» (Las iglesias más reconocidas) |
| RF-19 | El visitante ve las iglesias más reconocidas del país, ordenadas de mayor a menor índice, con su índice y distinción. | Obligatorio | «que la gente vea las iglesias más reconocidas del país» · «En la lista, las iglesias van de mayor a menor índice» (Las iglesias más reconocidas) |
| RF-20 | El visitante ve las iglesias más reconocidas de un estado, de un municipio o de una ciudad que elige. | Obligatorio | «las iglesias más reconocidas del país, de un estado, de un municipio o de una ciudad» (Las iglesias más reconocidas) |
| RF-21 | El ranking no muestra iglesias cerradas ni iglesias sin objetos registrados. *(Iglesias con objetos pero ninguno vigente: P-07)* | Obligatorio | «no aparecen las que están cerradas ni las que no tienen objetos registrados» (Las iglesias más reconocidas) |
| RF-22 | El personal de la Coordinación consulta y modifica los criterios del índice (rangos de antigüedad y sus puntos, multiplicadores por tipo, puntos del INAH y umbrales y nombres de las distinciones); el índice de todas las iglesias se calcula con los nuevos criterios desde que se guardan, sin cambiar código. | Obligatorio | «Revisamos estos criterios cada año, así que queremos ajustarlos sin tener que reprogramar el sistema» (Las iglesias más reconocidas) · «El personal de la Coordinación administrará […] los criterios del índice» (Quién usará el sistema) |
| RF-23 | El investigador elige un tipo de objeto, una antigüedad mínima en años y un estado, municipio o ciudad, y ve las iglesias activas que tienen al menos un objeto vigente que cumple. *(Detalles: P-09)* | Obligatorio | «"todas las iglesias de Puebla con imágenes de 300 años o más"» · «Queremos buscar así, por tipo de objeto y antigüedad, en un estado, un municipio o una ciudad» (Las iglesias más reconocidas) |

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
| RN-07 | Una iglesia cerrada conserva sus datos y objetos, pero no aparece en las consultas públicas, la búsqueda del investigador ni el ranking. | Obligatorio | «No queremos perder su historia, pero tampoco que siga apareciendo en las consultas» (Las iglesias) |
| RN-08 | El tipo de iglesia es uno de: catedral, basílica, parroquia, templo, capilla o santuario. | Obligatorio | «si es catedral, basílica, parroquia, templo, capilla o santuario» (Las iglesias) |
| RN-09 | El estado, el municipio y la localidad de una iglesia existen en el catálogo del INEGI, el municipio pertenece al estado y la localidad al municipio; si no, el registro se rechaza. | Obligatorio | «Los estados, municipios y localidades deben coincidir con el catálogo oficial del INEGI» (Las iglesias) |
| RN-10 | Cada objeto tiene año exacto o, si no se conoce, siglo; sin uno de los dos no se puede registrar porque no se puede calificar. | Obligatorio | «De muchas piezas no conocemos el año exacto, solo el siglo» (El patrimonio) · «Cada objeto se califica primero por su antigüedad» (Las iglesias más reconocidas) |
| RN-11 | Un objeto perdido, prestado o dado de baja deja de ser vigente: no suma al índice, pero su registro se conserva con su estado. | Obligatorio | «Si un objeto se pierde, se presta o se da de baja, deja de contar, pero su registro no se borra» (El patrimonio) |
| RN-12 | El ranking ordena las iglesias de mayor a menor índice. *(Empates: P-07)* | Obligatorio | «En la lista, las iglesias van de mayor a menor índice» (Las iglesias más reconocidas) |
| RN-13 | El ranking excluye las iglesias cerradas y las que no tienen objetos registrados. | Obligatorio | «no aparecen las que están cerradas ni las que no tienen objetos registrados» (Las iglesias más reconocidas) |
| RN-14 | El índice no se captura a mano: se calcula siempre con los criterios vigentes, así que un cambio de criterios cambia el índice y la distinción de todas las iglesias. | Obligatorio | «Desde hace años la calificamos a mano» · «Queremos que el sistema lo calcule» · «queremos ajustarlos sin tener que reprogramar el sistema» (Las iglesias más reconocidas) |
| RN-15 | La antigüedad de un objeto es el año de cálculo menos su año (o la mitad de su siglo). El año de cálculo es el año en curso. *(Por confirmar: P-01)* | Obligatorio | «Cada objeto se califica primero por su antigüedad» · «Un ejemplo de nuestras hojas, calculado en 2026» (Las iglesias más reconocidas) |
| RN-16 | El tipo de cada objeto pertenece a uno de los cinco grupos del índice: imagen (santo, virgen o cristo); retablo, pintura o mural; órgano o piano; orfebrería, mobiliario litúrgico o documento; otra pieza. Los candelabros cuentan como orfebrería. *(Cálices y libros antiguos: P-06)* | Obligatorio | «las imágenes de santos, vírgenes y cristos, por 1.5; retablos, pinturas y murales, por 1.3; órganos y pianos, por 1.2; orfebrería, mobiliario litúrgico y documentos, por 1, y cualquier otra pieza, por 0.8» · «un par de candelabros de plata de 1890» (Las iglesias más reconocidas) |

> RN-15 queda pendiente de la respuesta a P-01 (año en curso o año fijo de cálculo). RN-16: los candelabros del ejemplo valen 4 × 1, así que cuentan como orfebrería.

---

## 5. Criterios de aceptación de los flujos principales

Formato: **CA-xx · Flujo** — Dado … / Cuando … / Entonces … · Requerimientos: RF/RN.

**CA-01 · Índice patrimonial del ejemplo del cliente**
- **Dado** una parroquia con: imagen de San Miguel Arcángel de 1720 catalogada por el INAH; retablo lateral del siglo XVIII; par de candelabros de plata de 1890; piano vertical de 1950, calculado en 2026,
- **Cuando** el sistema calcula su índice,
- **Entonces** el índice es **35.5** y la distinción es **Alto valor patrimonial**. · RN-01–RN-06

  | Objeto | Año usado | Antigüedad | Puntos (RN-01) | Multiplicador (RN-03) | INAH (RN-04) | Total |
  |---|---|---|---|---|---|---|
  | Imagen de San Miguel Arcángel | 1720 | 306 | 10 | × 1.5 (imagen) | + 5 | 20 |
  | Retablo lateral | siglo XVIII → 1750 (RN-02) | 276 | 7 | × 1.3 (retablo) | — | 9.1 |
  | Par de candelabros de plata | 1890 | 136 | 4 | × 1 (orfebrería, RN-16) | — | 4 |
  | Piano vertical | 1950 | 76 | 2 | × 1.2 (piano) | — | 2.4 |
  | **Índice (RN-05)** | | | | | | **35.5** → 20 ≤ 35.5 < 40 (RN-06) |

**CA-02 · Iglesias de un estado**
- **Dado** un estado con tres iglesias activas y una cerrada,
- **Cuando** el visitante elige ese estado,
- **Entonces** ve las tres activas con su tipo, municipio y distinción, y no ve la cerrada. · RF-01, RF-11, RF-18, RN-07

**CA-03 · Acotar la lista**
- **Dado** un estado con parroquias y capillas en dos municipios,
- **Cuando** el visitante acota por uno de los municipios y por el tipo «parroquia»,
- **Entonces** solo ve las parroquias de ese municipio; al quitar los filtros vuelve a ver todas las del estado. · RF-02, RF-03

**CA-04 · Ficha de una iglesia**
- **Dado** la parroquia de CA-01 con un objeto más dado de baja,
- **Cuando** el visitante la elige,
- **Entonces** ve en una sola pantalla sus datos, los cuatro objetos vigentes, el índice 35.5 y «Alto valor patrimonial», y no ve el objeto dado de baja. · RF-06, RF-16, RF-18, RN-11

**CA-05 · Objeto prestado**
- **Dado** la parroquia de CA-01, calculado en 2026,
- **Cuando** el administrador marca el piano vertical como prestado,
- **Entonces** el índice baja a **33.1**, la distinción sigue siendo **Alto valor patrimonial** y el piano sigue registrado con estado "prestado". · RF-15, RN-05, RN-11

**CA-06 · Ranking de un estado**
- **Dado** en un estado: la iglesia A con índice 45, la parroquia de CA-01 (35.5), la iglesia C cerrada con índice 60 y la iglesia D sin objetos,
- **Cuando** el visitante consulta las iglesias más reconocidas de ese estado,
- **Entonces** ve primero A («Patrimonio sobresaliente») y después la parroquia («Alto valor patrimonial»), y no ve C ni D. · RF-19–RF-21, RN-12, RN-13

**CA-07 · Ajustar los criterios**
- **Dado** la parroquia de CA-01,
- **Cuando** el personal de la Coordinación cambia los puntos del INAH de 5 a 10 y guarda,
- **Entonces** sin cambiar código el índice pasa a **40.5** y la distinción a **Patrimonio sobresaliente**, también en el ranking. · RF-22, RN-14

**CA-08 · Búsqueda del investigador**
- **Dado** en Puebla, calculado en 2026: la iglesia X con una imagen de 1700, la iglesia Y con una imagen de 1750 y la iglesia Z con un retablo de 1600,
- **Cuando** el investigador busca imágenes de 300 años o más en Puebla,
- **Entonces** solo ve la iglesia X. · RF-23, RN-02, RN-16

**CA-09 · Ubicación según el catálogo del INEGI**
- **Dado** el formulario de una iglesia nueva,
- **Cuando** el personal de la Coordinación elige un estado y envía un municipio que no pertenece a ese estado,
- **Entonces** el sistema rechaza el registro, señala el campo del municipio y no guarda nada. · RF-07, RF-09, RN-09

---

## 6. Glosario

| Término | Significado | Origen |
|---|---|---|
| Índice de valor patrimonial | Puntaje de una iglesia: suma de los puntos de sus objetos vigentes (RN-01–RN-05) | Las iglesias más reconocidas |
| Objeto vigente | Objeto que no está perdido, prestado ni dado de baja | El patrimonio |
| Iglesia activa | Iglesia que no está cerrada; es la única que aparece en consultas, búsqueda y ranking | Las iglesias |
| Iglesia cerrada | Iglesia que dejó de usarse o se dañó; conserva su historia pero no aparece en consultas | Las iglesias |
| Tipo de iglesia | Catedral, basílica, parroquia, templo, capilla o santuario | Las iglesias |
| Catálogo del INEGI | Lista oficial de estados, municipios y localidades; la ubicación de cada iglesia debe salir de ahí | Las iglesias |
| Objeto (de valor) | Pieza que resguarda una iglesia: imagen, retablo, pintura, órgano, piano, candelabro, cáliz, libro antiguo, etc. | El patrimonio |
| Catalogado por el INAH | Objeto registrado como patrimonio por el Instituto Nacional de Antropología e Historia; suma puntos al índice | El patrimonio |
| Año de cálculo | Año contra el que se mide la antigüedad de los objetos (P-01) | Las iglesias más reconocidas |
| Distinción | Nombre que recibe una iglesia según su índice: Patrimonio sobresaliente, Alto valor patrimonial o Valor patrimonial | Las iglesias más reconocidas |
| Iglesias más reconocidas (ranking) | Lista de iglesias de mayor a menor índice, del país, un estado, un municipio o una ciudad | Las iglesias más reconocidas |
| Criterios del índice | Rangos de antigüedad, multiplicadores, puntos del INAH y umbrales de distinción que la Coordinación ajusta cada año | Las iglesias más reconocidas |
| _…_ | Cada quien agrega los términos de sus apartados | |

---

## 7. Diagrama de estados de la solicitud de espacio (Oscar)

Pendiente: estados y transiciones de la solicitud (recibida, cotizada, sin lugar, aceptada, rechazada, vencida, cancelada…), con quién provoca cada cambio. Se dibuja en `docs/` cuando estén validados.

---

## 8. Preguntas al cliente y respuestas

| ID | Pregunta | Respuesta del cliente | Apartado |
|---|---|---|---|
| P-01 | ¿La antigüedad de los objetos se calcula contra el año en curso o contra un año fijo que defina la Coordinación al revisar los criterios? El ejemplo dice «calculado en 2026». (RN-15) | _pendiente_ | Las iglesias más reconocidas |
| P-02 | Al buscar por nombre, ¿basta con escribir parte del nombre y se ignoran acentos y mayúsculas? (RF-04) | _pendiente_ | Las iglesias |
| P-03 | Al acotar por capacidad, ¿se pide una capacidad mínima ("que quepan al menos 200") o un rango? (RF-05) | _pendiente_ | Las iglesias |
| P-04 | ¿Quién puede cerrar una iglesia: solo la Coordinación o también su administrador? ¿Una iglesia cerrada puede volver a abrirse? (RF-11) | _pendiente_ | Las iglesias |
| P-05 | ¿Qué datos de los objetos se muestran al público? En particular, ¿la ubicación en el templo de piezas valiosas debe ser solo para el personal? (RF-16) | _pendiente_ | El patrimonio |
| P-06 | ¿Los tipos de objeto son una lista cerrada? ¿Los cálices cuentan como orfebrería y los libros antiguos como documentos? (RN-16) | _pendiente_ | El patrimonio |
| P-07 | En el ranking, ¿aparece una iglesia que tiene objetos registrados pero ninguno vigente (índice 0)? ¿Aparecen las que no alcanzan distinción? Si dos iglesias empatan, ¿cómo se ordenan? (RF-21, RN-12) | _pendiente_ | Las iglesias más reconocidas |
| P-08 | Cuando un objeto prestado regresa, ¿vuelve a contar? ¿Se guarda el historial de préstamos (a quién y hasta cuándo)? (RF-15) | _pendiente_ | El patrimonio |
| P-09 | En la búsqueda del investigador, ¿se puede elegir más de un tipo de objeto a la vez o un rango de antigüedad ("entre 200 y 300 años")? ¿Se muestran también los objetos que cumplen dentro de cada iglesia? (RF-23) | _pendiente_ | Las iglesias más reconocidas |
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
