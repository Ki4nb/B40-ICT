import { FoodItem } from '@/types';

interface FoodItemIconProps {
  foodItem: FoodItem;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

const FoodItemIcon = ({ foodItem, size = 'md', selected = false, onClick }: FoodItemIconProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const baseClasses = 'flex flex-col items-center justify-center p-2 rounded-lg transition-all';
  const interactiveClasses = onClick ? 'cursor-pointer hover:bg-gray-100' : '';
  const selectedClasses = selected 
    ? 'bg-primary-100 border-2 border-primary-500' 
    : 'bg-white border border-gray-200';

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img 
          src={`/icons/${foodItem.icon}`} 
          alt={foodItem.name} 
          className="max-w-full max-h-full" 
        />
      </div>
      <span className="mt-1 text-xs font-medium text-gray-700">{foodItem.name}</span>
    </div>
  );
};

export default FoodItemIcon;