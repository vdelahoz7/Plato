# Desplegar Plato (Vercel + Neon)

La app es full-stack (Next.js): frontend y backend se despliegan juntos en Vercel.
La base de datos va aparte, en Neon (Postgres en la nube).

## 1. Base de datos en Neon

1. Crea una cuenta en https://neon.tech (plan gratis).
2. Crea un proyecto → te da una **connection string** tipo:
   `postgresql://usuario:password@host.neon.tech/plato?sslmode=require`
3. Guárdala: la usarás como `DATABASE_URL` en producción.

## 2. Crear las tablas en Neon (una sola vez)

Desde tu máquina, apuntando a Neon:

```bash
DATABASE_URL="<tu-url-de-neon>" npx prisma migrate deploy
```

Esto crea las tablas (User, Session, Meal) en la base de datos de la nube.

## 3. Desplegar en Vercel

1. Entra a https://vercel.com e inicia sesión con GitHub.
2. **Add New → Project** → importa el repo `vdelahoz7/Plato`.
3. En **Environment Variables**, agrega:
   - `DATABASE_URL` = la connection string de Neon
   - `GEMINI_API_KEY` = tu clave de Gemini (https://aistudio.google.com)
4. **Deploy**. Vercel hace el build (incluye `prisma generate`) y te da tu URL pública.

## Notas

- Los archivos `.env` y `.env.local` NO se suben a git (están en `.gitignore`).
  Las claves viven solo en Vercel (producción) y en tu máquina (local).
- Para desarrollo local sigues usando Docker: `docker compose up -d` + `npm run dev`.
- Si cambias el esquema de la base de datos, corre `npx prisma migrate dev` en local
  y `npx prisma migrate deploy` (apuntando a Neon) para producción.
