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