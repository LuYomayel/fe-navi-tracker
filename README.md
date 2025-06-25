# 🏃‍♂️ NaviTracker - Aplicación de Seguimiento de Hábitos con IA

## ✅ **CORRECCIONES IMPLEMENTADAS** (Diciembre 2024)

### 🔧 **1. Error OpenAI Vision API Arreglado**

- **Problema**: Modelo `gpt-4-vision-preview` deprecado
- **Solución**: Actualizado a `gpt-4o` (modelo actual de OpenAI Vision)
- **Estado**: ✅ **FUNCIONAL**

### 💾 **2. Funcionalidad de Guardado Implementada**

- **Problema**: Botones de guardado no funcionaban para análisis nutricional y corporal
- **Solución**: Implementado sistema de guardado con localStorage
- **Funcionalidades**:
  - ✅ Guardar análisis de fotos de comida
  - ✅ Guardar análisis corporal con fotos
  - ✅ Notificaciones de confirmación
  - ✅ Persistencia de datos entre sesiones
- **Estado**: ✅ **FUNCIONAL**

### 🧠 **3. Contexto de Conversación en Chatbot**

- **Problema**: El chatbot no recordaba conversaciones anteriores
- **Solución**: Implementado sistema de contexto
- **Funcionalidades**:
  - ✅ Memoria de conversación (últimos 6 mensajes)
  - ✅ Respuestas más personalizadas
  - ✅ Continuidad en diálogos
- **Estado**: ✅ **FUNCIONAL**

### 📊 **4. Reconocimiento de Tablas de Hábitos**

- **Problema**: El chatbot no reconocía tablas de horarios/hábitos
- **Solución**: Implementado parser inteligente de tablas
- **Funcionalidades**:
  - ✅ Detección automática de tablas markdown
  - ✅ Extracción de actividades, horarios y categorías
  - ✅ Botón para agregar actividades al tracker
  - ✅ Categorización automática (salud, educación, trabajo, otros)
- **Estado**: ✅ **FUNCIONAL**

### 🗄️ **5. Conexión a Base de Datos**

- **Problema**: Las actividades no se guardaban permanentemente
- **Solución**: Configuración de MySQL + Prisma ORM
- **Estado**: ⚠️ **NECESITA CONFIGURACIÓN**

## 🧪 **Cómo Probar las Correcciones**

### **Test 1: Análisis Nutricional**

1. Abre la aplicación: `http://localhost:3000`
2. Click en "Centro Nutricional"
3. Ve a la pestaña "Seguimiento de Comidas"
4. Sube una foto de comida
5. ✅ Verifica que el análisis funcione (modelo `gpt-4o`)
6. ✅ Click "Guardar análisis" y verifica notificación

### **Test 2: Análisis Corporal**

1. Ve a la pestaña "Análisis Corporal"
2. Sube fotos o ingresa datos manualmente
3. ✅ Verifica que el análisis funcione
4. ✅ Click "Guardar análisis" y verifica notificación

### **Test 3: Chatbot con Contexto**

1. Abre el asistente IA
2. Pregunta: "Analiza mi progreso actual"
3. Luego pregunta algo relacionado
4. ✅ Verifica que recuerde el contexto de la conversación anterior

### **Test 4: Tabla de Hábitos**

1. En el chatbot, pega esta tabla:

```
| Hora     | Lunes         | Martes        | Miércoles      |
|----------|---------------|---------------|----------------|
| 08:00    | Stretching     | Stretching     | Stretching     |
| 08:30    | Lectura        | Lectura        | Lectura        |
| 09:00    | Empleo         | Empleo         | Empleo         |
| 11:00    | App desarrollo | App desarrollo | App desarrollo |
```

2. ✅ Verifica que el bot reconozca la tabla
3. ✅ Click "Agregar actividades detectadas"
4. ✅ Verifica que aparezcan en tu calendario

## 🚀 **NaviTracker - Aplicación de Seguimiento de Hábitos con IA**

