import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu } from '@/types';
import { formatRupiah } from '@/lib/formatters';
import { Edit2, Trash2, ShoppingBag } from 'lucide-react';
import { UserRole } from '@/features/auth/types';

interface MenuCardProps {
  menu: Menu;
  onEdit?: (menu: Menu) => void;
  onDelete?: (id: string) => void;
  onOrder?: (menu: Menu) => void;
  role?: UserRole | null;
}

function getFoodEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('ayam')) return '🍗';
  if (n.includes('nasi')) return '🍛';
  if (n.includes('sapi') || n.includes('daging') || n.includes('rendang')) return '🥩';
  if (n.includes('ikan')) return '🐟';
  if (n.includes('udang') || n.includes('cumi')) return '🍤';
  if (n.includes('sayur') || n.includes('capcay') || n.includes('sop') || n.includes('salad')) return '🥗';
  if (n.includes('mie') || n.includes('bihun')) return '🍜';
  if (n.includes('tahu') || n.includes('tempe')) return '🧈';
  if (n.includes('telur') || n.includes('telor')) return '🍳';
  return '🍱';
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  onEdit,
  onDelete,
  onOrder,
  role = 'admin',
}) => {
  const isOutOfStock = menu.sisa_porsi === 0;
  const isLowStock = menu.sisa_porsi > 0 && menu.sisa_porsi <= 5;
  const foodEmoji = getFoodEmoji(menu.nama);

  return (
    <Card
      className={`relative overflow-hidden transition-all shadow-xs hover:shadow-sm ${
        isOutOfStock
          ? 'bg-muted/40 border-dashed opacity-85'
          : 'bg-card hover:border-primary/40'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Food Avatar / Emoji */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-2xs border ${
                isOutOfStock
                  ? 'bg-muted border-border/50 opacity-60'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              {foodEmoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <h3
                  className={`font-semibold text-sm truncate ${
                    isOutOfStock ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {menu.nama}
                </h3>

                {isOutOfStock ? (
                  <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0">
                    Habis
                  </Badge>
                ) : isLowStock ? (
                  <Badge className="text-[10px] font-bold px-1.5 py-0 bg-amber-500 hover:bg-amber-600 text-white">
                    🔥 Sisa {menu.sisa_porsi} porsi!
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium px-1.5 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    Sisa: {menu.sisa_porsi} porsi
                  </Badge>
                )}

                {role === 'admin' && !menu.tersedia && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0 border-dashed">
                    Disembunyikan
                  </Badge>
                )}
              </div>

              <div className="text-sm font-extrabold text-primary">
                {formatRupiah(menu.harga)}
                <span className="text-[11px] font-normal text-muted-foreground ml-1">/ porsi</span>
              </div>
            </div>
          </div>

          {/* Aksi Berdasarkan Peran */}
          {role === 'pelanggan' ? (
            <div className="shrink-0 flex items-center">
              <Button
                size="sm"
                disabled={isOutOfStock}
                onClick={() => onOrder && onOrder(menu)}
                className={`h-8 text-xs gap-1.5 shadow-xs font-semibold ${
                  isOutOfStock ? 'opacity-50' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {isOutOfStock ? 'Habis' : 'Pesan'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(menu)}
                  aria-label="Ubah Menu"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => menu.id && onDelete(menu.id)}
                  aria-label="Hapus Menu"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
