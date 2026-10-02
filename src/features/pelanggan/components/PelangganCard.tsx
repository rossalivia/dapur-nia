import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pelanggan } from '@/types';
import { Phone, MapPin, Edit2, Trash2, MessageCircle } from 'lucide-react';

interface PelangganCardProps {
  pelanggan: Pelanggan;
  onEdit: (pelanggan: Pelanggan) => void;
  onDelete: (no_whatsapp: string) => void;
}

export const PelangganCard: React.FC<PelangganCardProps> = ({
  pelanggan,
  onEdit,
  onDelete,
}) => {
  // Convert 08xxx to 628xxx for WhatsApp direct URL
  const waUrl = pelanggan.no_whatsapp.startsWith('0')
    ? `https://wa.me/62${pelanggan.no_whatsapp.slice(1)}`
    : `https://wa.me/${pelanggan.no_whatsapp}`;

  return (
    <Card className="overflow-hidden shadow-sm bg-card hover:border-primary/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-foreground mb-1">
              {pelanggan.nama}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-mono font-medium">{pelanggan.no_whatsapp}</span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-1.5 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded"
              >
                <MessageCircle className="h-3 w-3" />
                Chat WA
              </a>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-relaxed">{pelanggan.alamat}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(pelanggan)}
              aria-label="Ubah Pelanggan"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(pelanggan.no_whatsapp)}
              aria-label="Hapus Pelanggan"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
