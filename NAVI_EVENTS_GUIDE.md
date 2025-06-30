# Guía de Eventos de Navi - Sistema de Gamificación

Esta guía detalla todos los eventos que deben dispararse para que Navi reaccione correctamente a las acciones del usuario.

## 📋 Lista Completa de Eventos

### 1. **habit-completed** (+10 XP)

- **Cuándo**: Al marcar un hábito como completado
- **Dónde disparar**: En el componente de checkbox de hábitos o WeeklyCalendar
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("habit-completed"));
```

### 2. **day-completed** (+50 XP bonus)

- **Cuándo**: Al completar TODOS los hábitos asignados del día
- **Dónde disparar**: En la lógica que verifica si todos los hábitos del día están completos
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("day-completed"));
```

### 3. **streak-3-days** (+20 XP bonus)

- **Cuándo**: Al mantener una racha de exactamente 3 días
- **Dónde disparar**: En el backend XpService cuando se detecta racha de 3 días
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("streak-3-days"));
```

### 4. **streak-7-days** (+60 XP bonus)

- **Cuándo**: Al mantener una racha de exactamente 7 días
- **Dónde disparar**: En el backend XpService cuando se detecta racha de 7 días
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("streak-7-days"));
```

### 5. **perfect-week** (+200 XP gran bonus)

- **Cuándo**: Al completar una semana perfecta (7 días seguidos con 100% de hábitos)
- **Dónde disparar**: En una lógica semanal que verifique semanas perfectas (cron o verificación diaria)
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("perfect-week"));
```

### 6. **habit-created** (+30 XP)

- **Cuándo**: Al crear un nuevo hábito manualmente
- **Dónde disparar**: En el formulario de creación de hábitos después de guardar exitosamente
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("habit-created"));
```

### 7. **habit-created-by-ai** (+40 XP)

- **Cuándo**: Al aceptar una sugerencia de IA y agregarla como hábito
- **Dónde disparar**: En el componente de sugerencias de IA al aceptar una sugerencia
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("habit-created-by-ai"));
```

### 8. **nutrition-log** (+15 XP)

- **Cuándo**: Al subir foto de comida y registrar el análisis nutricional
- **Dónde disparar**: En NutritionAnalyzer después de guardar exitosamente el análisis
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("nutrition-log"));
```

### 9. **nutrition-goal-met** (+25 XP)

- **Cuándo**: Al cumplir el objetivo calórico/macros del día
- **Dónde disparar**: En un cron diario que verifique si se cumplieron los objetivos nutricionales
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("nutrition-goal-met"));
```

### 10. **daily-reflection** (+5 XP)

- **Cuándo**: Al escribir una reflexión diaria/comentario sobre el día
- **Dónde disparar**: En DailyReflection después de guardar la nota exitosamente
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("daily-reflection"));
```

### 11. **level-up** (Evento especial)

- **Cuándo**: Al subir de nivel
- **Dónde disparar**: En el hook useXp cuando se detecta level up
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("level-up"));
```

### 12. **streak-bonus** (Evento general)

- **Cuándo**: Al recibir cualquier bonus de racha
- **Dónde disparar**: En el backend cuando se otorga bonus de racha
- **Código**:

```javascript
window.dispatchEvent(new CustomEvent("streak-bonus"));
```

## 🚀 Implementación Recomendada

### Frontend (React)

1. **WeeklyCalendar.tsx**: Disparar `habit-completed` y verificar `day-completed`
2. **NutritionAnalyzer.tsx**: Disparar `nutrition-log`
3. **DailyReflection.tsx**: Disparar `daily-reflection`
4. **Formularios de hábitos**: Disparar `habit-created`
5. **Componentes de IA**: Disparar `habit-created-by-ai`

### Backend (NestJS)

1. **XpService**: Disparar eventos de racha (`streak-3-days`, `streak-7-days`, `streak-bonus`)
2. **Cron Jobs**:
   - Verificar `perfect-week` semanalmente
   - Verificar `nutrition-goal-met` diariamente

### Hook useXp

- Disparar `level-up` cuando se detecte subida de nivel
- Coordinar con el backend para eventos de racha

## 📝 Notas de Implementación

### Para el objetivo nutricional diario:

```javascript
// Ejemplo de cron job diario (backend)
@Cron('0 23 59 * * *') // 23:59 cada día
async checkDailyNutritionGoals() {
  const users = await this.getUsersWithNutritionGoals();

  for (const user of users) {
    const todayNutrition = await this.getTodayNutrition(user.id);
    const goals = await this.getUserNutritionGoals(user.id);

    if (this.hasMetNutritionGoals(todayNutrition, goals)) {
      await this.xpService.addXp(user.id, {
        action: XpAction.NUTRITION_GOAL_MET,
        xpAmount: 25,
        description: "Objetivos nutricionales cumplidos"
      });

      // Notificar al frontend si el usuario está activo
      this.eventEmitter.emit('nutrition-goal-met', { userId: user.id });
    }
  }
}
```

### Para semana perfecta:

```javascript
// Ejemplo de verificación semanal
@Cron('0 0 1 * * MON') // Lunes a medianoche
async checkPerfectWeeks() {
  const users = await this.getActiveUsers();

  for (const user of users) {
    const lastWeekStats = await this.getLastWeekStats(user.id);

    if (lastWeekStats.completionRate === 100) {
      await this.xpService.addXp(user.id, {
        action: XpAction.PERFECT_WEEK,
        xpAmount: 200,
        description: "¡Semana perfecta!"
      });

      this.eventEmitter.emit('perfect-week', { userId: user.id });
    }
  }
}
```

## 🎯 Estados de Navi

Con estos eventos, Navi tendrá los siguientes estados reactivos:

1. **celebrating**: Level up, semana perfecta
2. **excited**: Racha de 7+ días
3. **proud**: Racha de 3-6 días, objetivos cumplidos
4. **happy**: Actividad diaria, XP ganada
5. **sad**: Racha rota recientemente
6. **sick**: 3+ días sin actividad
7. **sleepy**: 1 día sin actividad
8. **default**: Estado normal

¡Con esta implementación, Navi será súper reactivo y motivacional! 🎉
