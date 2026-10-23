
import { createSlice } from '@reduxjs/toolkit';

const getCartStorageKey = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    return userInfo?._id
      ? `cartItems:${userInfo._id}`
      : 'cartItems:guest';
  } catch {
    return 'cartItems:guest';
  }
};

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem(getCartStorageKey());
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};

const saveCart = (cartItems) => {
  localStorage.setItem(
    getCartStorageKey(),
    JSON.stringify(cartItems)
  );
};

const cartSlice = createSlice({
  name: 'cart',

  initialState: {
    cartItems: getInitialCart(),
  },

  reducers: {
    replaceCartItems: (state, action) => {
      state.cartItems = Array.isArray(action.payload)
        ? action.payload
        : [];
      saveCart(state.cartItems);
    },

    addToCart: (state, action) => {
      const item = action.payload;
      const requestedQty = Math.max(1, Math.floor(Number(item.qty) || 1));
      const existing = state.cartItems.find(
        (x) => x.productId === item.productId
      );

      const stockValue = Number(item.stock ?? existing?.stock);
      const hasStockLimit =
        item.stock != null || existing?.stock != null;

      if (hasStockLimit && (!Number.isFinite(stockValue) || stockValue <= 0)) {
        return;
      }

      const currentQty = Number(existing?.qty) || 0;
      const desiredQty = currentQty + requestedQty;
      const finalQty = hasStockLimit
        ? Math.min(desiredQty, Math.floor(stockValue))
        : desiredQty;

      if (finalQty <= 0) return;

      if (existing) {
        existing.qty = finalQty;

        // Refresh the saved stock value when supplied by the product page.
        if (item.stock != null) {
          existing.stock = stockValue;
        }
      } else {
        state.cartItems.push({
          ...item,
          qty: finalQty,
          ...(hasStockLimit ? { stock: stockValue } : {}),
        });
      }

      saveCart(state.cartItems);
    },

    // Sets an item's quantity to an exact value (used by cart +/- controls).
    setCartQuantity: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.cartItems.find(
        (x) => x.productId === productId
      );

      if (!item) return;

      const requestedQty = Math.floor(Number(qty));

      if (!Number.isFinite(requestedQty)) return;

      if (requestedQty <= 0) {
        state.cartItems = state.cartItems.filter(
          (x) => x.productId !== productId
        );
      } else {
        const stockValue = Number(item.stock);
        const hasStockLimit =
          item.stock != null && Number.isFinite(stockValue);

        item.qty = hasStockLimit
          ? Math.min(requestedQty, Math.max(0, Math.floor(stockValue)))
          : requestedQty;

        if (item.qty <= 0) {
          state.cartItems = state.cartItems.filter(
            (x) => x.productId !== productId
          );
        }
      }

      saveCart(state.cartItems);
    },

    // Updates the saved stock for an item without changing its quantity.
    updateCartStock: (state, action) => {
      const { productId, stock } = action.payload;
      const item = state.cartItems.find(
        (x) => x.productId === productId
      );

      if (!item || !Number.isFinite(Number(stock))) return;

      const availableStock = Math.max(0, Math.floor(Number(stock)));
      item.stock = availableStock;
      item.qty = Math.min(Number(item.qty) || 1, availableStock);

      if (item.qty <= 0) {
        state.cartItems = state.cartItems.filter(
          (x) => x.productId !== productId
        );
      }

      saveCart(state.cartItems);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload
      );

      saveCart(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      saveCart(state.cartItems);
      localStorage.removeItem('cartItems');
    },
  },
});

export const {
  addToCart,
  setCartQuantity,
  updateCartStock,
  removeFromCart,
  clearCart,
  replaceCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
