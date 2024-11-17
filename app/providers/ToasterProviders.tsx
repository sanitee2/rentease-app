'use client';

import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      position="bottom-right" // Set the toast to appear at the bottom right
      toastOptions={{
        duration: 5000, // Optional: Set how long each toast should appear (in ms)
        style: {
          background: '#fff',
          color: '#4338ca',
        },
      }}
    />
  );
};

export default ToasterProvider;
