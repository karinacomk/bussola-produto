import { Brain, Map, MapPin, Plane, Star, Users } from "lucide-react";
import type { IconName } from "@/lib/compass";

const icons = { "map-pin": MapPin, star: Star, map: Map, plane: Plane, users: Users, brain: Brain };

export function ModuleIcon({ name, className }: { name: IconName; className?: string }) {
  const I = icons[name];
  return <I className={className} strokeWidth={1.4} />;
}
