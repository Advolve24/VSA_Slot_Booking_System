// src/app/layout/Header.jsx

export default function Header() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center gap-3 py-4 px-4">
        <div className="w-30 h-30 rounded-full  flex items-center justify-center overflow-hidden">
          <img
            src="/vsa logo.png"
            alt="Vidyanchal Sports Academy"
            className="w-14 h-14 object-contain"
          />
        </div>


        <div>
          <h1 className="font-semibold text-lg text-green-800">
            Vidyanchal Sports Academy
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Excellence in Sports Training
          </p>
        </div>
      </div>
    </header>
  );
}
