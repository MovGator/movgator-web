"use client";
import { useAuth } from "@/lib/auth-context";
import { SplashScreen } from "./SplashScreen";

export function SplashScreenWrapper() {
  const { splashDone } = useAuth();
  if (!splashDone) return <SplashScreen onComplete={() => {}} />;
  return null;
}