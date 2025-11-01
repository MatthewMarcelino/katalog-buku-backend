// src/context/BookContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/books");
      setBooks(res.data);
    } catch (error) {
      console.error("Gagal fetch data buku:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <BookContext.Provider value={{ books, setBooks, fetchBooks }}>
      {children}
    </BookContext.Provider>
  );
};
