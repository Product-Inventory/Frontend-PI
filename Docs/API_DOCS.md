## ¿Para qué sirve este documento?

- Este documento les deberia servir para entender exactamente como consumir cada endpoint de la API, que esperar en las respuestas y como manejar los errores.

- Mi intencion es que sea una guia completa que ayude en el desarrollo del frontend :).

## Indice
- [Core](#api---core)
  - [GET /](#get-)
- [Health](#api---health)
  - [GET /api/health](#get-apihealth)
- [Auth](#api---auth)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [GET /api/auth/me](#get-apiauthme)
- [Users](#api---users)
  - [GET /api/users](#get-apiusers)
  - [GET /api/users/:id](#get-apiusersid)
  - [POST /api/users](#post-apiusers)
  - [PATCH /api/users/:id](#patch-apiusersid)
  - [PATCH /api/users/:id/toggle-active](#patch-apiusersidtoggle-active)
  - [DELETE /api/users/:id](#delete-apiusersid)
- [Roles](#api---roles)
  - [GET /api/roles](#get-apiroles)
  - [GET /api/roles/:id](#get-apirolesid)
  - [POST /api/roles](#post-apiroles)
  - [PATCH /api/roles/:id](#patch-apirolesid)
  - [DELETE /api/roles/:id](#delete-apirolesid)
- [Permissions](#api---permissions)
  - [GET /api/permissions](#get-apipermissions)
  - [GET /api/permissions/:id](#get-apipermissionsid)
  - [POST /api/permissions](#post-apipermissions)
  - [POST /api/permissions/seed](#post-apipermissionsseed)
  - [PATCH /api/permissions/:id](#patch-apipermissionsid)
  - [DELETE /api/permissions/:id](#delete-apipermissionsid)
- [Clients](#api---clients)
  - [GET /api/clients](#get-apiclients)
  - [GET /api/clients/:id](#get-apiclientsid)
  - [POST /api/clients](#post-apiclients)
  - [PATCH /api/clients/:id](#patch-apiclientsid)
  - [PATCH /api/clients/:id/toggle-active](#patch-apiclientsidtoggle-active)
  - [DELETE /api/clients/:id](#delete-apiclientsid)
- [Suppliers](#api---suppliers)
  - [GET /api/suppliers](#get-apisuppliers)
  - [GET /api/suppliers/:id](#get-apisuppliersid)
  - [POST /api/suppliers](#post-apisuppliers)
  - [PATCH /api/suppliers/:id](#patch-apisuppliersid)
  - [PATCH /api/suppliers/:id/toggle-active](#patch-apisuppliersidtoggle-active)
  - [DELETE /api/suppliers/:id](#delete-apisuppliersid)
- [Products](#api---products)
  - [GET /api/products](#get-apiproducts)
  - [GET /api/products/:id](#get-apiproductsid)
  - [POST /api/products](#post-apiproducts)
  - [PATCH /api/products/:id](#patch-apiproductsid)
  - [PATCH /api/products/:id/toggle-active](#patch-apiproductsidtoggle-active)
  - [DELETE /api/products/:id](#delete-apiproductsid)
- [Inventory](#api---inventory)
  - [GET /api/inventory](#get-apiinventory)
  - [GET /api/inventory/movements](#get-apiinventorymovements)
  - [GET /api/inventory/:productId](#get-apiinventoryproductid)
  - [PATCH /api/inventory/:productId/adjust](#patch-apiinventoryproductidadjust)
- [Recepciones](#api---recepciones)
  - [GET /api/recepciones](#get-apirecepciones)
  - [GET /api/recepciones/:id](#get-apirecepcionesid)
  - [POST /api/recepciones](#post-apirecepciones)
  - [PATCH /api/recepciones/:id](#patch-apirecepcionesid)
  - [PATCH /api/recepciones/:id/confirm](#patch-apirecepcionesidconfirm)
  - [DELETE /api/recepciones/:id](#delete-apirecepcionesid)
- [Audit](#api---audit)
  - [GET /api/audit](#get-apiaudit)
  - [GET /api/audit/:id](#get-apiauditid)
  - [POST /api/audit](#post-apiaudit)
- [Dashboard](#api---dashboard)
  - [GET /api/dashboard/summary](#get-apidashboardsummary)
  - [GET /api/dashboard/recent-activity](#get-apidashboardrecent-activity)

# API - Core

## [GET] /
**Descripción:** Devuelve un mensaje de bienvenida de la API.

### Request
- **Headers:** N/A
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - ERP Académico Modular API"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 500    | Error interno del servidor |

---

# API - Health

## [GET] /api/health
**Descripción:** Verifica el estado de la API.

### Request
- **Headers:** N/A
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - API funcionando correctamente",
  "timestamp": "string - ISO 8601"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 500    | Error interno del servidor |

---

# API - Auth

## [POST] /api/auth/login
**Descripción:** Inicia sesion y devuelve JWT y datos del usuario.

### Request
- **Headers:** N/A
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "usuario": "string - usuario de acceso",
  "password": "string - contrasena"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "token": "string - JWT",
  "user": {
    "id": "string - id del usuario",
    "nombre": "string - nombre",
    "apellido": "string - apellido",
    "email": "string - email",
    "usuario": "string - usuario",
    "role": "string | null - nombre del rol",
    "roleId": "string | null - id del rol",
    "permissions": "string[] - permisos del usuario",
    "activo": "boolean - estado"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | Credenciales invalidas |
| 403    | Usuario inactivo |
| 500    | Error interno del servidor |

---

## [GET] /api/auth/me
**Descripción:** Devuelve el usuario autenticado. Requiere auth y permiso `auth:me`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "user": {
    "id": "string - id del usuario",
    "nombre": "string - nombre",
    "apellido": "string - apellido",
    "email": "string - email",
    "usuario": "string - usuario",
    "role": "string | null - nombre del rol",
    "roleId": "string | null - id del rol",
    "permissions": "string[] - permisos del usuario",
    "activo": "boolean - estado"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 401    | No autorizado o token invalido |
| 403    | Sin permisos o usuario inactivo |
| 404    | Usuario no encontrado |
| 500    | Error interno del servidor |

---

# API - Users

## [GET] /api/users
**Descripción:** Lista usuarios con filtros. Requiere auth y permiso `users:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `activo` (boolean, opcional; acepta "true"/"false"), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del usuario",
      "nombre": "string - nombre",
      "apellido": "string - apellido",
      "email": "string - email",
      "usuario": "string - usuario",
      "role": "string | null - nombre del rol",
      "roleId": "string | null - id del rol",
      "permissions": "string[] - permisos",
      "activo": "boolean - estado",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/users/:id
**Descripción:** Obtiene un usuario por id. Requiere auth y permiso `users:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del usuario",
    "nombre": "string - nombre",
    "apellido": "string - apellido",
    "email": "string - email",
    "usuario": "string - usuario",
    "role": "string | null - nombre del rol",
    "roleId": "string | null - id del rol",
    "permissions": "string[] - permisos",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Usuario no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/users
**Descripción:** Crea un usuario. Requiere auth y permiso `users:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre",
  "apellido": "string - apellido",
  "email": "string - email",
  "usuario": "string - usuario",
  "password": "string - contrasena",
  "role": "string | null - nombre del rol (opcional)",
  "roleId": "string | null - id del rol (opcional)",
  "permissions": "string[] - permisos (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del usuario",
    "nombre": "string - nombre",
    "apellido": "string - apellido",
    "email": "string - email",
    "usuario": "string - usuario",
    "role": "string | null - nombre del rol",
    "roleId": "string | null - id del rol",
    "permissions": "string[] - permisos",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 409    | Usuario o email ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/users/:id
**Descripción:** Actualiza un usuario. Requiere auth y permiso `users:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre (opcional)",
  "apellido": "string - apellido (opcional)",
  "email": "string - email (opcional)",
  "usuario": "string - usuario (opcional)",
  "password": "string - contrasena (opcional)",
  "role": "string | null - nombre del rol (opcional)",
  "roleId": "string | null - id del rol (opcional)",
  "permissions": "string[] - permisos (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del usuario",
    "nombre": "string - nombre",
    "apellido": "string - apellido",
    "email": "string - email",
    "usuario": "string - usuario",
    "role": "string | null - nombre del rol",
    "roleId": "string | null - id del rol",
    "permissions": "string[] - permisos",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o payload vacio |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Usuario no encontrado |
| 409    | Usuario o email ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/users/:id/toggle-active
**Descripción:** Activa o desactiva un usuario. Requiere auth y permiso `users:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "activo": "boolean - nuevo estado"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del usuario",
    "nombre": "string - nombre",
    "apellido": "string - apellido",
    "email": "string - email",
    "usuario": "string - usuario",
    "role": "string | null - nombre del rol",
    "roleId": "string | null - id del rol",
    "permissions": "string[] - permisos",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Usuario no encontrado |
| 500    | Error interno del servidor |

---

## [DELETE] /api/users/:id
**Descripción:** Elimina un usuario. Requiere auth y permiso `users:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Usuario no encontrado |
| 500    | Error interno del servidor |

---

# API - Roles

## [GET] /api/roles
**Descripción:** Lista roles. Requiere auth y permiso `roles:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del rol",
      "nombre": "string - nombre",
      "descripcion": "string - descripcion",
      "permissions": "string[] - permisos",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/roles/:id
**Descripción:** Obtiene un rol por id. Requiere auth y permiso `roles:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del rol",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "permissions": "string[] - permisos",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Rol no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/roles
**Descripción:** Crea un rol. Requiere auth y permiso `roles:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre",
  "descripcion": "string | null - descripcion (opcional)",
  "permissions": "string[] - permisos (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del rol",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "permissions": "string[] - permisos",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 409    | El rol ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/roles/:id
**Descripción:** Actualiza un rol. Requiere auth y permiso `roles:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre (opcional)",
  "descripcion": "string | null - descripcion (opcional)",
  "permissions": "string[] - permisos (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del rol",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "permissions": "string[] - permisos",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o payload vacio |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Rol no encontrado |
| 409    | El rol ya existe |
| 500    | Error interno del servidor |

---

## [DELETE] /api/roles/:id
**Descripción:** Elimina un rol. Requiere auth y permiso `roles:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Rol no encontrado |
| 500    | Error interno del servidor |

---

# API - Permissions

## [GET] /api/permissions
**Descripción:** Lista permisos. Requiere auth y permiso `permissions:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del permiso",
      "code": "string - codigo",
      "nombre": "string - nombre",
      "descripcion": "string - descripcion",
      "modulo": "string - modulo",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/permissions/:id
**Descripción:** Obtiene un permiso por id. Requiere auth y permiso `permissions:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del permiso",
    "code": "string - codigo",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "modulo": "string - modulo",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Permiso no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/permissions
**Descripción:** Crea un permiso. Requiere auth y permiso `permissions:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "code": "string - codigo",
  "nombre": "string - nombre",
  "descripcion": "string | null - descripcion (opcional)",
  "modulo": "string | null - modulo (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del permiso",
    "code": "string - codigo",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "modulo": "string - modulo",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 409    | El permiso ya existe |
| 500    | Error interno del servidor |

---

## [POST] /api/permissions/seed
**Descripción:** Siembra permisos base. Requiere auth y permiso `permissions:seed`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "items": [
    {
      "id": "string - id del permiso",
      "code": "string - codigo",
      "nombre": "string - nombre",
      "descripcion": "string - descripcion",
      "modulo": "string - modulo",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total sembrados"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [PATCH] /api/permissions/:id
**Descripción:** Actualiza un permiso. Requiere auth y permiso `permissions:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "code": "string - codigo (opcional)",
  "nombre": "string - nombre (opcional)",
  "descripcion": "string | null - descripcion (opcional)",
  "modulo": "string | null - modulo (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del permiso",
    "code": "string - codigo",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "modulo": "string - modulo",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o payload vacio |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Permiso no encontrado |
| 409    | El permiso ya existe |
| 500    | Error interno del servidor |

---

## [DELETE] /api/permissions/:id
**Descripción:** Elimina un permiso. Requiere auth y permiso `permissions:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Permiso no encontrado |
| 500    | Error interno del servidor |

---

# API - Clients

## [GET] /api/clients
**Descripción:** Lista clientes con filtros. Requiere auth y permiso `clients:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `activo` (boolean, opcional; acepta "true"/"false"), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del cliente",
      "nombre": "string - nombre",
      "rfc": "string - RFC",
      "email": "string - email",
      "telefono": "string - telefono",
      "direccion": "string - direccion",
      "contacto": "string - contacto",
      "notas": "string - notas",
      "activo": "boolean - estado",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/clients/:id
**Descripción:** Obtiene un cliente por id. Requiere auth y permiso `clients:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del cliente",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Cliente no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/clients
**Descripción:** Crea un cliente. Requiere auth y permiso `clients:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre",
  "rfc": "string | null - RFC (opcional)",
  "email": "string | null - email (opcional)",
  "telefono": "string | null - telefono (opcional)",
  "direccion": "string | null - direccion (opcional)",
  "contacto": "string | null - contacto (opcional)",
  "notas": "string | null - notas (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del cliente",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 409    | Email o RFC ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/clients/:id
**Descripción:** Actualiza un cliente. Requiere auth y permiso `clients:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre (opcional)",
  "rfc": "string | null - RFC (opcional)",
  "email": "string | null - email (opcional)",
  "telefono": "string | null - telefono (opcional)",
  "direccion": "string | null - direccion (opcional)",
  "contacto": "string | null - contacto (opcional)",
  "notas": "string | null - notas (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del cliente",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o payload vacio |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Cliente no encontrado |
| 409    | Email o RFC ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/clients/:id/toggle-active
**Descripción:** Activa o desactiva un cliente. Requiere auth y permiso `clients:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "activo": "boolean - nuevo estado"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del cliente",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Cliente no encontrado |
| 500    | Error interno del servidor |

---

## [DELETE] /api/clients/:id
**Descripción:** Elimina un cliente. Requiere auth y permiso `clients:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Cliente no encontrado |
| 500    | Error interno del servidor |

---

# API - Suppliers

## [GET] /api/suppliers
**Descripción:** Lista proveedores con filtros. Requiere auth y permiso `suppliers:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `activo` (boolean, opcional; acepta "true"/"false"), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del proveedor",
      "nombre": "string - nombre",
      "rfc": "string - RFC",
      "email": "string - email",
      "telefono": "string - telefono",
      "direccion": "string - direccion",
      "contacto": "string - contacto",
      "giro": "string - giro",
      "notas": "string - notas",
      "activo": "boolean - estado",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/suppliers/:id
**Descripción:** Obtiene un proveedor por id. Requiere auth y permiso `suppliers:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del proveedor",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "giro": "string - giro",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Proveedor no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/suppliers
**Descripción:** Crea un proveedor. Requiere auth y permiso `suppliers:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre",
  "rfc": "string | null - RFC (opcional)",
  "email": "string | null - email (opcional)",
  "telefono": "string | null - telefono (opcional)",
  "direccion": "string | null - direccion (opcional)",
  "contacto": "string | null - contacto (opcional)",
  "giro": "string | null - giro (opcional)",
  "notas": "string | null - notas (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del proveedor",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "giro": "string - giro",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 409    | Email o RFC ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/suppliers/:id
**Descripción:** Actualiza un proveedor. Requiere auth y permiso `suppliers:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "nombre": "string - nombre (opcional)",
  "rfc": "string | null - RFC (opcional)",
  "email": "string | null - email (opcional)",
  "telefono": "string | null - telefono (opcional)",
  "direccion": "string | null - direccion (opcional)",
  "contacto": "string | null - contacto (opcional)",
  "giro": "string | null - giro (opcional)",
  "notas": "string | null - notas (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del proveedor",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "giro": "string - giro",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o payload vacio |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Proveedor no encontrado |
| 409    | Email o RFC ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/suppliers/:id/toggle-active
**Descripción:** Activa o desactiva un proveedor. Requiere auth y permiso `suppliers:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "activo": "boolean - nuevo estado"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del proveedor",
    "nombre": "string - nombre",
    "rfc": "string - RFC",
    "email": "string - email",
    "telefono": "string - telefono",
    "direccion": "string - direccion",
    "contacto": "string - contacto",
    "giro": "string - giro",
    "notas": "string - notas",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Proveedor no encontrado |
| 500    | Error interno del servidor |

---

## [DELETE] /api/suppliers/:id
**Descripción:** Elimina un proveedor. Requiere auth y permiso `suppliers:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Proveedor no encontrado |
| 500    | Error interno del servidor |

---

# API - Products

## [GET] /api/products
**Descripción:** Lista productos con filtros. Requiere auth y permiso `products:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `activo` (boolean, opcional; acepta "true"/"false"), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del producto",
      "sku": "string - SKU",
      "nombre": "string - nombre",
      "descripcion": "string - descripcion",
      "categoria": "string - categoria",
      "unidad": "string - unidad",
      "marca": "string - marca",
      "modelo": "string - modelo",
      "precioCompra": "number - precio de compra",
      "precioVenta": "number - precio de venta",
      "stock": "number - stock",
      "stockMinimo": "number - stock minimo",
      "activo": "boolean - estado",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/products/:id
**Descripción:** Obtiene un producto por id. Requiere auth y permiso `products:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del producto",
    "sku": "string - SKU",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "categoria": "string - categoria",
    "unidad": "string - unidad",
    "marca": "string - marca",
    "modelo": "string - modelo",
    "precioCompra": "number - precio de compra",
    "precioVenta": "number - precio de venta",
    "stock": "number - stock",
    "stockMinimo": "number - stock minimo",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Producto no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/products
**Descripción:** Crea un producto. Requiere auth y permiso `products:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "sku": "string - SKU",
  "nombre": "string - nombre",
  "descripcion": "string | null - descripcion (opcional)",
  "categoria": "string | null - categoria (opcional)",
  "unidad": "string | null - unidad (opcional)",
  "marca": "string | null - marca (opcional)",
  "modelo": "string | null - modelo (opcional)",
  "precioCompra": "number - precio de compra (opcional)",
  "precioVenta": "number - precio de venta (opcional)",
  "stock": "number - stock (opcional)",
  "stockMinimo": "number - stock minimo (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del producto",
    "sku": "string - SKU",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "categoria": "string - categoria",
    "unidad": "string - unidad",
    "marca": "string - marca",
    "modelo": "string - modelo",
    "precioCompra": "number - precio de compra",
    "precioVenta": "number - precio de venta",
    "stock": "number - stock",
    "stockMinimo": "number - stock minimo",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 409    | SKU ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/products/:id
**Descripción:** Actualiza un producto. Requiere auth y permiso `products:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "sku": "string - SKU (opcional)",
  "nombre": "string - nombre (opcional)",
  "descripcion": "string | null - descripcion (opcional)",
  "categoria": "string | null - categoria (opcional)",
  "unidad": "string | null - unidad (opcional)",
  "marca": "string | null - marca (opcional)",
  "modelo": "string | null - modelo (opcional)",
  "precioCompra": "number - precio de compra (opcional)",
  "precioVenta": "number - precio de venta (opcional)",
  "stock": "number - stock (opcional)",
  "stockMinimo": "number - stock minimo (opcional)",
  "activo": "boolean - estado (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del producto",
    "sku": "string - SKU",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "categoria": "string - categoria",
    "unidad": "string - unidad",
    "marca": "string - marca",
    "modelo": "string - modelo",
    "precioCompra": "number - precio de compra",
    "precioVenta": "number - precio de venta",
    "stock": "number - stock",
    "stockMinimo": "number - stock minimo",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o payload vacio |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Producto no encontrado |
| 409    | SKU ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/products/:id/toggle-active
**Descripción:** Activa o desactiva un producto. Requiere auth y permiso `products:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "activo": "boolean - nuevo estado"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del producto",
    "sku": "string - SKU",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "categoria": "string - categoria",
    "unidad": "string - unidad",
    "marca": "string - marca",
    "modelo": "string - modelo",
    "precioCompra": "number - precio de compra",
    "precioVenta": "number - precio de venta",
    "stock": "number - stock",
    "stockMinimo": "number - stock minimo",
    "activo": "boolean - estado",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Producto no encontrado |
| 500    | Error interno del servidor |

---

## [DELETE] /api/products/:id
**Descripción:** Elimina un producto. Requiere auth y permiso `products:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Producto no encontrado |
| 500    | Error interno del servidor |

---

# API - Inventory

## [GET] /api/inventory
**Descripción:** Lista inventario con filtros. Requiere auth y permiso `inventory:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `activo` (boolean, opcional; acepta "true"/"false"), `lowStock` (boolean, opcional; acepta "true"/"false"), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del producto",
      "productId": "string - id del producto",
      "sku": "string - SKU",
      "nombre": "string - nombre",
      "descripcion": "string - descripcion",
      "categoria": "string - categoria",
      "unidad": "string - unidad",
      "marca": "string - marca",
      "modelo": "string - modelo",
      "stock": "number - stock",
      "stockMinimo": "number - stock minimo",
      "lowStock": "boolean - si esta bajo minimos",
      "activo": "boolean - estado",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/inventory/movements
**Descripción:** Lista movimientos de inventario. Requiere auth y permiso `inventory:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `productId` (string, opcional), `tipo` (string, opcional: ENTRADA|SALIDA|AJUSTE), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del movimiento",
      "productId": "string - id del producto",
      "sku": "string - SKU",
      "productNombre": "string - nombre del producto",
      "tipo": "string - ENTRADA|SALIDA|AJUSTE",
      "cantidad": "number - cantidad",
      "stockAnterior": "number - stock anterior",
      "stockNuevo": "number - stock nuevo",
      "motivo": "string - motivo",
      "referencia": "string - referencia",
      "userId": "string - id del usuario",
      "usuario": "string - usuario",
      "createdAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/inventory/:productId
**Descripción:** Obtiene inventario por producto. Requiere auth y permiso `inventory:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `productId` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del producto",
    "productId": "string - id del producto",
    "sku": "string - SKU",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "categoria": "string - categoria",
    "unidad": "string - unidad",
    "marca": "string - marca",
    "modelo": "string - modelo",
    "stock": "number - stock",
    "stockMinimo": "number - stock minimo",
    "lowStock": "boolean - si esta bajo minimos",
    "activo": "boolean - estado",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Producto no encontrado |
| 500    | Error interno del servidor |

---

## [PATCH] /api/inventory/:productId/adjust
**Descripción:** Ajusta inventario de un producto. Requiere auth y permiso `inventory:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `productId` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "tipo": "string - ENTRADA|SALIDA|AJUSTE",
  "cantidad": "number - cantidad",
  "motivo": "string - motivo",
  "referencia": "string | null - referencia (opcional)"
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del producto",
    "productId": "string - id del producto",
    "sku": "string - SKU",
    "nombre": "string - nombre",
    "descripcion": "string - descripcion",
    "categoria": "string - categoria",
    "unidad": "string - unidad",
    "marca": "string - marca",
    "modelo": "string - modelo",
    "stock": "number - stock",
    "stockMinimo": "number - stock minimo",
    "lowStock": "boolean - si esta bajo minimos",
    "activo": "boolean - estado",
    "updatedAt": "string | null - ISO 8601"
  },
  "movement": {
    "id": "string - id del movimiento",
    "productId": "string - id del producto",
    "sku": "string - SKU",
    "productNombre": "string - nombre del producto",
    "tipo": "string - ENTRADA|SALIDA|AJUSTE",
    "cantidad": "number - cantidad",
    "stockAnterior": "number - stock anterior",
    "stockNuevo": "number - stock nuevo",
    "motivo": "string - motivo",
    "referencia": "string - referencia",
    "userId": "string - id del usuario",
    "usuario": "string - usuario",
    "createdAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o stock insuficiente |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Producto no encontrado |
| 500    | Error interno del servidor |

---

# API - Recepciones

## [GET] /api/recepciones
**Descripción:** Lista recepciones con filtros. Requiere auth y permiso `recepciones:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `status` (string, opcional: DRAFT|CONFIRMED), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id de la recepcion",
      "supplierId": "string - id del proveedor",
      "supplierNombre": "string - nombre del proveedor",
      "fecha": "string - fecha",
      "folio": "string - folio",
      "comentarios": "string - comentarios",
      "status": "string - DRAFT|CONFIRMED",
      "items": [
        {
          "productId": "string - id del producto",
          "sku": "string - SKU",
          "productNombre": "string - nombre del producto",
          "cantidad": "number - cantidad",
          "costoUnitario": "number - costo unitario",
          "subtotal": "number - subtotal"
        }
      ],
      "total": "number - total",
      "confirmedAt": "string | null - ISO 8601",
      "confirmedBy": "string - usuario que confirma",
      "confirmedByUserId": "string - id del usuario",
      "createdBy": "string - usuario que crea",
      "createdByUserId": "string - id del usuario",
      "createdAt": "string | null - ISO 8601",
      "updatedAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/recepciones/:id
**Descripción:** Obtiene una recepcion por id. Requiere auth y permiso `recepciones:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id de la recepcion",
    "supplierId": "string - id del proveedor",
    "supplierNombre": "string - nombre del proveedor",
    "fecha": "string - fecha",
    "folio": "string - folio",
    "comentarios": "string - comentarios",
    "status": "string - DRAFT|CONFIRMED",
    "items": [
      {
        "productId": "string - id del producto",
        "sku": "string - SKU",
        "productNombre": "string - nombre del producto",
        "cantidad": "number - cantidad",
        "costoUnitario": "number - costo unitario",
        "subtotal": "number - subtotal"
      }
    ],
    "total": "number - total",
    "confirmedAt": "string | null - ISO 8601",
    "confirmedBy": "string - usuario que confirma",
    "confirmedByUserId": "string - id del usuario",
    "createdBy": "string - usuario que crea",
    "createdByUserId": "string - id del usuario",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Recepcion no encontrada |
| 500    | Error interno del servidor |

---

## [POST] /api/recepciones
**Descripción:** Crea una recepcion. Requiere auth y permiso `recepciones:create`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "supplierId": "string - id del proveedor",
  "fecha": "string - fecha",
  "folio": "string - folio",
  "comentarios": "string | null - comentarios (opcional)",
  "items": [
    {
      "productId": "string - id del producto",
      "cantidad": "number - cantidad",
      "costoUnitario": "number - costo unitario"
    }
  ]
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id de la recepcion",
    "supplierId": "string - id del proveedor",
    "supplierNombre": "string - nombre del proveedor",
    "fecha": "string - fecha",
    "folio": "string - folio",
    "comentarios": "string - comentarios",
    "status": "string - DRAFT|CONFIRMED",
    "items": [
      {
        "productId": "string - id del producto",
        "sku": "string - SKU",
        "productNombre": "string - nombre del producto",
        "cantidad": "number - cantidad",
        "costoUnitario": "number - costo unitario",
        "subtotal": "number - subtotal"
      }
    ],
    "total": "number - total",
    "confirmedAt": "string | null - ISO 8601",
    "confirmedBy": "string - usuario que confirma",
    "confirmedByUserId": "string - id del usuario",
    "createdBy": "string - usuario que crea",
    "createdByUserId": "string - id del usuario",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Proveedor o producto no encontrado |
| 409    | Folio ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/recepciones/:id
**Descripción:** Actualiza una recepcion. Requiere auth y permiso `recepciones:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{
  "supplierId": "string - id del proveedor (opcional)",
  "fecha": "string - fecha (opcional)",
  "folio": "string - folio (opcional)",
  "comentarios": "string | null - comentarios (opcional)",
  "items": [
    {
      "productId": "string - id del producto",
      "cantidad": "number - cantidad",
      "costoUnitario": "number - costo unitario"
    }
  ]
}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id de la recepcion",
    "supplierId": "string - id del proveedor",
    "supplierNombre": "string - nombre del proveedor",
    "fecha": "string - fecha",
    "folio": "string - folio",
    "comentarios": "string - comentarios",
    "status": "string - DRAFT|CONFIRMED",
    "items": [
      {
        "productId": "string - id del producto",
        "sku": "string - SKU",
        "productNombre": "string - nombre del producto",
        "cantidad": "number - cantidad",
        "costoUnitario": "number - costo unitario",
        "subtotal": "number - subtotal"
      }
    ],
    "total": "number - total",
    "confirmedAt": "string | null - ISO 8601",
    "confirmedBy": "string - usuario que confirma",
    "confirmedByUserId": "string - id del usuario",
    "createdBy": "string - usuario que crea",
    "createdByUserId": "string - id del usuario",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion, payload vacio o recepcion confirmada |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Recepcion, proveedor o producto no encontrado |
| 409    | Folio ya existe |
| 500    | Error interno del servidor |

---

## [PATCH] /api/recepciones/:id/confirm
**Descripción:** Confirma una recepcion y actualiza inventario. Requiere auth y permiso `recepciones:update`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id de la recepcion",
    "supplierId": "string - id del proveedor",
    "supplierNombre": "string - nombre del proveedor",
    "fecha": "string - fecha",
    "folio": "string - folio",
    "comentarios": "string - comentarios",
    "status": "string - DRAFT|CONFIRMED",
    "items": [
      {
        "productId": "string - id del producto",
        "sku": "string - SKU",
        "productNombre": "string - nombre del producto",
        "cantidad": "number - cantidad",
        "costoUnitario": "number - costo unitario",
        "subtotal": "number - subtotal"
      }
    ],
    "total": "number - total",
    "confirmedAt": "string | null - ISO 8601",
    "confirmedBy": "string - usuario que confirma",
    "confirmedByUserId": "string - id del usuario",
    "createdBy": "string - usuario que crea",
    "createdByUserId": "string - id del usuario",
    "createdAt": "string | null - ISO 8601",
    "updatedAt": "string | null - ISO 8601"
  },
  "movements": [
    {
      "id": "string - id del movimiento",
      "productId": "string - id del producto",
      "sku": "string - SKU",
      "productNombre": "string - nombre del producto",
      "tipo": "string - ENTRADA",
      "cantidad": "number - cantidad",
      "stockAnterior": "number - stock anterior",
      "stockNuevo": "number - stock nuevo",
      "motivo": "string - motivo",
      "referencia": "string - referencia",
      "userId": "string - id del usuario",
      "usuario": "string - usuario",
      "createdAt": "string | null - ISO 8601"
    }
  ]
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Recepcion ya confirmada o sin partidas |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Recepcion o producto no encontrado |
| 500    | Error interno del servidor |

---

## [DELETE] /api/recepciones/:id
**Descripción:** Elimina una recepcion. Requiere auth y permiso `recepciones:delete`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "message": "string - confirmacion"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion o recepcion confirmada |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Recepcion no encontrada |
| 500    | Error interno del servidor |

---

# API - Audit

## [GET] /api/audit
**Descripción:** Lista registros de auditoria. Requiere auth y permiso `audit:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `q` (string, opcional), `resource` (string, opcional), `action` (string, opcional), `userId` (string, opcional), `page` (number, opcional), `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del registro",
      "action": "string - accion",
      "resource": "string - recurso",
      "resourceId": "string - id del recurso",
      "details": "object - detalles",
      "userId": "string - id del usuario",
      "usuario": "string - usuario",
      "createdAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total de registros",
  "page": "number - pagina actual",
  "limit": "number - tamano de pagina"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/audit/:id
**Descripción:** Obtiene un registro de auditoria por id. Requiere auth y permiso `audit:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** `id` (string)
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "item": {
    "id": "string - id del registro",
    "action": "string - accion",
    "resource": "string - recurso",
    "resourceId": "string - id del recurso",
    "details": "object - detalles",
    "userId": "string - id del usuario",
    "usuario": "string - usuario",
    "createdAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 404    | Registro no encontrado |
| 500    | Error interno del servidor |

---

## [POST] /api/audit
**Descripción:** Crea un registro de auditoria. Requiere auth y permiso `audit:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{
  "action": "string - accion",
  "resource": "string - recurso",
  "resourceId": "string | null - id del recurso (opcional)",
  "details": "object - detalles (opcional)",
  "userId": "string | null - id del usuario (opcional)",
  "usuario": "string | null - usuario (opcional)"
}
```

### Response exitosa
- **Status:** 201
```json
{
  "message": "string - confirmacion",
  "item": {
    "id": "string - id del registro",
    "action": "string - accion",
    "resource": "string - recurso",
    "resourceId": "string - id del recurso",
    "details": "object - detalles",
    "userId": "string - id del usuario",
    "usuario": "string - usuario",
    "createdAt": "string | null - ISO 8601"
  }
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

# API - Dashboard

## [GET] /api/dashboard/summary
**Descripción:** Devuelve resumen del sistema. Requiere auth y permiso `dashboard:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** N/A
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "totals": {
    "users": "number - total usuarios",
    "activeUsers": "number - usuarios activos",
    "clients": "number - total clientes",
    "activeClients": "number - clientes activos",
    "suppliers": "number - total proveedores",
    "activeSuppliers": "number - proveedores activos",
    "products": "number - total productos",
    "activeProducts": "number - productos activos",
    "recepciones": "number - total recepciones"
  },
  "lowStockCount": "number - productos con bajo stock",
  "lowStockProducts": [
    {
      "id": "string - id del producto",
      "sku": "string - SKU",
      "nombre": "string - nombre",
      "stock": "number - stock",
      "stockMinimo": "number - stock minimo",
      "lowStock": "boolean - si esta bajo minimos",
      "activo": "boolean - estado"
    }
  ],
  "recepcionesRecientes": [
    {
      "id": "string - id de la recepcion",
      "folio": "string - folio",
      "supplierNombre": "string - proveedor",
      "fecha": "string - fecha",
      "status": "string - DRAFT|CONFIRMED",
      "total": "number - total",
      "createdAt": "string | null - ISO 8601"
    }
  ],
  "recentInventoryMovements": [
    {
      "id": "string - id del movimiento",
      "productId": "string - id del producto",
      "sku": "string - SKU",
      "productNombre": "string - nombre del producto",
      "tipo": "string - ENTRADA|SALIDA|AJUSTE",
      "cantidad": "number - cantidad",
      "stockAnterior": "number - stock anterior",
      "stockNuevo": "number - stock nuevo",
      "motivo": "string - motivo",
      "referencia": "string - referencia",
      "usuario": "string - usuario",
      "createdAt": "string | null - ISO 8601"
    }
  ],
  "recentAudit": [
    {
      "id": "string - id del registro",
      "action": "string - accion",
      "resource": "string - recurso",
      "resourceId": "string - id del recurso",
      "usuario": "string - usuario",
      "createdAt": "string | null - ISO 8601"
    }
  ]
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

## [GET] /api/dashboard/recent-activity
**Descripción:** Devuelve actividad reciente de auditoria. Requiere auth y permiso `dashboard:read`.

### Request
- **Headers:** Authorization: Bearer <token>
- **Params:** N/A
- **Query params:** `limit` (number, opcional)
- **Body:**
```json
{}
```

### Response exitosa
- **Status:** 200
```json
{
  "items": [
    {
      "id": "string - id del registro",
      "action": "string - accion",
      "resource": "string - recurso",
      "resourceId": "string - id del recurso",
      "details": "object - detalles",
      "userId": "string - id del usuario",
      "usuario": "string - usuario",
      "createdAt": "string | null - ISO 8601"
    }
  ],
  "total": "number - total items",
  "limit": "number - limite aplicado"
}
```

### Errores posibles
| Status | Causa |
|--------|-------|
| 400    | Error de validacion |
| 401    | No autorizado |
| 403    | Sin permisos |
| 500    | Error interno del servidor |

---

# Relaciones
- Roles y permisos: `POST /api/roles` y `PATCH /api/roles/:id` usan el campo `permissions` para asignar permisos al rol.
- Usuarios y roles/permisos: `POST /api/users` y `PATCH /api/users/:id` usan `role`, `roleId` y `permissions`.
- Recepciones, proveedores y productos: `POST /api/recepciones` y `PATCH /api/recepciones/:id` usan `supplierId` e `items[].productId`.
- Recepciones e inventario: `PATCH /api/recepciones/:id/confirm` genera movimientos de inventario y actualiza stock.

---

# Notas para el frontend!!!
- Todos los endpoints bajo /api requieren `Authorization: Bearer <token>` excepto `GET /api/health` y `POST /api/auth/login`.
- Los parametros `activo` y `lowStock` aceptan boolean o string "true"/"false".
- Muchos campos opcionales se normalizan a string vacio en la respuesta, `createdAt`, `updatedAt` y fechas de confirmacion si pueden ser null.
- `POST /api/permissions/seed` no requiere body.
- `PATCH /api/recepciones/:id/confirm` cambia el status a CONFIRMED y actualiza stock en productos, el response incluye `movements`.
- `POST /api/auth/login` puede devolver 403 si el usuario esta inactivo.
- `POST /api/auth/login` y `POST /api/users` trabajan con password en texto plano en el request, recuerden que el backend la hashea.
