
import { useDispatch } from 'react-redux';
import { replaceCartItems } from '../redux/cartSlice';
import React, { createContext, useCallback, useState } from 'react';

export const AuthContext = createContext();

const readUserCart = (userId) => {
  try {
    const savedCart = localStorage.getItem(`cartItems:${userId}`);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);

    dispatch(
      replaceCartItems(
        userData?._id ? readUserCart(userData._id) : []
      )
    );
  }, [dispatch]);

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
    dispatch(replaceCartItems([]));
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
