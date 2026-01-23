import { BrowserRouter, Routes, Route } from "react-router-dom";

// layout
import MainLayout from "@/app/layout/MainLayout";

// pages
import EnrollCoaching from "@/pages/enrollment/EnrollCoaching";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Default booking page */}
          <Route path="/" element={<EnrollCoaching />} />

          {/* Optional future routes */}
          {/* <Route path="/booking" element={<EnrollCoaching />} /> */}
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