Una aplicación web moderna y completa para el seguimiento inteligente de hábitos diarios, desarrollada con **Next.js 14**, **TypeScript**, **Tailwind CSS**, y potenciada por **OpenAI GPT-4**.

## ✨ **Características Principales**

### 📅 **Calendario Inteligente**

- **Vista semanal** con navegación fluida
- **Seguimiento de actividades** con completado visual
- **Gestión de hábitos** por categorías (salud, trabajo, educación, etc.)
- **Notas diarias** con análisis de estado de ánimo
- **Estadísticas de progreso** en tiempo real

### 🍽️ **Centro Nutricional Completo**

- **📊 Resumen Nutricional**: Dashboard con estadísticas diarias y semanales
- **📸 Análisis de Comidas**:
  - Sube fotos de tus comidas
  - IA analiza automáticamente ingredientes y valores nutricionales
  - Cálculo preciso de calorías y macronutrientes
  - Recomendaciones personalizadas
- **👤 Análisis Corporal**:
  - Análisis por fotos (frente, perfil, espalda)
  - Análisis manual con datos básicos
  - Detección de tipo corporal (Ectomorfo, Mesomorfo, Endomorfo)
  - Cálculo de IMC y recomendaciones personalizadas
  - Plan nutricional adaptado a tu tipo corporal

### 🤖 **Asistente IA Avanzado**

- **Chat inteligente** con memoria de conversación
- **Reconocimiento de tablas** de hábitos para importación automática
- **Análisis de progreso** personalizado
- **Sugerencias contextuales** basadas en tu historial
- **Consejos motivacionales** y estrategias respaldadas por evidencia

### 📖 **Asistente de Lectura**

- Seguimiento de libros y páginas leídas
- Recomendaciones personalizadas de literatura
- Análisis de hábitos de lectura

## 🛠️ **Stack Tecnológico**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS, Componentes UI custom
- **Estado**: Zustand con persistencia automática
- **Base de Datos**: Prisma ORM + MySQL
- **IA**: OpenAI GPT-4 y GPT-4 Vision
- **Despliegue**: Optimizado para Vercel

## 🚀 **Instalación y Configuración**

### Prerrequisitos

- Node.js 18+
- npm o yarn
- MySQL database
- Cuenta de OpenAI con API key

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd habit-tracker
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**
   Crea un archivo `.env.local`:

```env
# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_de_openai

# Database Configuration
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/habit_tracker"
```

4. **Configurar la base de datos**

