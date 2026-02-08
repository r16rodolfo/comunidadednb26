import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Check, Link2, MapPin } from "lucide-react";
import { UnmatchedLocation, mockLocationAggregates } from "@/data/mock-planner-admin";
import { useToast } from "@/hooks/use-toast";

interface UnmatchedLocationsCardProps {
  locations: UnmatchedLocation[];
}

export function UnmatchedLocationsCard({ locations }: UnmatchedLocationsCardProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(locations);
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>({});

  const knownLocations = mockLocationAggregates.map((l) => l.name);

  const handleMap = (rawName: string) => {
    const target = selectedMappings[rawName];
    if (!target) return;

    setItems((prev) => prev.filter((l) => l.rawName !== rawName));
    toast({
      title: "Local mapeado!",
      description: `"${rawName}" foi vinculado a "${target}". Futuras ocorrências serão normalizadas.`,
    });
  };

  const handleCreateNew = (rawName: string) => {
    setItems((prev) => prev.filter((l) => l.rawName !== rawName));
    toast({
      title: "Novo local criado!",
      description: `"${rawName}" foi adicionado ao catálogo como um local independente.`,
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Check className="h-10 w-10 mx-auto mb-2 text-success" />
          <p className="font-medium">Todos os locais estão mapeados!</p>
          <p className="text-sm">Nenhuma entrada pendente de normalização.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <CardTitle className="text-lg">Locais Não Mapeados</CardTitle>
            <CardDescription>
              Entradas digitadas pelos usuários que precisam ser vinculadas a locais conhecidos
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto text-warning border-warning/40">
            {items.length} pendente{items.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entrada Digitada</TableHead>
                <TableHead className="text-center">Ocorrências</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Vincular a</TableHead>
                <TableHead className="w-[140px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((loc) => (
                <TableRow key={loc.rawName}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">"{loc.rawName}"</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{loc.occurrences}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">{loc.users.join(", ")}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={selectedMappings[loc.rawName] || ""}
                      onValueChange={(v) =>
                        setSelectedMappings((prev) => ({ ...prev, [loc.rawName]: v }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-48">
                        <SelectValue placeholder={loc.suggestedMatch ? `Sugestão: ${loc.suggestedMatch}` : "Selecionar..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {knownLocations.map((name) => (
                          <SelectItem key={name} value={name} className="text-xs">
                            {name}
                            {name === loc.suggestedMatch && (
                              <span className="text-success ml-1">★</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={!selectedMappings[loc.rawName]}
                        onClick={() => handleMap(loc.rawName)}
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        Vincular
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleCreateNew(loc.rawName)}
                      >
                        Criar Novo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
