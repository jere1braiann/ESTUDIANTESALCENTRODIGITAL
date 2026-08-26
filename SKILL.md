---
name: estudiantes-al-centro-skills
description: Documento que detalla el stack tecnológico y las capacidades funcionales principales de la plataforma Estudiantes al Centro.
---

# Habilidades y Capacidades del Proyecto (Project Skills)

Este documento detalla tanto las **habilidades técnicas (Tech Stack)** utilizadas para construir el proyecto, como las **habilidades funcionales (Features)** que la plataforma "Estudiantes al Centro" es capaz de realizar.

## 🛠️ Habilidades Técnicas (Tech Stack)

El proyecto está construido bajo una arquitectura Full-Stack utilizando un entorno moderno de JavaScript/TypeScript:

### Frontend
*   **React (v19)**: Biblioteca principal para la construcción de interfaces de usuario.
*   **TypeScript**: Tipado estático para garantizar un código seguro y escalable.
*   **Vite (v6)**: Entorno de desarrollo y empaquetador ultrarrápido.
*   **Tailwind CSS (v4)**: Framework de utilidades CSS para un diseño ágil y responsivo.
*   **Lucide React**: Biblioteca de íconos SVG limpios y modernos.
*   **Motion**: Utilizado para las animaciones y transiciones fluidas de la interfaz.
*   **Canvas Confetti**: Efectos visuales interactivos (ej. al finalizar una votación o acción exitosa).

### Backend & Base de Datos
*   **Node.js & Express**: Servidor backend para la provisión de APIs RESTful (`/api/*`).
*   **Prisma ORM**: Mapeador objeto-relacional moderno configurado para conectarse a la base de datos.
*   **SQLite**: Motor de base de datos ligero configurado a través de Prisma (escalable a PostgreSQL/SQL Server si es necesario).
*   **TSX**: Ejecución nativa de TypeScript en el entorno de desarrollo de Node.

### DevOps & Despliegue
*   **GitHub Actions**: Flujos de trabajo automatizados CI/CD configurados (`.github/workflows`).
*   **Azure Web Apps**: Configuración preparada para el despliegue automático en la nube de Microsoft Azure.

---

## 🎯 Habilidades Funcionales (Core Features)

La plataforma es un sistema integral para la gestión de Centros de Estudiantes, ofreciendo un portal público para el alumnado y portales privados basados en roles.

### 1. Sistema de Roles y Permisos (RBAC)
La aplicación cuenta con control de acceso basado en roles para segmentar las capacidades:
*   **Super Admin**: Gestión global del sistema (ej. Agencia Córdoba Joven).
*   **Admin CD (Comisión Directiva)**: Gestión interna del Centro de Estudiantes de una escuela.
*   **Admin Junta (Junta Electoral)**: Gestión exclusiva de los procesos electorales de la escuela.

### 2. Gestión Electoral y Votación 🗳️
*   **Biombo de Votación Digital**: Interfaz segura para que los estudiantes emitan su voto de forma presencial.
*   **Gestión de Listas y Fórmulas**: Creación y validación de agrupaciones políticas estudiantiles.
*   **Manejo del Padrón**: Registro de estudiantes habilitados para votar.
*   **Escrutinio y Resultados**: Conteo automatizado y presentación de métricas y estados (Abierta, Cerrada, Escrutinio).

### 3. Portal de Transparencia y Finanzas 💰
*   **Libro de Caja**: Registro de ingresos y egresos del centro de estudiantes.
*   **Aprobación por Asesores**: Flujo de validación para los movimientos financieros.
*   **Visibilidad Pública**: Los estudiantes pueden auditar los fondos desde el portal público de invitados.

### 4. Comunicación Institucional 📰
*   **Tablón de Noticias**: Creación, edición y publicación de novedades, alertas y eventos.
*   **Sistema de Borradores**: Las noticias pueden ser guardadas como borrador antes de su publicación definitiva.

### 5. Documentación y Actas 📄
*   **Gestión de Actas**: Registro de minutas, reuniones y asambleas.
*   **Historial de Decisiones**: Repositorio documental accesible para el centro y, opcionalmente, para el alumnado.

### 6. Multi-Tenancy (Multi-Escuela) 🏫
*   La arquitectura y el diseño de la base de datos están preparados para manejar múltiples instituciones educativas de forma simultánea, aislando los datos (noticias, elecciones, finanzas) según el `schoolId` del usuario autenticado.
