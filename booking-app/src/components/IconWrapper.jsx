// src/components/IconWrapper.jsx
export default function IconWrapper({ children, className = "" }) {
  return (
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-700 ${className}`}
    >
      {children}
    </div>
  );
}
