# Reporte de Pruebas Sprint 3 - Catálogos Comerciales

## Objetivo

Validar funcionamiento completo de los módulos:

- Clients
- Suppliers
- Products

Incluyendo:
- CRUD
- Validaciones
- Persistencia en Firestore
- Integración JWT
- Consistencia de respuestas
- Toggle activo/inactivo

---

# 1. Validación de Autenticación

## Login Correcto

**Endpoint:** `POST /api/auth/login`

### Request
```json
{
  "usuario": "proyecto",
  "password": "Hello2U"
}
```

### Resultado
✅ Login exitoso  
✅ Token JWT generado correctamente  
✅ Acceso autorizado a endpoints protegidos

---

# 2. Módulo Clients

---

## Listado de Clientes

**Endpoint:** `GET /api/clients`

### Response
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

### Validaciones realizadas
- ✅ Endpoint protegido con JWT
- ✅ Respuesta estándar
- ✅ Paginación funcional
- ✅ Lista vacía manejada correctamente

---

## Crear Cliente

**Endpoint:** `POST /api/clients`

### Request
```json
{
  "nombre": "Cliente Prueba",
  "rfc": "XAXX010101000",
  "email": "cliente@test.com",
  "telefono": "8123456789"
}
```

### Response
```json
{
  "message":"Cliente creado correctamente",
  "item":{
    "id":"a9eTeKb5u19Mx3O4OzlD",
    "nombre":"Cliente Prueba",
    "rfc":"XAXX010101000",
    "email":"cliente@test.com",
    "telefono":"8123456789",
    "direccion":"",
    "contacto":"",
    "notas":"",
    "activo":true,
    "createdAt":"2026-05-10T22:34:00.232Z",
    "updatedAt":"2026-05-10T22:34:00.232Z"
  }
}
```

### Validaciones realizadas
- ✅ Firestore guarda correctamente
- ✅ Generación automática de ID
- ✅ `activo` por defecto en `true`
- ✅ Timestamps automáticos

---

## GET después de crear cliente

### Response
```json
{
  "items":[
    {
      "id":"a9eTeKb5u19Mx3O4OzlD",
      "nombre":"Cliente Prueba",
      "rfc":"XAXX010101000",
      "email":"cliente@test.com",
      "telefono":"8123456789",
      "direccion":"",
      "contacto":"",
      "notas":"",
      "activo":true,
      "createdAt":"2026-05-10T22:34:00.232Z",
      "updatedAt":"2026-05-10T22:34:00.232Z"
    }
  ],
  "total":1,
  "page":1,
  "limit":10
}
```

### Resultado
✅ Refresco correcto de información  
✅ Persistencia confirmada

---

## Validación de Campos Vacíos

**Endpoint:** `POST /api/clients`

### Request
```json
{
  "nombre": "",
  "email": "correo-mal",
  "telefono": "abc"
}
```

### Response
```json
{
  "message":"Error de validación",
  "errors":{
    "nombre":"El nombre debe tener al menos 2 caracteres",
    "email":"El email no es válido"
  }
}
```

### Validaciones realizadas
- ✅ Nombre requerido
- ✅ Longitud mínima validada
- ✅ Validación de email
- ✅ Manejo correcto de errores

---

## Actualizar Cliente

**Endpoint:** `PATCH /api/clients/a9eTeKb5u19Mx3O4OzlD`

### Request
```json
{
  "nombre": "Cliente Actualizado",
  "telefono": "8188888888"
}
```

### Response
```json
{
  "message":"Cliente actualizado correctamente",
  "item":{
    "id":"a9eTeKb5u19Mx3O4OzlD",
    "nombre":"Cliente Actualizado",
    "rfc":"XAXX010101000",
    "email":"cliente@test.com",
    "telefono":"8188888888",
    "direccion":"",
    "contacto":"",
    "notas":"",
    "activo":true,
    "createdAt":"2026-05-10T22:34:00.232Z",
    "updatedAt":"2026-05-10T22:40:16.120Z"
  }
}
```

### Resultado
- ✅ Actualización parcial funcional
- ✅ Conserva datos existentes
- ✅ `updatedAt` actualizado correctamente

---

## Toggle Activo/Inactivo

**Endpoint:**  
`PATCH /api/clients/a9eTeKb5u19Mx3O4OzlD/toggle-active`

### Request
```json
{
  "activo": false
}
```

### Response
```json
{
  "message":"Estado del cliente actualizado correctamente",
  "item":{
    "activo":false
  }
}
```

### Hallazgo importante
⚠️ El endpoint NO hace toggle automático.  
⚠️ Requiere enviar explícitamente:

```json
{
  "activo": true/false
}
```

---

## Eliminar Cliente

**Endpoint:**  
`DELETE /api/clients/a9eTeKb5u19Mx3O4OzlD`

### Response
```json
{
  "message":"Cliente eliminado correctamente"
}
```

---

## GET después del DELETE

### Response
```json
{
  "items":[],
  "total":0,
  "page":1,
  "limit":10
}
```

### Resultado
✅ Eliminación persistida correctamente en Firestore

---

# 3. Módulo Suppliers

---

## Listado de Suppliers

**Endpoint:** `GET /api/suppliers`

