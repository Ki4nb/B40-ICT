import { useState, useEffect } from 'react';
import { FoodBankWithInventory, FoodItem } from '@/types';
import { getFoodbank, updateInventoryItem, addInventoryItem, getFoodItems } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import FoodItemIcon from '@/components/FoodItemIcon';

const InventoryManagement = () => {
  const [foodbank, setFoodbank] = useState<FoodBankWithInventory | null>(null);
  const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemId, setNewItemId] = useState<number>(0);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || userRole !== 'foodbank') return;
      
      try {
        // In a real app, you would get the foodbank ID from the user context
        // For this demo, we'll use ID 1
        const foodbankData = await getFoodbank(1);
        const foodItemsData = await getFoodItems();
        
        setFoodbank(foodbankData);
        setAllFoodItems(foodItemsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load inventory data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userRole]);

  const handleEditClick = (itemId: number, currentQuantity: number) => {
    setEditingItemId(itemId);
    setEditQuantity(currentQuantity);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditQuantity(parseInt(e.target.value) || 0);
  };

  const handleUpdateInventory = async () => {
    if (!editingItemId || !foodbank) return;
    
    try {
      await updateInventoryItem(foodbank.id, editingItemId, editQuantity);
      
      // Update local state
      setFoodbank(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          inventory_items: prev.inventory_items.map(item => 
            item.id === editingItemId 
              ? { ...item, quantity: editQuantity }
              : item
          )
        };
      });
      
      // Reset edit state
      setEditingItemId(null);
      setEditQuantity(0);
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditQuantity(0);
  };

  const handleAddItem = async () => {
    if (!newItemId || !foodbank) return;
    
    try {
      const result = await addInventoryItem(foodbank.id, newItemId, newQuantity);
      
      // Update local state
      setFoodbank(prev => {
        if (!prev) return prev;
        
        // Check if we already have this item
        const existingItemIndex = prev.inventory_items.findIndex(
          item => item.food_item_id === newItemId
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item
          return {
            ...prev,
            inventory_items: prev.inventory_items.map((item, index) => 
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newQuantity }
                : item
            )
          };
        } else {
          // Add new item
          return {
            ...prev,
            inventory_items: [...prev.inventory_items, result]
          };
        }
      });
      
      // Reset form
      setShowAddForm(false);
      setNewItemId(0);
      setNewQuantity(1);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Failed to add item to inventory. Please try again.');
    }
  };

  // Get available food items (not already in inventory)
  const availableFoodItems = allFoodItems.filter(item => 
    !foodbank?.inventory_items.some(invItem => invItem.food_item_id === item.id)
  );

  if (!isAuthenticated || userRole !== 'foodbank') {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Access Restricted
        </h2>
        <p className="text-gray-600 mb-4">
          This page is only accessible to food bank administrators.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Foodbank Info */}
      {foodbank && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">{foodbank.name} Inventory</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {foodbank.location}, {foodbank.district}
            </p>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Current Inventory</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Item
          </button>
        </div>
        
        {showAddForm && (
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
            <h4 className="text-base font-medium text-gray-900 mb-3">Add New Inventory Item</h4>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700">
                  Food Item
                </label>
                <select
                  id="item"
                  name="item"
                  value={newItemId}
                  onChange={(e) => setNewItemId(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value={0}>Select an item</option>
                  {availableFoodItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddItem}
                  disabled={!newItemId}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Add to Inventory
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {foodbank?.inventory_items.length === 0 ? (
          <div className="px-4 py-6 sm:px-6 text-center text-gray-500">
            No items in inventory. Click "Add Item" to stock your inventory.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {foodbank?.inventory_items.map(item => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <FoodItemIcon foodItem={item.food_item} size="sm" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.food_item.name}</p>
                        <p className="text-sm text-gray-500">Category: {item.food_item.category}</p>
                      </div>
                      <div className="flex items-center">
                        {editingItemId === item.id ? (
                          <>
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={handleQuantityChange}
                              min={0}
                              className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                            <button
                              onClick={handleUpdateInventory}
                              className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900 mr-4">
                              Quantity: {item.quantity}
                            </div>
                            <button
                              onClick={() => handleEditClick(item.id, item.quantity)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;