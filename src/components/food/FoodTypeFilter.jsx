import React from 'react';
import { LayoutGrid, ShoppingBasket, Package, Soup, CreditCard, Sprout } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { FOOD_TYPES, FOOD_TYPE_KEYS } from '@/lib/constants';
import Speakable from '@/components/common/Speakable';

const TYPE_ICONS = {
  all: LayoutGrid,
  food_bank: ShoppingBasket,
  pantry: Package,
  hot_meals: Soup,
  snap_friendly: CreditCard,
  community_farm: Sprout,
};

export default function FoodTypeFilter({ value, onChange }) {
  const { t } = usePrefs();
  const options = ['all', ...FOOD_TYPES];

  return (
    <Speakable className="mb-3" controls>
      <div className="r-scroll-x" role="group" aria-label={t('food.typeFilter')}>
      {options.map((option) => {
        const Icon = TYPE_ICONS[option];
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`r-tap r-chip shrink-0 border font-bold ${
              active
                ? 'border-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]'
                : 'border-border bg-card'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option === 'all' ? t('food.typeAll') : t(FOOD_TYPE_KEYS[option])}
          </button>
        );
      })}
      </div>
    </Speakable>
  );
}