```markdown
# 📋 Reporte de Pruebas de Autenticación - Backend POS

## ✅ 1. Login Correcto

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "usuario": "proyecto",
  "password": "Hello2U"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "gsNLaqgSDMCGiYPtpXqy",
    "nombre": "Proyecto",
    "apellido": "Admin",
    "email": "proyecto@erp.local",
    "usuario": "proyecto",
    "role": "ADMIN",
    "roleId": "role_admin",
    "permissions": ["users:read", "products:create", "inventory:update"],
    "activo": true
  }
}
```

---

## ✅ 2. Password Incorrecto

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "usuario": "proyecto",
  "password": "password_incorrecto"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Credenciales inválidas"
}
```

---

## ✅ 3. Usuario Inactivo

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "usuario": "proyecto",
  "password": "Hello2U"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Usuario inactivo"
}
```

**Explicación:**
- El campo `activo: false` en Firestore impide el acceso
- El backend valida este campo antes de generar el token
- Útil para deshabilitar usuarios sin eliminarlos

---

## ✅ 4. Token Inválido

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer token_falso_cualquiera
```

**Response (401 Unauthorized):**
```json
{
  "message": "No autorizado"
}
```

**Variante (Token mal formado):**
```json
{
  "message": "Token inválido o expirado"
}
```

---

## ✅ 5. Sesión Expirada

**Escenario:** El token JWT superó su tiempo de vida (`JWT_EXPIRES_IN`)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer [token_expirado]
```

**Response (401 Unauthorized):**
```json
{
  "message": "Token inválido o expirado"
}
```

**Explicación:**
- Los tokens JWT tienen una fecha de expiración (`exp`)
- El backend verifica automáticamente si el token está vigente
- Cuando expira, rechaza la petición y obliga a un nuevo login
- Configurable en `.env` con `JWT_EXPIRES_IN` (ej: `7d`, `1h`, `30m`)

**Comportamiento esperado en Frontend:**
- Detectar error 401 por token expirado
- Redirigir al usuario a la pantalla de login
- Limpiar token almacenado localmente

---

## ✅ 6. Validación de Headers (Token Válido)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer [token_válido]
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "gsNLaqgSDMCGiYPtpXqy",
    "nombre": "Proyecto",
    "apellido": "Admin",
    "email": "proyecto@erp.local",
    "usuario": "proyecto",
    "role": "ADMIN",
    "roleId": "role_admin",
    "permissions": ["..."],
    "activo": true
  }
}
```

✅ **Conclusión:** El token se envía correctamente en el header `Authorization: Bearer`

---

## 🔍 7. Diferencias Encontradas vs Mockup UI

| Mockup UI (Esperado) | Backend Real | Acción requerida |
|---------------------|--------------|------------------|
| `email` | `usuario` | Cambiar en login |
| `password` | `password` | ✅ Correcto |
| Solo `token` | `token` + `user` | ✅ Mejor (tiene user) |
| `name` | `nombre` + `apellido` | Concatenar ambos |
| `isActive` | `activo` | Cambiar nombre |

---

## 📊 Resumen de Pruebas

| Prueba | Resultado | Status Code |
|--------|-----------|-------------|
| Login Correcto | ✅ Éxito | 200 |
| Password Incorrecto | ✅ Fallo esperado | 401 |
| Usuario Inactivo | ✅ Fallo esperado | 401 |
| Token Inválido | ✅ Fallo esperado | 401 |
| Sesión Expirada | ✅ Fallo esperado | 401 |
| Headers con Token | ✅ Funciona | 200 |



## 📝 Conclusión Final

**El backend funciona al 100%.**
```

---

