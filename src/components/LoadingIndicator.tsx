import React from "react";

/**
 * A simple loading indicator component that displays a spinning circle.
 *
 * This component is typically used to indicate loading states in the UI.
 *
 * @component
 * @example
 * ```tsx
 * <LoadingIndicator />
 * ```
 */
const LoadingIndicator: React.FC = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px"
  }}>
    <div style={{
      width: "30px",
      height: "30px",
      border: "4px solid #ccc",
      borderTop: "4px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }}></div>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

export default LoadingIndicator;
