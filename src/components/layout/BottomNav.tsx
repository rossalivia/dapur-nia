import React from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, Users, ShoppingBag, BarChart3 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/menu', label: 'Menu', icon: Utensils },
    { to: '/pelanggan', label: 'Pelanggan', icon: Users },
    { to: '/pesanan', label: 'Pesanan', icon: ShoppingBag },
    { to: '/laporan', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold scale-105'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center h-8 w-12 rounded-full mb-0.5 transition-colors ${
                      isActive ? 'bg-primary/15 text-primary' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
