
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { BooksProvider } from "./context/BooksContext";

createRoot(document.getElementById("root")!).render(
  <BooksProvider>
    <App />
  </BooksProvider>
);
