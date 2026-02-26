import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Slide,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#22c55e" },
    secondary: { main: "#a855f7" },
    warning: { main: "#f59e0b" },
    background: { default: "#ffffff", paper: "#1f2937" },
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 10 },
});

// ─── ДАННЫЕ ЗАЛА ──────────────────────────────────────────────────────────

function buildSeats() {
  const seats = [];
  const row1_4counts = [17, 16, 16, 16];
  row1_4counts.forEach((count, ri) => {
    const row = ri + 1;
    for (let p = 1; p <= count; p++) {
      seats.push({
        seatId: `r${row}_${p}`,
        rowNum: String(row),
        sector: "STANDARD",
        place: String(p),
        bookedSeats: (row === 2 && (p === 5 || p === 11)) || (row === 3 && p === 8) ? "1" : "0",
        seatType: "STANDARD",
        objectDescription: `Ряд ${row}, место ${p}`,
      });
    }
  });
  const row5_10counts = [19, 19, 18, 17, 17, 20];
  row5_10counts.forEach((count, ri) => {
    const row = ri + 5;
    for (let p = 1; p <= count; p++) {
      seats.push({
        seatId: `r${row}_${p}`,
        rowNum: String(row),
        sector: "STANDARD",
        place: String(p),
        bookedSeats:
          (row === 6 && (p === 3 || p === 7 || p === 14)) ||
          (row === 7 && (p === 1 || p === 9)) ||
          (row === 8 && p === 12) ||
          (row === 9 && (p === 5 || p === 16)) ? "1" : "0",
        seatType: "STANDARD",
        objectDescription: `Ряд ${row}, место ${p}`,
      });
    }
  });
  for (let p = 1; p <= 6; p++) {
    seats.push({
      seatId: `vip1_${p}`,
      rowNum: "VIP1",
      sector: "VIP",
      place: String(p),
      bookedSeats: p === 3 ? "1" : "0",
      seatType: "VIP",
      objectDescription: `VIP1, место ${p}`,
    });
  }
  for (let p = 1; p <= 6; p++) {
    seats.push({
      seatId: `vip2_${p}`,
      rowNum: "VIP2",
      sector: "VIP",
      place: String(p),
      bookedSeats: p === 2 || p === 5 ? "1" : "0",
      seatType: "VIP",
      objectDescription: `VIP2, место ${p}`,
    });
  }
  return seats;
}

const ALL_SEATS = buildSeats();
const PRICE_DATA = [
  { seatType: "STANDARD", price: 50 },
  { seatType: "VIP", price: 80 },
];
const SESSIONS = [
  { sessionId: "1", time: "18:45", mediaType: "2D", minPrice: 55 },
  { sessionId: "2", time: "23:30", mediaType: "2D", minPrice: 50 },
];

// ─── ИКОНКА КРЕСЛА ────────────────────────────────────────────────────────

function SeatIcon({ color, size = 26 }) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 26 23" fill="none">
      <rect x="2" y="0" width="22" height="8" rx="3" fill={color} />
      <rect x="0" y="8" width="26" height="11" rx="3" fill={color} />
      <rect x="0" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="22" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="4" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
      <rect x="18" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── ОДНО КРЕСЛО ─────────────────────────────────────────────────────────

function Seat({ seat, isSelected, onToggle }) {
  const booked = seat.bookedSeats === "1";
  const isVip = seat.seatType === "VIP";

  let color;
  if (booked) color = "#d1d5db";
  else if (isSelected) color = "#22c55e";
  else if (isVip) color = "#a855f7";
  else color = "#f59e0b";

  return (
    <Box
      onClick={() => !booked && onToggle(seat)}
      title={booked ? "Занято" : seat.objectDescription}
      sx={{
        cursor: booked ? "default" : "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {booked ? (
        <Box
          sx={{
            width: 22,
            height: 19,
            bgcolor: "#e5e7eb",
            borderRadius: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#9ca3af",
            fontWeight: 700,
          }}
        >
          ✕
        </Box>
      ) : (
        <Box sx={{ transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.1s" }}>
          <SeatIcon color={color} size={isVip ? 28 : 24} />
        </Box>
      )}
      {isSelected && !booked && (
        <Box
          sx={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "primary.main",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            borderRadius: "3px",
            px: "4px",
            py: "1px",
            whiteSpace: "nowrap",
          }}
        >
          {seat.place}
        </Box>
      )}
    </Box>
  );
}

// ─── ОДИН РЯД ────────────────────────────────────────────────────────────

function Row({ rowNum, seats, selectedSeats, onToggle, isVip = false }) {
  const label = (
    <Typography
      variant="caption"
      sx={{ minWidth: 28, textAlign: "center", color: "text.secondary", fontWeight: 500 }}
    >
      {rowNum}
    </Typography>
  );
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isVip ? "4px" : "2px",
        mb: isVip ? "4px" : "1px",
      }}
    >
      {label}
      <Box sx={{ display: "flex", gap: isVip ? "6px" : "3px", alignItems: "center" }}>
        {seats.map((seat) => (
          <Seat
            key={seat.seatId}
            seat={seat}
            isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
            onToggle={onToggle}
          />
        ))}
      </Box>
      {label}
    </Box>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────

