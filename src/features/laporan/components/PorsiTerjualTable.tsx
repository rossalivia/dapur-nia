import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PorsiTerjualTableProps {
  porsiPerMenu: Record<string, number>;
}

export const PorsiTerjualTable: React.FC<PorsiTerjualTableProps> = ({ porsiPerMenu }) => {
  const menuEntries = Object.entries(porsiPerMenu).sort((a, b) => b[1] - a[1]);

  if (menuEntries.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card shadow-sm border border-border/80 overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/60">
        <CardTitle className="text-sm font-semibold text-foreground">
          Rincian Penjualan per Menu
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Nama Menu</TableHead>
              <TableHead className="text-xs text-right w-28">Porsi Terjual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuEntries.map(([menuName, porsi]) => (
              <TableRow key={menuName}>
                <TableCell className="font-medium text-xs">{menuName}</TableCell>
                <TableCell className="text-right text-xs font-bold text-primary">
                  {porsi} porsi
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
