import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FoodItemIcon from './FoodItemIcon';
import { FoodItem } from '@/types';

interface FoodItemGridProps {
  foodItems: FoodItem[];
  onSelectionChange: (selectedItems: Array<{ food_item_id: number, quantity: number }>) => void;
}

const FoodItemGrid = ({ foodItems, onSelectionChange }: FoodItemGridProps) => {
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});

  const toggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      
      if (newSelected[itemId]) {
        // If already selected, increment quantity up to 3
        if (newSelected[itemId] < 3) {
          newSelected[itemId] += 1;
        } else {
          // If already at 3, remove it
          delete newSelected[itemId];
        }
      } else {
        // If not selected, add it with quantity 1
        newSelected[itemId] = 1;
      }
      
      // Update parent component
      const formattedSelection = Object.entries(newSelected).map(([id, quantity]) => ({
        food_item_id: Number(id),
        quantity
      }));
      
      onSelectionChange(formattedSelection);
      return newSelected;
    });
  };

  // Group items by category
  const itemsByCategory: Record<string, FoodItem[]> = {};
  foodItems.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  // Function to translate category name
  const translateCategory = (category: string) => {
    const categoryKey = category.toLowerCase().replace(/\s+/g, '');
    return t(`foodCategories.${categoryKey}`, category); // Fallback to original if no translation
  };

  return (
    <div className="space-y-6">
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{translateCategory(category)}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {items.map(item => (
              <div key={item.id} className="relative">
                <FoodItemIcon
                  foodItem={item}
                  size="md"
                  selected={!!selectedItems[item.id]}
                  onClick={() => toggleItem(item.id)}
                />
                
                {/* Quantity badge */}
                {selectedItems[item.id] > 0 && (
                  <div className="absolute -top-2 -right-2 bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {selectedItems[item.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FoodItemGrid;