"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export default function ThemeProvider({ children, ...props }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <NextThemesProvider {...(props as any)}>{children}</NextThemesProvider>;
}
