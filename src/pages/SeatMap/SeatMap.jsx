import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Slide,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";

import { fetchSeats, selectSeats, selectSeatsStatus, selectSeatsError } from "../../features/seats/seatsSlice";


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

function buildColorMap(seatTypePrice = []) {
  const FALLBACK = { STANDARD: "#f59e0b", VIP: "#a855f7", COMFORT: "#38bdf8" };
  const PALETTE = ["#f59e0b", "#a855f7", "#38bdf8", "#fb7185", "#34d399"];
  const map = {};
  seatTypePrice.forEach((item, i) => {
    map[item.seatType] = FALLBACK[item.seatType] || PALETTE[i % PALETTE.length];
  });
  return map;
}

function Seat({ seat, isSelected, onToggle, colorMap, isDense }) {
  const booked = seat.bookedSeats === "1";
  const isVip = seat.seatType === "VIP";

  let color;
  if (booked) color = "#d1d5db";
  else if (isSelected) color = "#22c55e";
  else color = colorMap[seat.seatType] || "#f59e0b";

  const iconSize = isVip ? 28 : 24;

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
          <SeatIcon color={color} size={iconSize} />
        </Box>
      )}
      {isSelected && !booked && (
        <Box
          sx={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "#22c55e",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            borderRadius: "3px",
            px: "4px",
            py: "1px",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {seat.place}
        </Box>
      )}
    </Box>
  );
}

function Row({ rowNum, seats, selectedSeats, onToggle, colorMap, isVip = false, isDense }) {
  const label = (
    <Box
      sx={{
        minWidth: 20,
        textAlign: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#6b7280",
        flexShrink: 0,
      }}
    >
      {rowNum}
    </Box>
  );

  // gap между местами: больше если зал большой (>100 мест)
  const seatGap = isDense ? (isVip ? "10px" : "6px") : (isVip ? "6px" : "3px");
  const rowGap  = isDense ? "6px" : (isVip ? "4px" : "2px");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isDense ? "6px" : "4px",
        mb: rowGap,
      }}
    >
      {label}
      <Box sx={{ display: "flex", gap: seatGap, alignItems: "center" }}>
        {seats.map((seat) => (
          <Seat
            key={seat.seatId}
            seat={seat}
            isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
            onToggle={onToggle}
            colorMap={colorMap}
            isDense={isDense}
          />
        ))}
      </Box>
      {label}
    </Box>
  );
}

