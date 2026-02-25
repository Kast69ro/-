import React, { useMemo } from "react";

// MUI
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
} from "@mui/material";

export default function SessionList({ sessions = [], cinemas = [], onSelectSession }) {
  const cinemasById = useMemo(() => {
    const map = new Map();
    (cinemas || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [cinemas]);

  const sessionsByCinema = useMemo(() => {
    const acc = {};
    (sessions || []).forEach((s) => {
      if (!s?.cinemaId) return;
      if (!acc[s.cinemaId]) acc[s.cinemaId] = [];
      acc[s.cinemaId].push(s);
    });
    return acc;
  }, [sessions]);

  if (!sessions?.length) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No sessions available for this date
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {Object.entries(sessionsByCinema).map(([cinemaId, cinemaSessions]) => {
        const cinema = cinemasById.get(cinemaId);
        if (!cinema) return null;

        const prices = (cinemaSessions || []).map((s) => Number(s.price)).filter((x) => !Number.isNaN(x));
        const minPrice = prices.length ? Math.min(...prices) : null;
        const maxPrice = prices.length ? Math.max(...prices) : null;
        const priceRange =
          minPrice == null || maxPrice == null
            ? ""
            : minPrice === maxPrice
            ? `$${minPrice}`
            : `$${minPrice} - $${maxPrice}`;

        const facilities = Array.isArray(cinema.facilities) ? cinema.facilities.slice(0, 4) : [];

        return (
          <Paper
            key={cinemaId}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            {/* Cinema Header */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {cinema.name}
              </Typography>

              {cinema.address && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {cinema.address}
                </Typography>
              )}

              {facilities.length > 0 && (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                  {facilities.map((f) => (
                    <Chip key={f} label={f} size="small" />
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Sessions */}
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Available times
                </Typography>

                {priceRange && (
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {priceRange}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                {(cinemaSessions || []).map((session) => (
                  <Button
                    key={session.id}
                    variant="outlined"
                    onClick={() => onSelectSession?.(session, cinema)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      minWidth: 88,
                      px: 1.5,
                      py: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      lineHeight: 1.1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {session.time}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {session.format}
                    </Typography>
                  </Button>
                ))}
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={() => onSelectSession?.(cinemaSessions[0], cinema)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                disabled={!cinemaSessions?.length}
              >
                Select seats
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}