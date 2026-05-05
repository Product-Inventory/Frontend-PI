## ¿Para qué sirve este documento?

- Este documento les deberia servir para entender exactamente como consumir cada endpoint de la API, que esperar en las respuestas y como manejar los errores.

- Mi intencion es que sea una guia completa que ayude en el desarrollo del frontend :).

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

