import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Paper from "@mui/material/Paper";
import MuiBottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";

import HomeIcon from "@mui/icons-material/Home";
import MovieIcon from "@mui/icons-material/Movie";
import EventIcon from "@mui/icons-material/Event";

const TAB_BY_PATH = (pathname) => {
  if (pathname.startsWith("/movies")) return "cinema";
  if (pathname.startsWith("/events")) return "events";
  return "home";
};

export default function MobileShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const tab = TAB_BY_PATH(location.pathname);

  // Показываем bottom nav только на главных разделах
  const showBottomNav =
    location.pathname === "/" ||
    location.pathname.startsWith("/movies") ||
    location.pathname.startsWith("/events");

  const handleTabChange = (_, nextTab) => {
    if (nextTab === "home") navigate("/");
    if (nextTab === "cinema") navigate("/movies");
    if (nextTab === "events") navigate("/events");
  };

  return (
    <Box className="min-h-dvh bg-neutral-100 flex justify-center">
      <Box className="w-full max-w-[430px] min-h-dvh bg-white relative pb-20">
        <Outlet />

        {showBottomNav && (
          <Paper
            elevation={0}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              borderTop: "1px solid #eee",
            }}
          >
            <Box className="flex justify-center">
              <Box className="w-full max-w-[430px]">
                <MuiBottomNavigation value={tab} onChange={handleTabChange} showLabels>
                  <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
                  <BottomNavigationAction label="Cinema" value="cinema" icon={<MovieIcon />} />
                  <BottomNavigationAction label="Events" value="events" icon={<EventIcon />} />
                </MuiBottomNavigation>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}