import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ThirdwebProvider } from "thirdweb/react";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { BlockchainContextProvider } from "./Context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <BrowserRouter>
        <BlockchainContextProvider>
          <ToastContainer />
          <App />
        </BlockchainContextProvider>
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>
);
