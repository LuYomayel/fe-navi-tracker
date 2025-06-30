"use client";

import { useNaviState } from "@/hooks/useNaviState";
import { useXp } from "@/hooks/useXp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Heart, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { XpBar } from "@/components/xp/XpBar";
import { NaviControls } from "@/components/navi/NaviControls";

export default function NaviPage() {
  const { currentState, getNaviInfo, getNaviAdvice } = useNaviState();
  const { xpStats } = useXp();

  const naviInfo = getNaviInfo();
  const advice = getNaviAdvice();

  // Función para obtener descripción del estado
  const getStateDescription = (state: typeof currentState): string => {
    switch (state) {
      case "celebrating":
        return "Navi está celebrando tu increíble progreso. ¡Has subido de nivel!";
      case "happy":
        return "Navi se siente muy feliz contigo. Tu actividad de hoy lo emociona mucho.";
      case "sad":
        return "Navi se siente un poco triste, pero sabe que mañana será mejor.";
      case "sick":
        return "Navi te extraña mucho. Ha estado esperando que regreses.";
      case "sleepy":
        return "Navi tiene un poco de sueño, pero está listo para acompañarte.";
      default:
        return "Navi está aquí, listo para acompañarte en tu jornada diaria.";
    }
  };

  // Función para obtener el color del estado
  const getStateColor = (state: typeof currentState): string => {
    switch (state) {
      case "celebrating":
        return "bg-gradient-to-r from-yellow-400 to-orange-500";
      case "happy":
        return "bg-gradient-to-r from-green-400 to-emerald-500";
      case "sad":
        return "bg-gradient-to-r from-blue-400 to-blue-600";
      case "sick":
        return "bg-gradient-to-r from-purple-400 to-purple-600";
      case "sleepy":
        return "bg-gradient-to-r from-indigo-400 to-blue-500";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600";
    }
  };

  // Calcular estadísticas de relación con Navi
  const relationshipLevel = Math.min(
    100,
    Math.floor((xpStats?.totalXp || 0) / 50)
  );
  const daysTogether = Math.floor((xpStats?.totalXp || 0) / 25) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Conoce a Navi <span className="text-2xl">✨</span>
          </h1>
          <p className="text-lg text-gray-600">
            Tu compañero emocional en el viaje hacia mejores hábitos
          </p>
        </div>

        {/* Navi Principal */}
        <Card
          className={`${getStateColor(
            currentState
          )} text-white border-0 shadow-xl`}
        >
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Imagen de Navi */}
              <div className="relative">
                <div className="w-40 h-40 md:w-48 md:h-48 relative">
                  {/* Efecto de brillo para estados especiales */}
                  {(currentState === "celebrating" ||
                    currentState === "happy") && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse scale-110"></div>
                  )}

                  <Image
                    src={naviInfo.image}
                    alt={`Navi ${currentState}`}
                    fill
                    className={`object-contain drop-shadow-2xl ${
                      currentState === "celebrating"
                        ? "animate-bounce"
                        : "animate-float"
                    }`}
                    priority
                  />
                </div>

                {/* Badge de estado */}
                <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 shadow-lg">
                  {naviInfo.emoji}{" "}
                  {currentState.charAt(0).toUpperCase() + currentState.slice(1)}
                </Badge>
              </div>

              {/* Información de Navi */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">{naviInfo.message}</h2>
                <p className="text-lg mb-6 opacity-90">
                  {getStateDescription(currentState)}
                </p>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <Heart className="h-5 w-5 mb-1" />
                    <div className="text-sm opacity-80">Relación</div>
                    <div className="font-bold">{relationshipLevel}%</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <Calendar className="h-5 w-5 mb-1" />
                    <div className="text-sm opacity-80">Días juntos</div>
                    <div className="font-bold">{daysTogether}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de información */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Estado Emocional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Estado Emocional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Felicidad</span>
                    <span>
                      {currentState === "happy" ||
                      currentState === "celebrating"
                        ? "100%"
                        : currentState === "sad"
                        ? "20%"
                        : currentState === "sick"
                        ? "10%"
                        : currentState === "sleepy"
                        ? "40%"
                        : "70%"}
                    </span>
                  </div>
                  <Progress
                    value={
                      currentState === "happy" || currentState === "celebrating"
                        ? 100
                        : currentState === "sad"
                        ? 20
                        : currentState === "sick"
                        ? 10
                        : currentState === "sleepy"
                        ? 40
                        : 70
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Energía</span>
                    <span>
                      {currentState === "celebrating"
                        ? "100%"
                        : currentState === "happy"
                        ? "90%"
                        : currentState === "sleepy"
                        ? "30%"
                        : currentState === "sick"
                        ? "20%"
                        : currentState === "sad"
                        ? "50%"
                        : "80%"}
                    </span>
                  </div>
                  <Progress
                    value={
                      currentState === "celebrating"
                        ? 100
                        : currentState === "happy"
                        ? 90
                        : currentState === "sleepy"
                        ? 30
                        : currentState === "sick"
                        ? 20
                        : currentState === "sad"
                        ? 50
                        : 80
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Motivación</span>
                    <span>
                      {currentState === "celebrating" ||
                      currentState === "happy"
                        ? "100%"
                        : currentState === "sad"
                        ? "40%"
                        : currentState === "sick"
                        ? "25%"
                        : currentState === "sleepy"
                        ? "60%"
                        : "85%"}
                    </span>
                  </div>
                  <Progress
                    value={
                      currentState === "celebrating" || currentState === "happy"
                        ? 100
                        : currentState === "sad"
                        ? 40
                        : currentState === "sick"
                        ? 25
                        : currentState === "sleepy"
                        ? 60
                        : 85
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progreso Juntos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Nuestro Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <XpBar compact={false} />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {xpStats?.level || 1}
                    </div>
                    <div className="text-sm text-gray-600">Nivel Actual</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {xpStats?.streak || 0}
                    </div>
                    <div className="text-sm text-gray-600">Racha Días</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consejos de Navi */}
        <Card>
          <CardHeader>
            <CardTitle>Consejos de Navi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {advice.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-lg">{naviInfo.emoji}</span>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Navi */}
        <NaviControls />

        {/* Botón para volver */}
        <div className="text-center">
          <Button
            onClick={() => window.history.back()}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Volver a Hábitos
          </Button>
        </div>
      </div>
    </div>
  );
}
