import { createContext } from "react";
import type { IEimzoContext } from "@islom929/react-eimzo";

export const EimzoContext = createContext<IEimzoContext | null>(null);
