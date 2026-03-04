import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { selectEventDetails } from "../../features/detail/detailSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MAX_TICKETS = 10;

// ─── ШИТ ВЫБОРА КОЛИЧЕСТВА БИЛЕТОВ (без схемы зала) ─────────────────────

function TicketCountSheet({ open, onClose, session, dateLabel, onBuy }) {
  const [count, setCount] = useState(1);

  const price = Number(session?.minPrice || session?.priceRange || 0);
  const total = price * count;

  if (!open) return null;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Ручка */}
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#e0e0e0" }} />
      </Box>

      {/* Шапка */}
      <Box sx={{ px: 2, pt: 1, pb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#ebebeb" } }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111" }}>
          Выберите тип билета
        </Typography>
      </Box>

      {/* Строка сеанса */}
      <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
            {dateLabel} в:{session?.sessionTime}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#888", mt: 0.3 }}>
            {price > 0 ? `${price.toFixed(1)} TJS` : ""}
          </Typography>
        </Box>

        {/* Счётчик */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            sx={{
              width: 36, height: 36,
              bgcolor: "#f0f0f0",
              "&:hover": { bgcolor: "#e0e0e0" },
              fontSize: 20, fontWeight: 700,
            }}
          >
            −
          </IconButton>
          <Typography sx={{ fontSize: 18, fontWeight: 800, minWidth: 20, textAlign: "center" }}>
            {count}
          </Typography>
          <IconButton
            onClick={() => setCount((c) => Math.min(MAX_TICKETS, c + 1))}
            sx={{
              width: 36, height: 36,
              bgcolor: "#f0f0f0",
              "&:hover": { bgcolor: "#e0e0e0" },
              fontSize: 20, fontWeight: 700,
            }}
          >
            +
          </IconButton>
        </Box>
      </Box>

      {/* Итого + кнопка */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #f0f0f0",
          mt: 1,
          mb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
            {total > 0 ? `${total.toFixed(1)} TJS` : "—"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#999" }}>
            За {count} {count === 1 ? "билет" : "билетов"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => onBuy({ session, count, total })}
          sx={{
            fontWeight: 800,
            fontSize: 16,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(25,118,210,0.35)",
          }}
        >
          Купить
        </Button>
      </Box>
    </Drawer>
  );
}

// ─── ОСНОВНОЙ ШИТ РАСПИСАНИЯ ─────────────────────────────────────────────

export default function SessionBottomSheet({ open, onClose, movieTitle }) {
  const movie = useSelector(selectEventDetails);
  const navigate = useNavigate();

  const sessionDates = useMemo(
    () => (Array.isArray(movie?.session_dates) ? movie.session_dates : []),
    [movie],
  );

  const [selectedDate, setSelectedDate] = useState(
    () => sessionDates[0]?.dateValue ?? "",
  );

  // Шит выбора билетов (без карты)
  const [ticketSheet, setTicketSheet] = useState({
    open: false,
    session: null,
    dateLabel: "",
    loc: null,
  });

  const activeDate = selectedDate || sessionDates[0]?.dateValue || "";
  const currentDateData = sessionDates.find((d) => d.dateValue === activeDate);

  if (!open) return null;

  const handleSessionClick = ({ session, loc, dateLabel }) => {
    if (movie?.hasMap === "true") {
      // Есть схема зала — переходим на HallPage
      onClose();
      navigate(`/session/${session.sessionId}`, {
        state: {
          eventId: movie.id,
          movieTitle: movie.title,
          sessionDate: dateLabel,
          locationName: loc.locationName,
          sessions: loc.sessions,
        },
      });
    } else {
      // Нет схемы — открываем шит выбора количества
      setTicketSheet({ open: true, session, dateLabel, loc });
    }
  };

  const handleBuy = ({ session, count, total }) => {
    setTicketSheet((s) => ({ ...s, open: false }));
    onClose();
    navigate("/checkout", {
      state: {
        sessionId: session.sessionId,
        movieTitle: movie.title,
        count,
        total,
        noMap: true,
      },
    });
  };

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        {/* Ручка */}
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#e0e0e0" }} />
        </Box>

        {/* ── ШАПКА ── */}
        <Box
          sx={{
            px: 2,
            pt: 1,
            pb: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111", lineHeight: 1.2 }}>
              Расписание
            </Typography>
            {movieTitle && (
              <Typography sx={{ fontSize: 13, color: "#888", mt: 0.3 }}>
                {movieTitle}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#ebebeb" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── ДАТЫ ── */}
        {sessionDates.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              px: 2,
              py: 1.5,
              overflowX: "auto",
              flexShrink: 0,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {sessionDates.map((d) => {
              const isActive = d.dateValue === activeDate;
              const weekdayLabel = WEEKDAYS[Number(d.weekday)] ?? d.weekday;
              return (
                <Box
                  key={d.dateValue}
                  onClick={() => setSelectedDate(d.dateValue)}
                  sx={{
                    minWidth: 56,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 1,
                    px: 1.5,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    bgcolor: isActive ? "primary.main" : "#f5f5f5",
                    boxShadow: isActive
                      ? "0 4px 12px rgba(25,118,210,0.35)"
                      : "0 2px 6px rgba(0,0,0,0.06)",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: isActive ? "rgba(255,255,255,0.8)" : "#999", lineHeight: 1, mb: 0.3 }}>
                    {weekdayLabel}
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: isActive ? "#fff" : "#111", lineHeight: 1 }}>
                    {d.day}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: isActive ? "rgba(255,255,255,0.7)" : "#aaa", mt: 0.3, lineHeight: 1 }}>
                    {d.month}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── ЛОКАЦИИ И СЕАНСЫ ── */}
        <Box sx={{ overflowY: "auto", px: 2, pb: 4, flex: 1 }}>
          {!currentDateData?.locations?.length && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ color: "#999", fontSize: 14 }}>
                Нет сеансов на выбранную дату
              </Typography>
            </Box>
          )}

          {currentDateData?.locations?.map((loc) => {
            const dateLabel = `${currentDateData.day} ${currentDateData.month}`;
            const fullDateLabel = `${dateLabel}, ${WEEKDAYS[Number(currentDateData.weekday)]}`;

            return (
              <Card
                key={loc.locationId}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  mb: 2,
                  overflow: "hidden",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.11)" },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Локация */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: 2,
                        bgcolor: "primary.main",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 16, color: "#fff" }} />
                    </Box>
                    <Box sx={{ ml: 0.5 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
                        {loc.locationName}
                      </Typography>
                      {loc.locationAddress && (
                        <Typography sx={{ fontSize: 12, color: "#999" }}>
                          {loc.locationAddress}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ height: "1px", bgcolor: "#f5f5f5", mb: 1.5 }} />

                  {/* Сеансы */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {loc.sessions?.map((session) => (
                      <Box
                        key={session.sessionId}
                        onClick={() =>
                          handleSessionClick({ session, loc, dateLabel: fullDateLabel })
                        }
                        sx={{
                          border: "1.5px solid #e8e8e8",
                          borderRadius: 2.5,
                          px: 2, py: 1,
                          cursor: "pointer",
                          bgcolor: "#fafafa",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          transition: "all 0.15s",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "#f0f6ff",
                            boxShadow: "0 2px 8px rgba(25,118,210,0.15)",
                          },
                          "&:active": {
                            bgcolor: "#e3f0ff",
                            borderColor: "primary.main",
                            transform: "scale(0.97)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                          <AccessTimeIcon sx={{ fontSize: 13, color: "primary.main" }} />
                          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#111" }}>
                            {session.sessionTime}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: "#888" }}>
                          {session.priceRange} TJS
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Drawer>

      {/* ── ШИТ ВЫБОРА КОЛИЧЕСТВА (без карты) ── */}
      <TicketCountSheet
        open={ticketSheet.open}
        onClose={() => setTicketSheet((s) => ({ ...s, open: false }))}
        session={ticketSheet.session}
        dateLabel={ticketSheet.dateLabel}
        onBuy={handleBuy}
      />
    </>
  );
}