import { Routes, Route } from "react-router-dom";

import MobileShell from "./providers/MobileShell.jsx";

// import MovieDetailsScreen from "../pages/MovieDetails/MovieDetail.jsx";
import CatalogScreen from "../pages/Catalog/catalog.jsx";
import HomeScreen from "../pages/Home/home-screen.jsx";
import MovieDetailsScreen from "../pages/MovieDetails/MovieDetail.jsx";
import HallPage from "../pages/HallPage/hallPage.jsx";




export default function App() {
  return (
    <Routes>
      <Route element={<MobileShell />}>
        <Route path="/" element={<HomeScreen />} />

        {/* Movies */}
        <Route path="/catalog/:categoryId" element={<CatalogScreen />} />
        <Route path="/session/:sessionId" element={<HallPage />} />


       <Route path="/event/:eventId" element={<MovieDetailsScreen />} />
      </Route>

      <Route path="*" element={<div className="p-4">Not found</div>} />
    </Routes>
  );
}