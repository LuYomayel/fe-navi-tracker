import type { ShoppingList, ShoppingItem } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";

export interface ShoppingSlice {
  shoppingLists: ShoppingList[];
  activeShoppingList: ShoppingList | null;
  shoppingListLoading: boolean;
  fetchShoppingLists: () => Promise<void>;
  fetchShoppingListById: (id: string) => Promise<void>;
  createShoppingList: (name: string, notes?: string) => Promise<ShoppingList | null>;
  generateShoppingList: (mealPrepId?: string, name?: string) => Promise<ShoppingList | null>;
  archiveShoppingList: (id: string) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  addShoppingItem: (listId: string, data: Partial<ShoppingItem>) => Promise<void>;
  toggleShoppingItem: (listId: string, itemId: string) => Promise<void>;
  updateShoppingItem: (listId: string, itemId: string, data: Partial<ShoppingItem>) => Promise<void>;
  deleteShoppingItem: (listId: string, itemId: string) => Promise<void>;
  uncheckAllShoppingItems: (listId: string) => Promise<void>;
}

export const createShoppingSlice = (set: StoreSet, get: StoreGet): ShoppingSlice => ({
  shoppingLists: [],
  activeShoppingList: null,
  shoppingListLoading: false,

  fetchShoppingLists: async () => {
    try {
      const res = await api.shoppingList.getAll();
      if (res.data) {
        set({ shoppingLists: res.data as ShoppingList[] });
      }
    } catch (e) {
      console.error("Error fetching shopping lists:", e);
    }
  },

  fetchShoppingListById: async (id) => {
    try {
      set({ shoppingListLoading: true });
      const res = await api.shoppingList.getById(id);
      if (res.data) {
        set({ activeShoppingList: res.data as ShoppingList });
      }
    } catch (e) {
      console.error("Error fetching shopping list:", e);
    } finally {
      set({ shoppingListLoading: false });
    }
  },

  createShoppingList: async (name, notes) => {
    try {
      const res = await api.shoppingList.create({ name, notes });
      if (res.data) {
        const list = res.data as ShoppingList;
        set((state) => ({
          shoppingLists: [list, ...state.shoppingLists],
        }));
        toast.success("Lista creada");
        return list;
      }
      return null;
    } catch (e) {
      console.error("Error creating shopping list:", e);
      toast.error("Error al crear lista");
      return null;
    }
  },

  generateShoppingList: async (mealPrepId, name) => {
    try {
      set({ shoppingListLoading: true });
      const res = await api.shoppingList.generate({ mealPrepId, name });
      if (res.data) {
        const list = res.data as ShoppingList;
        set((state) => ({
          shoppingLists: [list, ...state.shoppingLists],
          activeShoppingList: list,
        }));
        toast.success("Lista de compras generada con IA");
        return list;
      }
      return null;
    } catch (e) {
      console.error("Error generating shopping list:", e);
      toast.error("Error al generar lista de compras");
      return null;
    } finally {
      set({ shoppingListLoading: false });
    }
  },

  archiveShoppingList: async (id) => {
    try {
      await api.shoppingList.update(id, { status: "archived" });
      set((state) => ({
        shoppingLists: state.shoppingLists.map((l) =>
          l.id === id ? { ...l, status: "archived" as const } : l
        ),
      }));
      toast.success("Lista archivada");
    } catch (e) {
      console.error("Error archiving shopping list:", e);
    }
  },

  deleteShoppingList: async (id) => {
    try {
      await api.shoppingList.delete(id);
      set((state) => ({
        shoppingLists: state.shoppingLists.filter((l) => l.id !== id),
        activeShoppingList:
          state.activeShoppingList?.id === id
            ? null
            : state.activeShoppingList,
      }));
      toast.success("Lista eliminada");
    } catch (e) {
      console.error("Error deleting shopping list:", e);
    }
  },

  addShoppingItem: async (listId, data) => {
    try {
      const res = await api.shoppingList.addItem(listId, data);
      if (res.data) {
        const item = res.data as ShoppingItem;
        set((state) => {
          if (state.activeShoppingList?.id !== listId) return state;
          return {
            activeShoppingList: {
              ...state.activeShoppingList,
              items: [...(state.activeShoppingList.items || []), item],
            },
          };
        });
      }
    } catch (e) {
      console.error("Error adding item:", e);
      toast.error("Error al agregar item");
    }
  },

  toggleShoppingItem: async (listId, itemId) => {
    const list = get().activeShoppingList;
    if (!list || list.id !== listId) return;

    const item = list.items?.find((i) => i.id === itemId);
    if (!item) return;

    set((state) => {
      if (state.activeShoppingList?.id !== listId) return state;
      return {
        activeShoppingList: {
          ...state.activeShoppingList,
          items: state.activeShoppingList.items?.map((i) =>
            i.id === itemId ? { ...i, checked: !i.checked } : i
          ),
        },
      };
    });

    try {
      await api.shoppingList.updateItem(listId, itemId, {
        checked: !item.checked,
      } as any);
    } catch (e) {
      console.error("Error toggling item:", e);
      set((state) => {
        if (state.activeShoppingList?.id !== listId) return state;
        return {
          activeShoppingList: {
            ...state.activeShoppingList,
            items: state.activeShoppingList.items?.map((i) =>
              i.id === itemId ? { ...i, checked: item.checked } : i
            ),
          },
        };
      });
    }
  },

  updateShoppingItem: async (listId, itemId, data) => {
    try {
      const res = await api.shoppingList.updateItem(listId, itemId, data);
      if (res.data) {
        const updated = res.data as ShoppingItem;
        set((state) => {
          if (state.activeShoppingList?.id !== listId) return state;
          return {
            activeShoppingList: {
              ...state.activeShoppingList,
              items: state.activeShoppingList.items?.map((i) =>
                i.id === itemId ? updated : i
              ),
            },
          };
        });
      }
    } catch (e) {
      console.error("Error updating item:", e);
    }
  },

  deleteShoppingItem: async (listId, itemId) => {
    const list = get().activeShoppingList;
    set((state) => {
      if (state.activeShoppingList?.id !== listId) return state;
      return {
        activeShoppingList: {
          ...state.activeShoppingList,
          items: state.activeShoppingList.items?.filter(
            (i) => i.id !== itemId
          ),
        },
      };
    });

    try {
      await api.shoppingList.deleteItem(listId, itemId);
    } catch (e) {
      console.error("Error deleting item:", e);
      set({ activeShoppingList: list });
    }
  },

  uncheckAllShoppingItems: async (listId) => {
    try {
      await api.shoppingList.uncheckAll(listId);
      set((state) => {
        if (state.activeShoppingList?.id !== listId) return state;
        return {
          activeShoppingList: {
            ...state.activeShoppingList,
            items: state.activeShoppingList.items?.map((i) => ({
              ...i,
              checked: false,
              checkedAt: undefined,
            })),
          },
        };
      });
    } catch (e) {
      console.error("Error unchecking all:", e);
    }
  },
});
