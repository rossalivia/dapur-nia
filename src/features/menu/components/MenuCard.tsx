import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu } from '@/types';
import { formatRupiah } from '@/lib/formatters';
import { Edit2, Trash2, UtensilsCrossed } from 'lucide-react';

interface MenuCardProps {
  menu: Menu;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ menu, onEdit, onDelete }) => {
  const isOutOfStock = menu.sisa_porsi === 0;

  return (
    <Card className={`relative overflow-hidden transition-all shadow-sm ${isOutOfStock ? 'bg-muted/40 border-dashed' : 'bg-card'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={`font-semibold text-base truncate ${isOutOfStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                {menu.nama}
              </h3>
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0">
                  Habis
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Sisa: {menu.sisa_porsi} porsi
                </Badge>
              )}
              {!menu.tersedia && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                  Disembunyikan
                </Badge>
              )}
            </div>
            <div className="text-sm font-bold text-primary">
              {formatRupiah(menu.harga)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ porsi</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(menu)}
              aria-label="Ubah Menu"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
              onClick={() => menu.id && onDelete(menu.id)}
              aria-label="Hapus Menu"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
