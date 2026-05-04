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
