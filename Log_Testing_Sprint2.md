# ✅ Checklist de Pruebas CRUD de Administración

## Pasos Generales

- [ ] Crear registro con datos válidos
- [ ] Crear registro con campos vacíos (debe fallar)
- [ ] Crear registro con datos duplicados (debe fallar)
- [ ] Listar registros (ver paginación, filtros, orden)
- [ ] Editar registro y confirmar que la UI se refresca después de guardar
- [ ] Eliminar registro y confirmar que la UI se refresca después de eliminar
- [ ] Activar/Desactivar (toggle) y verificar reflejo inmediato en UI
- [ ] Probar acciones con un usuario sin permisos (debe mostrar error/no dejar)
- [ ] Simular error de backend (500 u otro) y que se vea en UI
- [ ] Registrar cualquier bug de integración
- [ ] Notificar cambios en payloads o nombres de propiedades a frontend

---

## 🗂️ Pruebas por Módulo

<details>
<summary><b>Usuarios</b> (`/api/users`)</summary>

- [ ] Crear usuario (con datos válidos)
- [ ] Crear usuario (email/usuario duplicado - error 409)
- [ ] Crear usuario (campos requeridos vacíos - error 400)
- [ ] Listar usuarios: verificar paginación y filtro "activo"
- [ ] Editar usuario y verificar actualización
- [ ] Cambiar rol del usuario y verificar reflejo en permisos
- [ ] Activar/desactivar usuario
- [ ] Eliminar usuario
- [ ] Verificar UI se refresca tras cada acción
- [ ] Probar editar/eliminar usuario SIN permisos (error 401/403)
- [ ] Prueba valores máximos/mínimos a los campos
- [ ] Cambiar el estado `activo` directamente desde API (ver si Front lo respeta)
</details>

---

<details>
<summary><b>Roles</b> (`/api/roles`)</summary>

- [ ] Crear rol con nombre/permisos únicos
- [ ] Crear rol con nombre duplicado (error 409)
- [ ] Editar rol y ver reflejo
- [ ] Eliminar rol y actualizar relación en usuarios
- [ ] Acceder SIN permisos (error 401/403)
- [ ] Crear/editar con campos vacíos (error)
</details>

---

<details>
<summary><b>Permisos</b> (`/api/permissions`)</summary>

- [ ] Crear permiso (código y nombre únicos)
- [ ] Crear permiso con duplicados (error)
- [ ] Usar todos los campos obligatorios y opcionales
- [ ] Editar y eliminar permiso (ver reflejo en UI)
- [ ] Probar error de backend (500)
</details>

---

<details>
<summary><b>Clientes y Proveedores</b></summary>

- [ ] Alta con campos obligatorios y todos los opcionales
- [ ] Crear con RFC/email duplicado (error)
- [ ] Toggle activo/inactivo
- [ ] Editar y eliminar registro
- [ ] Prueba mínima y máxima de campos
</details>

---

<details>
<summary><b>Productos</b></summary>

- [ ] Crear producto (SKU único)
- [ ] Crear con SKU duplicado (error 409)
- [ ] Listar, filtrar, buscar
- [ ] Editar producto (ver reflejo en UI)
- [ ] Eliminar producto
- [ ] Activar/desactivar stock
- [ ] Prueba con datos numéricos inválidos
</details>

---

<details>
<summary><b>Inventario</b></summary>

- [ ] Ajuste de inventario (ENTRADA/SALIDA/AJUSTE)
- [ ] Prueba cantidad negativa
- [ ] Prueba sin permisos (error)
- [ ] Verifica reflejo inmediato en UI
</details>

---

## ⚠️ Pruebas de Errores Globales

- [ ] Que la app/UI muestre errores 400/401/403/409/500 de backend claramente (toast, modal, banner)
- [ ] Que ante campos "raros" (emojis, textos largos) la respuesta sea coherente
- [ ] Que las opciones/desplegables solo muestren acciones permitidas

---

## 🐞 Tabla de Bugs

| Fecha  | Módulo    | Acción         | Error/Bug                  | Estado    |
|--------|-----------|---------------|----------------------------|-----------|
| 2026-05-06 | Usuarios  | Crear duplicado | 500 en backend, debe ser 409 | Reportado |
|          |           |               |                            |           |

---

## 🤝 Ayuda/Notas para Frontend

- [ ] Si `email`/`nombre`/`activo` cambia de nombre o aparece/desaparece en el API, notificar al equipo Front.
- [ ] Si response del API añade/elimina campos, actualizar DTO/Types/Interfaces en UI.
- [ ] Documentar cualquier diferencia entre lo esperado por el Front y lo enviado por el Backend.

---

## 💡 _Notas de integración_

- Todos los endpoints requieren `Authorization: Bearer <token>` excepto login y health.
- Los toggles de activo/inactivo deben refrescar la UI después de cada acción exitosa.
- Todos los status de error deben estar documentados y mostrarse en frontend.
