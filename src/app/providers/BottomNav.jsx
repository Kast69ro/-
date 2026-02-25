import Paper from "@mui/material/Paper";
import MuiBottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";

import HomeIcon from "@mui/icons-material/Home";
import MovieIcon from "@mui/icons-material/Movie";
import EventIcon from "@mui/icons-material/Event";

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1px solid #eee",
        zIndex: 50,
      }}
    >
      {/* max width like mobile */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 430 }}>
          <MuiBottomNavigation
            value={activeTab}
            onChange={(e, newValue) => onTabChange?.(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Cinema" value="cinema" icon={<MovieIcon />} />
            <BottomNavigationAction label="Events" value="events" icon={<EventIcon />} />
          </MuiBottomNavigation>
        </Box>
      </Box>
    </Paper>
  );
}