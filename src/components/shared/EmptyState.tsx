import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({ onCreate }: { onCreate: () => void }) { return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm"><PackagePlus className="mx-auto size-10 text-emerald-600" /><p className="mt-4 text-sm text-muted-foreground">Aún no tienes pedidos. Crea tu primera solicitud.</p><Button className="mt-5" onClick={onCreate}><PackagePlus className="size-4" />Solicitar envío</Button></div>; }