export default function SeatMap({
  sessions = [],
  eventName = "",
  eventDate = "",
  onBack,
  onBuy,
}) {
  const dispatch = useDispatch();

  const seatsData = useSelector(selectSeats);
  const status    = useSelector(selectSeatsStatus);
  const error     = useSelector(selectSeatsError);

  const [selectedSession, setSelectedSession] = useState(sessions[0]?.sessionId ?? null);
  const [selectedSeats, setSelectedSeats]     = useState([]);

  useEffect(() => {
    if (!selectedSession) return;
    setSelectedSeats([]);
    dispatch(fetchSeats({ sessionId: selectedSession }));
  }, [selectedSession, dispatch]);

  const seatTypePrice = seatsData?.seatTypePrice ?? [];
  const hallName      = seatsData?.hallName ?? "";

  const allSeats = useMemo(
    () => (seatsData?.seats ?? []).filter((s) => s.objectType === "seat" && s.rowNum !== ""),
    [seatsData]
  );

  const colorMap = useMemo(() => buildColorMap(seatTypePrice), [seatTypePrice]);

  const priceMap = useMemo(() => {
    const m = {};
    seatTypePrice.forEach((t) => { m[t.seatType] = parseFloat(t.price) || 0; });
    return m;
  }, [seatTypePrice]);

  const rowsMap = useMemo(() => {
    const m = new Map();
    allSeats.forEach((seat) => {
      if (!m.has(seat.rowNum)) m.set(seat.rowNum, []);
      m.get(seat.rowNum).push(seat);
    });
    m.forEach((seats, key) => {
      m.set(key, seats.sort((a, b) => Number(a.place) - Number(b.place)));
    });
    return m;
  }, [allSeats]);

  const rowKeys = useMemo(
    () => Array.from(rowsMap.keys()).sort((a, b) => Number(a) - Number(b)),
    [rowsMap]
  );

  const freeCount = allSeats.filter((s) => s.bookedSeats === "0").length;

  // Если мест больше 100 — увеличиваем расстояние между местами
  const isDense = allSeats.length > 100;

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.find((s) => s.seatId === seat.seatId)
        ? prev.filter((s) => s.seatId !== seat.seatId)
        : [...prev, seat]
    );
  };

  const total = selectedSeats.reduce((sum, s) => sum + (priceMap[s.seatType] || 0), 0);

  const legend = seatTypePrice.map((t) => ({
    color: colorMap[t.seatType],
    label: `${t.name} ${t.price} ${t.currencyCode}`,
  }));

  return (
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
            <IconButton sx={{ color: "#9ca3af", p: 0, mr: 1 }} onClick={onBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} noWrap>
              {eventName}
            </Typography>
          </Box>
          <Typography variant="body2" color="#9ca3af" mb={2}>
            {eventDate}
          </Typography>

          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {sessions.map((s) => {
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
                  <Typography fontWeight={800} fontSize={20}>{s.time}</Typography>
                  <Typography fontSize={12} sx={{ opacity: 0.8 }}>{s.mediaType}</Typography>
                  <Typography fontSize={12} sx={{ color: active ? "rgba(255,255,255,0.8)" : "#9ca3af", mt: "4px" }}>
                    от {s.minPrice} TJS
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        {/* ── Название зала ── */}
        {hallName && (
          <Box sx={{ textAlign: "center", pt: "18px", pb: "8px", px: 2 }}>
            <Typography variant="h6" fontWeight={700} color="#111827">
              {hallName}
            </Typography>
          </Box>
        )}

        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {status === "succeeded" && seatsData && (
          <>
            {/* Легенда */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, px: 2, py: 1, flexWrap: "wrap" }}>
              {legend.map((item) => (
                <Chip
                  key={item.label}
                  size="small"
                  label={item.label}
                  icon={
                    <Box sx={{ ml: "4px !important", display: "flex" }}>
                      <SeatIcon color={item.color} size={16} />
                    </Box>
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
              <Chip
                size="small"
                label="Занято"
                icon={
                  <Box sx={{ width: 16, height: 14, bgcolor: "#e5e7eb", borderRadius: "2px", fontSize: 9, color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, ml: "4px !important" }}>
                    ✕
                  </Box>
                }
                sx={{ bgcolor: "transparent", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 500 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center" mb="12px">
              Осталось мест: {freeCount}
            </Typography>

            {/* Экран */}
            <Box sx={{ position: "relative", textAlign: "center", mx: "20px", mb: "8px" }}>
              <Box sx={{ height: 16, background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)", borderRadius: "50% 50% 0 0 / 100% 100% 0 0", mb: "4px" }} />
              <Typography variant="caption" color="#9ca3af" letterSpacing={4} fontWeight={600}>
                ЭКРАН
              </Typography>
            </Box>

            {/* Ряды мест */}
            <Box sx={{ px: "4px", py: "8px", overflowX: "auto", position: "relative", zIndex: 1 }}>
              {rowKeys.map((rowNum) => {
                const seats = rowsMap.get(rowNum);
                const isVip = seats[0]?.seatType === "VIP";
                return (
                  <Row
                    key={rowNum}
                    rowNum={rowNum}
                    seats={seats}
                    selectedSeats={selectedSeats}
                    onToggle={toggleSeat}
                    colorMap={colorMap}
                    isVip={isVip}
                    isDense={isDense}
                  />
                );
              })}
            </Box>
          </>
        )}

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
              onClick={() => onBuy?.({ selectedSeats, total, sessionId: selectedSession })}
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
  );
}