```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📋 **APIs y Endpoints**

### `/api/ai-suggestions`

**Asistente de chat inteligente**

- Método: `POST`
- Parámetros: `message`, `chatHistory`, `context`
- Funcionalidades:
  - Consejos personalizados de hábitos
  - Reconocimiento y parsing de tablas de horarios
  - Análisis de progreso con contexto
  - Memoria de conversación

### `/api/analyze-food`

**Análisis nutricional con IA**

- Método: `POST`
- Parámetros: `image` (base64)
- Funcionalidades:
  - Análisis automático de fotos de comida
  - Detección de ingredientes y cantidades
  - Cálculo de valores nutricionales
  - Recomendaciones dietéticas

## 🎯 **Cómo Usar la Aplicación**

### **Configuración Inicial**

1. Abre la aplicación en tu navegador
2. El calendario semanal aparece como vista principal
3. Usa el botón "+" para agregar nuevas actividades/hábitos

### **Gestión de Hábitos**

- **Agregar actividad**: Click en "+" → completa el formulario
- **Marcar completado**: Click en el círculo de cada actividad
- **Ver estadísticas**: Los porcentajes se actualizan automáticamente
- **Notas diarias**: Click en cualquier día para agregar reflexiones

### **Centro Nutricional**

1. **Acceso**: Click en "Centro Nutricional" desde el calendario
2. **Análisis de Comidas**:
   - Pestaña "Seguimiento de Comidas"
   - Sube foto → Analizar → Guardar
3. **Análisis Corporal**:
   - Pestaña "Análisis Corporal"
   - Sube fotos o ingresa datos → Analizar → Guardar

### **Asistente IA**

1. **Chat básico**: Pregunta sobre hábitos, motivación, etc.
2. **Importar tabla de hábitos**:
   - Pega una tabla markdown con tu horario
   - El bot detectará automáticamente las actividades
   - Click "Agregar actividades detectadas"
3. **Análisis de progreso**: Pregunta "Analiza mi progreso actual"

## 🎨 **Funcionalidades Especiales**

### **Modo Oscuro/Claro**

- Toggle automático según preferencias del sistema
- Persistencia de configuración

### **Categorías de Actividades**

- 🏃‍♂️ **Salud**: Ejercicio, meditación, caminatas
- 📚 **Educación**: Lectura, cursos, estudio
- 💼 **Trabajo**: Desarrollo, reuniones, proyectos
- 🎯 **Personal**: Hobbies, tiempo libre, social
- 🌟 **Otros**: Actividades no categorizadas

### **Análisis Inteligente**

- **Patrones de comportamiento**: Detección automática de tendencias
- **Sugerencias personalizadas**: Basadas en tu historial y objetivos
- **Recordatorios inteligentes**: Notificaciones contextuales

## 🔮 **Roadmap y Funcionalidades Futuras**

### **Versión 2.0 (Próximas funcionalidades)**

- 🔐 **Autenticación de usuarios** y perfiles múltiples
- 📊 **Dashboard avanzado** con métricas detalladas
- 🏆 **Sistema de logros** y gamificación
- 📱 **Aplicación móvil** (React Native)
- 🔔 **Notificaciones push** personalizadas
- 📈 **Exportación de datos** (PDF, Excel, CSV)
- 🤝 **Integración con wearables** (Fitbit, Apple Watch)
- 🌐 **Modo offline** con sincronización automática

### **Integraciones Planificadas**

- **Google Calendar** sincronización bidireccional
- **Spotify/Apple Music** para hábitos de relajación
- **MyFitnessPal** para datos nutricionales extendidos
- **Strava** para seguimiento de actividad física

## 🤝 **Contribuciones**

Este proyecto está abierto a contribuciones. Si encuentras bugs o tienes ideas para nuevas funcionalidades:

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🙏 **Agradecimientos**

- **OpenAI** por las increíbles APIs de GPT-4 y Vision
- **Vercel** por la plataforma de deployment
- **Tailwind CSS** por el sistema de diseño
- **Prisma** por el ORM intuitivo
- **Zustand** por la gestión de estado simplificada

---

**¿Listo para transformar tus hábitos? 🚀**

Comienza tu viaje hacia una vida más organizada y productiva con NaviTracker.

_"Los hábitos no son un destino, sino un camino. NaviTracker te acompaña en cada paso."_ ✨

## ⚠️ **CONFIGURACIÓN REQUERIDA: Base de Datos**

**¿Por qué no se guardan mis actividades?**
La aplicación necesita una base de datos MySQL configurada. Por ahora usa localStorage como respaldo.

### **🚀 Configuración Rápida (XAMPP - Recomendado)**

1. **Instalar XAMPP**

   - Descargar: https://www.apachefriends.org/
   - Instalar y abrir XAMPP Control Panel
   - Click "Start" en MySQL

2. **Crear base de datos**

   - Ir a: http://localhost/phpmyadmin/
   - Click "Nueva" → Nombre: `navitracker` → "Crear"

3. **Configurar variables**
   Editar `.env.local`:

   ```env
   DATABASE_URL="mysql://root:@localhost:3306/navitracker"
   OPENAI_API_KEY=tu_api_key_aqui
   ```

4. **Sincronizar esquema**
   ```bash
   npx prisma db push
   npm run dev
   ```

### **🌐 Alternativa: Railway (Nube)**

1. Crear cuenta en [Railway.app](https://railway.app/)
2. "New Project" → "Provision MySQL"
3. Copiar DATABASE_URL y pegar en `.env.local`
4. Ejecutar `npx prisma db push`

**📋 Ver instrucciones completas:** `INSTRUCCIONES_BASE_DATOS.md`