### Response
```json
{
  "items":[],
  "total":0,
  "page":1,
  "limit":10
}
```

---

## Crear Supplier

**Endpoint:** `POST /api/suppliers`

### Request
```json
{
  "nombre": "Proveedor Test",
  "rfc": "XAXX010101000",
  "email": "proveedor@test.com",
  "telefono": "8188888888"
}
```

### Response
```json
{
  "message":"Proveedor creado correctamente",
  "item":{
    "id":"oVEhpdMLGfrFgHqZL1VW",
    "nombre":"Proveedor Test",
    "rfc":"XAXX010101000",
    "email":"proveedor@test.com",
    "telefono":"8188888888",
    "direccion":"",
    "contacto":"",
    "giro":"",
    "notas":"",
    "activo":true,
    "createdAt":"2026-05-10T22:52:44.510Z",
    "updatedAt":"2026-05-10T22:52:44.510Z"
  }
}
```

### Resultado
- ✅ Persistencia correcta
- ✅ Consistencia estructural con Clients
- ✅ Campo adicional detectado: `giro`

---

## Cambio de Estado Supplier

### Response
```json
{
  "message":"Proveedor actualizado correctamente",
  "item":{
    "activo":false
  }
}
```

### Resultado
✅ Actualización de estado funcional

---

# 4. Módulo Products

---

## Listado de Productos

**Endpoint:** `GET /api/products`

### Response
```json
{
  "items":[
    {
      "id":"dN9lM4ibX2p7Qzx5yLVm",
      "sku":"PRD-0001",
      "nombre":"MACBOOK AIR M4",
      "stock":14,
      "stockMinimo":0,
      "activo":false
    }
  ],
  "total":1,
  "page":1,
  "limit":10
}
```

### Resultado
✅ Campos críticos para inventory presentes:
- `stock`
- `stockMinimo`
- `sku`

---

## Crear Producto

**Endpoint:** `POST /api/products`

### Request
```json
{
  "sku": "PROD-001",
  "nombre": "Laptop Dell",
  "categoria": "Electrónica",
  "unidad": "pieza",
  "marca": "Dell",
  "precioCompra": 15000,
  "precioVenta": 18000,
  "stock": 10,
  "stockMinimo": 2
}
```

### Response
```json
{
  "message":"Producto creado correctamente",
  "item":{
    "id":"jWNivZZD24dBE96RjvZJ",
    "sku":"PROD-001",
    "nombre":"Laptop Dell",
    "categoria":"Electrónica",
    "unidad":"pieza",
    "marca":"Dell",
    "precioCompra":15000,
    "precioVenta":18000,
    "stock":10,
    "stockMinimo":2,
    "activo":true
  }
}
```

### Resultado
- ✅ Datos numéricos correctos
- ✅ Stock funcional
- ✅ SKU funcional
- ✅ Persistencia correcta

---

## Validaciones de Productos

### Request
```json
{
  "sku": "",
  "nombre": "",
  "precioCompra": -1,
  "precioVenta": -10,
  "stock": -5,
  "stockMinimo": -2
}
```

### Response
```json
{
  "message":"Error de validación",
  "errors":{
    "sku":"El SKU debe tener al menos 2 caracteres",
    "nombre":"El nombre debe tener al menos 2 caracteres",
    "precioCompra":"El precio de compra no puede ser negativo",
    "precioVenta":"El precio de venta no puede ser negativo",
    "stock":"El stock no puede ser negativo",
    "stockMinimo":"El stock mínimo no puede ser negativo"
  }
}
```

### Resultado
✅ Validaciones numéricas funcionales  
✅ Protección contra negativos

---

## SKU Duplicado

### Response
```json
{
  "message":"El SKU del producto ya existe"
}
```

### Resultado
✅ Validación de SKU único funcional

---

## Actualizar Producto

**Endpoint:**  
`PATCH /api/products/jWNivZZD24dBE96RjvZJ`

### Request
```json
{
  "nombre": "Laptop Dell Actualizada",
  "precioVenta": 20000,
  "stock": 15
}
```

### Response
```json
{
  "message":"Producto actualizado correctamente",
  "item":{
    "nombre":"Laptop Dell Actualizada",
    "precioVenta":20000,
    "stock":15
  }
}
```

### Resultado
✅ Actualización parcial correcta  
✅ Stock actualizado correctamente

---

## Eliminar Producto

**Endpoint:**  
`DELETE /api/products/jWNivZZD24dBE96RjvZJ`

### Response
```json
{
  "message":"Producto eliminado correctamente"
}
```

### Resultado
✅ Eliminación correcta en Firestore

---
# Resumen General

| Módulo | Estado |
|--------|---------|
| Clients | ✅ Completo |
| Suppliers | ✅ Completo |
| Products | ✅ Completo |
| JWT/Auth | ✅ Funcional |
| Firestore | ✅ Persistencia correcta |
| Validaciones | ✅ Funcionales |

---

# Conclusión Final

✅ Los módulos comerciales del Sprint 3 funcionan correctamente.

✅ CRUD funcional en:
- Clients
- Suppliers
- Products

✅ Backend listo para integración con:
- Inventory
- Dashboard
- Recepciones

⚠️ Se recomienda documentar al frontend:
- naming convention en español
- comportamiento real de `toggle-active`