export default function App() {
  const [selectedSession, setSelectedSession] = useState("2");
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.find((s) => s.seatId === seat.seatId)
        ? prev.filter((s) => s.seatId !== seat.seatId)
        : [...prev, seat]
    );
  };

  const vip1Seats = ALL_SEATS.filter((s) => s.rowNum === "VIP1");
  const vip2Seats = ALL_SEATS.filter((s) => s.rowNum === "VIP2");
  const freeCount = ALL_SEATS.filter((s) => s.bookedSeats === "0").length;

  const total = selectedSeats.reduce((sum, s) => {
    const p = PRICE_DATA.find((x) => x.seatType === s.seatType);
    return sum + (p?.price || 0);
  }, 0);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#ffffff",
          maxWidth: 480,
          mx: "auto",
          position: "relative",
          pb: selectedSeats.length > 0 ? "90px" : "20px",
        }}
      >
        {/* ── Шапка ── */}
        <Paper
          square
          elevation={0}
          sx={{ bgcolor: "#111827", color: "#fff", px: 2, pt: 2, pb: "20px" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <IconButton sx={{ color: "#9ca3af", p: 0, mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} noWrap>
              Ограбление в Лос-Андже...
            </Typography>
          </Box>
          <Typography variant="body2" color="#9ca3af" mb={2}>
            24 февраля, вторник
          </Typography>

          {/* Сеансы */}
          <Box sx={{ display: "flex", gap: "12px" }}>
            {SESSIONS.map((s) => {
              const active = selectedSession === s.sessionId;
              return (
                <Paper
                  key={s.sessionId}
                  onClick={() => setSelectedSession(s.sessionId)}
                  elevation={0}
                  sx={{
                    cursor: "pointer",
                    bgcolor: active ? "primary.main" : "#374151",
                    borderRadius: "10px",
                    px: "18px",
                    py: "8px",
                    textAlign: "center",
                    minWidth: 80,
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: active ? "#16a34a" : "#4b5563" },
                  }}
                >
                  <Typography fontWeight={800} fontSize={20}>
                    {s.time}
                  </Typography>
                  <Typography fontSize={12} sx={{ opacity: 0.8 }}>
                    {s.mediaType}
                  </Typography>
                  <Typography
                    fontSize={12}
                    sx={{ color: active ? "rgba(255,255,255,0.8)" : "#9ca3af", mt: "4px" }}
                  >
                    от {s.minPrice} TJS
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        {/* ── Название кинотеатра ── */}
        <Box sx={{ textAlign: "center", pt: "18px", pb: "8px", px: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#111827">
            Кинотеатр «Навруз»
          </Typography>
          <Typography variant="body2" color="text.secondary" mt="2px">
            Зал 1
          </Typography>
        </Box>

        {/* ── Легенда ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            px: 2,
            py: 1,
          }}
        >
          {[
            { color: "#f59e0b", label: "50 TJS" },
            { color: "#a855f7", label: "80 TJS" },
            { color: "#e5e7eb", label: "Занято", isX: true },
          ].map((item) => (
            <Chip
              key={item.label}
              size="small"
              label={item.label}
              icon={
                item.isX ? (
                  <Box
                    sx={{
                      width: 16,
                      height: 14,
                      bgcolor: item.color,
                      borderRadius: "2px",
                      fontSize: 9,
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      ml: "4px !important",
                    }}
                  >
                    ✕
                  </Box>
                ) : (
                  <Box sx={{ ml: "4px !important", display: "flex" }}>
                    <SeatIcon color={item.color} size={16} />
                  </Box>
                )
              }
              sx={{
                bgcolor: "transparent",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontWeight: 500,
                "& .MuiChip-icon": { mr: "2px" },
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb="12px">
          Осталось мест: {freeCount}
        </Typography>

        {/* ── Экран ── */}
        <Box sx={{ position: "relative", textAlign: "center", mx: "20px", mb: "8px" }}>
          <Box
            sx={{
              height: 16,
              background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
              mb: "4px",
            }}
          />
          <Typography variant="caption" color="#9ca3af" letterSpacing={4} fontWeight={600}>
            ЭКРАН
          </Typography>
        </Box>

        {/* ── Зона мест ── */}
        <Box sx={{ px: "4px", py: "8px", overflowX: "auto" }}>
          <Box sx={{ mb: "14px" }}>
            {[1, 2, 3, 4].map((rn) => (
              <Row
                key={rn}
                rowNum={rn}
                seats={ALL_SEATS.filter((s) => s.rowNum === String(rn))}
                selectedSeats={selectedSeats}
                onToggle={toggleSeat}
              />
            ))}
          </Box>
          <Box sx={{ mb: "14px" }}>
            {[5, 6, 7, 8, 9, 10].map((rn) => (
              <Row
                key={rn}
                rowNum={rn}
                seats={ALL_SEATS.filter((s) => s.rowNum === String(rn))}
                selectedSeats={selectedSeats}
                onToggle={toggleSeat}
              />
            ))}
          </Box>
          <Box>
            <Row rowNum="VIP1" seats={vip1Seats} selectedSeats={selectedSeats} onToggle={toggleSeat} isVip />
            <Row rowNum="VIP2" seats={vip2Seats} selectedSeats={selectedSeats} onToggle={toggleSeat} isVip />
          </Box>
        </Box>

        {/* ── Панель покупки ── */}
        <Slide direction="up" in={selectedSeats.length > 0} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 480,
              bgcolor: "#1f2937",
              borderRadius: "16px 16px 0 0",
              px: "20px",
              pt: "16px",
              pb: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 100,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={800} color="#fff">
                {total} TJS
              </Typography>
              <Typography variant="body2" color="#9ca3af">
                За {selectedSeats.length}{" "}
                {selectedSeats.length === 1 ? "билет" : "билетов"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                borderRadius: "12px",
                px: 4,
                py: "14px",
                fontSize: 16,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              Купить
            </Button>
          </Paper>
        </Slide>
      </Box>
    </ThemeProvider>
  );
}