# Frontend Product Inventory

## Descripción

Frontend administrativo desarrollado con **Next.js + React + TailwindCSS + DaisyUI**, que consume la API del backend. (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

---

## Requisitos

* Node.js >= 18
* npm >= 9

---

## Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPO>
```

Instalar dependencias:

```bash
npm install
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## ▶ Ejecutar proyecto

```bash
npm run dev
```

Abrir en navegador:

```
http://localhost:3000
```

---

## Estructura del proyecto

```bash
src/
  app/
    layout.tsx        # layout global
    page.tsx          # home
    dashboard/
      layout.tsx      # layout admin
      page.tsx
      users/
        page.tsx
  components/
  services/
  types/
  store/
  styles/
```