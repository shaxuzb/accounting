import {
  BookOpen,
  Box,
  Building2,
  ChartColumnBig,
  CircleHelp,
  KeyRound,
  Landmark,
  Rocket,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
  type LucideProps,
} from "lucide-react";

const icons = {
  rocket: Rocket,
  cart: ShoppingCart,
  box: Box,
  bag: ShoppingBag,
  bank: Landmark,
  cash: Wallet,
  book: BookOpen,
  chart: ChartColumnBig,
  building: Building2,
  users: Users,
  key: KeyRound,
  help: CircleHelp,
} as const;

/** A section's icon by its name in the content. */
export function SectionIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? BookOpen;
  return <Icon {...props} />;
}
