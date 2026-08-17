import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function FilterBar({ sigFilter, setSigFilter, origemFilter, setOrigemFilter, search, setSearch }) {
  const sigOptions = [
    { value: '', label: 'Todas' },
    { value: 'SMT', label: 'RS (SMT)' },
    { value: 'SM3', label: 'SC (SM3)' },
  ];
  const origemOptions = [
    { value: '', label: 'Todas' },
    { value: 'Importado', label: 'Importado' },
    { value: 'Nacional', label: 'Nacional' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar família..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground px-1">Filial</span>
          <div className="flex rounded-lg border bg-card p-1 gap-1">
            {sigOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSigFilter(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  sigFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground px-1">Origem</span>
          <div className="flex rounded-lg border bg-card p-1 gap-1">
            {origemOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setOrigemFilter(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  origemFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}