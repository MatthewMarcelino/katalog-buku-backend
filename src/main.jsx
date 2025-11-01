import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // pastikan tailwind ter-import
import { BookProvider } from "./context/BookContext";



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BookProvider>
        <App />
    </BookProvider>
  </React.StrictMode>
);
