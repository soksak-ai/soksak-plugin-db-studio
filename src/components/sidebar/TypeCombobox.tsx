// Searchable data-type combobox — replaces the plain <Select> for column types.
// Filters the dialect's suggestion list as you type and lets you enter a custom
// parametrized type (VARCHAR(100), DECIMAL(12,2)…) that the list can't enumerate.
import { useMemo, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { filterTypeOptions } from '@/features/column-type/filter';
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react';

interface TypeComboboxProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  className?: string;
  // data-node 노출용 접미(주소 그램마 [a-z0-9.-] 준수 슬러그). base 는 'coltype' 고정.
  nodeSuffix?: string;
}

export function TypeCombobox({ value, options, onChange, className, nodeSuffix }: TypeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { matches, custom } = useMemo(() => filterTypeOptions(options, query), [options, query]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          data-node={nodeSuffix ? `coltype/${nodeSuffix}` : undefined}
          className={cn(
            'flex h-6 min-w-0 flex-1 items-center justify-between gap-1 rounded-md border border-input bg-transparent px-2 text-[11px]',
            'hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring',
            className,
          )}
        >
          <span className="truncate">{value || '타입 선택'}</span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        {/* cmdk 자체 필터 비활성 — filterTypeOptions 로 매칭+커스텀을 직접 제어. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="타입 검색 또는 입력…"
            value={query}
            onValueChange={setQuery}
            data-node={nodeSuffix ? `coltype/${nodeSuffix}-input` : undefined}
          />
          <CommandList>
            {matches.length === 0 && !custom && <CommandEmpty>일치하는 타입 없음</CommandEmpty>}
            {/* 커스텀 값을 최상단에 — 타이핑 후 Enter 로 바로 확정된다. */}
            {custom && (
              <CommandGroup heading="사용자 지정">
                <CommandItem value={`__custom__ ${custom}`} onSelect={() => commit(custom)}>
                  "{custom}" 사용
                </CommandItem>
              </CommandGroup>
            )}
            {matches.length > 0 && (
              <CommandGroup heading="타입">
                {matches.map((t) => (
                  <CommandItem key={t} value={t} onSelect={() => commit(t)}>
                    {t}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
