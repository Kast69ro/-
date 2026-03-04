// HallPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSeats,
  clearSeats,
  selectSeats,
  selectSeatsStatus,
  selectSeatsError,
} from "../../features/seats/seatsSlice";
import { IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

// ─── БРЕНД АКТИВ-БАНКА ────────────────────────────────────────────────────
const BRAND = {
  red:        "#E31E24",   // Актив-Ориент Красный
  redDark:    "#c01a1f",   // hover
  white:      "#ffffff",
  bg:         "#f5f5f5",
  gray:       "#c5c6c6",   // серый из палитры
  textMain:   "#000000",
  textSub:    "#6b7280",
  font:       "inherit",
};

const SEAT_COLORS = {
  STANDARD: "#f59e0b",
  COMFORT:  "#3b82f6",
  VIP:      "#a855f7",
  ECONOM:   "#10b981",
  DEFAULT:  "#f59e0b",
};

function getSeatColor(seatType) {
  if (!seatType) return SEAT_COLORS.DEFAULT;
  return SEAT_COLORS[seatType.toUpperCase()] ?? SEAT_COLORS.DEFAULT;
}

const MAX_TICKETS = 10;

// ─── ИКОНКА КРЕСЛА ────────────────────────────────────────────────────────

function SeatIcon({ color, size = 16 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 26 23" fill="none">
      <rect x="2" y="0" width="22" height="8" rx="3" fill={color} />
      <rect x="0" y="8" width="26" height="11" rx="3" fill={color} />
      <rect x="0" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="22" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="4" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
      <rect x="18" y="18" width="4" height="5" rx="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── СКЕЛЕТОН ─────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ padding: "40px 16px" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 3 }}>
          {[...Array(14)].map((_, j) => (
            <div key={j} style={{
              width: 18, height: 16, borderRadius: 3,
              background: BRAND.gray,
              animation: "pulse 1.5s infinite",
              animationDelay: `${(i + j) * 0.03}s`,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── ОДНО КРЕСЛО ──────────────────────────────────────────────────────────

function Seat({ seat, isSelected, onToggle, priceData, limitReached, scale }) {
  const booked = seat.bookedSeats === "1";
  const priceEntry = priceData.find(
    (p) => p.seatType?.toUpperCase() === seat.seatType?.toUpperCase()
  );
  const disabled = booked || (!isSelected && limitReached);

  let color;
  if (booked)          color = "#d1d5db";
  else if (isSelected) color = BRAND.red;   // выбрано — красный бренд
  else                 color = getSeatColor(seat.seatType);

  const size = Math.max(10, 22 * scale);

  return (
    <div
      onClick={() => !disabled && onToggle(seat)}
      title={
        booked     ? "Занято"
        : disabled ? `Максимум ${MAX_TICKETS} билетов`
        : `${seat.objectDescription} — ${priceEntry?.price} ${priceEntry?.currencyCode}`
      }
      style={{
        cursor: disabled ? "default" : "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled && !booked ? 0.35 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {booked ? (
        <div style={{
          width: size, height: size * 0.8,
          background: "#e5e7eb", borderRadius: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.5, color: "#9ca3af", fontWeight: 700,
        }}>✕</div>
      ) : (
        <div style={{
          transform: isSelected ? "scale(1.25)" : "scale(1)",
          transition: "transform 0.1s",
        }}>
          <SeatIcon color={color} size={size} />
        </div>
      )}
      {isSelected && !booked && (
        <div style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
          background: BRAND.red,
          color: BRAND.white,
          fontSize: 8,
          fontWeight: 700,
          borderRadius: 3,
          padding: "1px 3px",
          whiteSpace: "nowrap",
          zIndex: 10,
          fontFamily: BRAND.font,
        }}>
          {seat.place}
        </div>
      )}
    </div>
  );
}

// ─── ЛЕГЕНДА ──────────────────────────────────────────────────────────────

function Legend({ priceData }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 12, padding: "8px 16px 4px", flexWrap: "wrap",
    }}>
      {priceData.map((p) => (
        <div key={p.seatType} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <SeatIcon color={getSeatColor(p.seatType)} size={16} />
          <span style={{ fontSize: 12, color: BRAND.textMain, fontWeight: 500, fontFamily: BRAND.font }}>
            {p.name} — {p.price} {p.currencyCode}
          </span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 16, height: 13, background: "#e5e7eb", borderRadius: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "#9ca3af", fontWeight: 700,
        }}>✕</div>
        <span style={{ fontSize: 12, color: BRAND.textMain, fontWeight: 500, fontFamily: BRAND.font }}>Занято</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <SeatIcon color={BRAND.red} size={16} />
        <span style={{ fontSize: 12, color: BRAND.textMain, fontWeight: 500, fontFamily: BRAND.font }}>Выбрано</span>
      </div>
    </div>
  );
}

// ─── ХОЛСТ ЗАЛА ───────────────────────────────────────────────────────────

function HallCanvas({ seats, selectedSeats, onToggle, priceData, limitReached, mapWidth, mapHeight }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const validSeats = seats.filter(
    (s) => s.objectType === "seat" && s.left && s.top
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const containerW = entry.contentRect.width;
      setScale(containerW / Number(mapWidth));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mapWidth]);

  const canvasH = Number(mapHeight) * scale;

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", overflowX: "hidden", overflowY: "auto" }}
    >
      <div style={{ position: "relative", width: "100%", height: canvasH }}>
        {validSeats.map((seat) => {
          const x = Number(seat.left) * scale;
          const y = Number(seat.top)  * scale;
          return (
            <div
              key={seat.seatId}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <Seat
                seat={seat}
                priceData={priceData}
                limitReached={limitReached}
                isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                onToggle={onToggle}
                scale={scale}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── СТРАНИЦА ─────────────────────────────────────────────────────────────

export default function HallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    movieTitle   = "",
    sessionDate  = "",
    locationName = "",
    sessions     = [],
  } = state || {};

  const dispatch  = useDispatch();
  const seatsData = useSelector(selectSeats);
  const status    = useSelector(selectSeatsStatus);
  const error     = useSelector(selectSeatsError);

  

  const [activeSessionId, setActiveSessionId] = useState(sessionId);
  const [selectedSeats, setSelectedSeats]     = useState([]);
  const [limitWarning, setLimitWarning]       = useState(false);

  useEffect(() => {
    if (!activeSessionId) return;
    dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }));
    setSelectedSeats([]);
    return () => dispatch(clearSeats());
  }, [activeSessionId, dispatch]);

  const seats     = seatsData?.seats        ?? [];
  const priceData = seatsData?.seatTypePrice ?? [];
  const hallName  = seatsData?.hallName      ?? "";
  const mapWidth  = seatsData?.mapWidth      ?? "1686";
  const mapHeight = seatsData?.mapHeight     ?? "1084";

  const onlySeats    = seats.filter((s) => s.objectType === "seat" && s.left && s.top);
  const freeCount    = onlySeats.filter((s) => s.bookedSeats === "0").length;
  const limitReached = selectedSeats.length >= MAX_TICKETS;

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seat.seatId);
      if (exists) return prev.filter((s) => s.seatId !== seat.seatId);
      if (prev.length >= MAX_TICKETS) {
        setLimitWarning(true);
        setTimeout(() => setLimitWarning(false), 2500);
        return prev;
      }
      return [...prev, seat];
    });
  };

  const total = selectedSeats.reduce((sum, s) => {
    const p = priceData.find(
      (x) => x.seatType?.toUpperCase() === s.seatType?.toUpperCase()
    );
    return sum + Number(p?.price || 0);
  }, 0);

  const handleBuy = () => {
    const seatTicketArr = selectedSeats.map((seat) => ({
      seatId: seat.seatId,
      ticketId: priceData.find(
        (p) => p.seatType?.toUpperCase() === seat.seatType?.toUpperCase()
      )?.ticketId,
    }));
    navigate("/checkout", {
      state: { seatTicketArr, total, sessionId: activeSessionId },
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: BRAND.bg,            // фон #f5f5f5
      fontFamily: BRAND.font,
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      paddingBottom: selectedSeats.length > 0 ? 90 : 20,
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .buy-btn:hover { background: ${BRAND.redDark} !important; }
        .retry-btn:hover { color: ${BRAND.redDark} !important; }
        .session-card:hover { opacity: 0.9; }
      `}</style>

      {/* ── Тост лимита ── */}
      {limitWarning && (
        <div style={{
          position: "fixed", top: 16, left: "50%",
          background: BRAND.textMain,
          color: BRAND.white,
          borderRadius: 10, padding: "10px 20px",
          fontSize: 13, fontWeight: 600, zIndex: 300,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          animation: "fadeInDown 0.2s ease",
          whiteSpace: "nowrap",
          fontFamily: BRAND.font,
        }}>
          Максимум {MAX_TICKETS} билетов за один раз
        </div>
      )}

      {/* ── Шапка — белая ── */}
      <div style={{
        background: BRAND.white,
        padding: "16px 16px 20px",
        borderBottom: `3px solid ${BRAND.red}`,   // красная линия под шапкой
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
             {/* Градиент снизу */}
        

        {/* Кнопка назад */}
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Назад"
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            bgcolor: "rgba(255,255,255,0.9)",
            border: "1px solid #e0e0e0",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
          <div style={{
            flex: 1,
            fontWeight: 700,
            fontSize: 18,
            color: BRAND.textMain,
            fontFamily: BRAND.font,
          }}>
            {movieTitle}
          </div>
        </div>
        <div style={{
          color: BRAND.textSub,
          fontSize: 14,
          marginBottom: sessions.length ? 16 : 0,
          fontFamily: BRAND.font,
        }}>
          {sessionDate}
        </div>

        {/* Сеансы */}
        {sessions.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sessions.map((s) => {
              const active = activeSessionId === s.sessionId;
              return (
                <div
                  key={s.sessionId}
                  className="session-card"
                  onClick={() => { setActiveSessionId(s.sessionId); setSelectedSeats([]); }}
                  style={{
                    cursor: "pointer",
                    background: active ? BRAND.red : BRAND.bg,
                    border: `2px solid ${active ? BRAND.red : BRAND.gray}`,
                    borderRadius: 10,
                    padding: "8px 16px",
                    textAlign: "center",
                    minWidth: 76,
                    transition: "background 0.15s, border-color 0.15s",
                    fontFamily: BRAND.font,
                  }}
                >
                  <div style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: active ? BRAND.white : BRAND.textMain,
                  }}>
                    {s.sessionTime}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: active ? "rgba(255,255,255,0.85)" : BRAND.textSub,
                  }}>
                    {s.mediaType}
                  </div>
                  <div style={{
                    fontSize: 11,
                    marginTop: 3,
                    color: active ? "rgba(255,255,255,0.75)" : BRAND.gray,
                  }}>
                    от {s.minPrice} {s.currencyCode}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Название зала ── */}
      <div style={{ textAlign: "center", padding: "14px 16px 6px", background: BRAND.white }}>
        <div style={{
          fontWeight: 700,
          fontSize: 17,
          color: BRAND.textMain,
          fontFamily: BRAND.font,
        }}>
          {locationName}
        </div>
        <div style={{
          color: BRAND.textSub,
          fontSize: 13,
          marginTop: 2,
          fontFamily: BRAND.font,
        }}>
          {hallName}
        </div>
      </div>

      {/* ── Состояния ── */}
      {status === "loading" && <Skeleton />}

      {status === "failed" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: BRAND.red, fontSize: 14, marginBottom: 12, fontFamily: BRAND.font }}>
            {error}
          </div>
          <div
            className="retry-btn"
            onClick={() => dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }))}
            style={{
              color: BRAND.red,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: BRAND.font,
              transition: "color 0.15s",
            }}
          >
            Повторить
          </div>
        </div>
      )}

      {status === "succeeded" && (
        <div style={{ background: BRAND.white, margin: "0 0 12px", borderRadius: "0 0 12px 12px" }}>
          <Legend priceData={priceData} />

          <div style={{
            textAlign: "center",
            color: BRAND.textSub,
            fontSize: 12,
            marginBottom: 8,
            fontFamily: BRAND.font,
          }}>
            Осталось мест: {freeCount}
            {limitReached && (
              <span style={{ color: BRAND.red, fontWeight: 600, marginLeft: 8 }}>
                · Выбрано {MAX_TICKETS}/{MAX_TICKETS}
              </span>
            )}
          </div>

          {/* Экран */}
          <div style={{ textAlign: "center", margin: "0 20px 8px" }}>
            <div style={{
              height: 14, marginBottom: 3,
              background: `linear-gradient(180deg, ${BRAND.gray} 0%, #000 100%)`,
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            }} />
            <div style={{
              fontSize: 9,
              color: BRAND.textSub,
              letterSpacing: 4,
              fontWeight: 600,
              fontFamily: BRAND.font,
            }}>
              ЭКРАН
            </div>
          </div>

          {/* ── Холст с местами ── */}
          <HallCanvas
            seats={seats}
            selectedSeats={selectedSeats}
            onToggle={toggleSeat}
            priceData={priceData}
            limitReached={limitReached}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
          />
        </div>
      )}

      {/* ── Панель покупки ── */}
      {selectedSeats.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: BRAND.white,
          borderTop: `3px solid ${BRAND.red}`,
          borderRadius: "16px 16px 0 0",
          padding: "16px 20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
          zIndex: 100,
          animation: "slideUp 0.2s ease",
          fontFamily: BRAND.font,
        }}>
          <div>
            <div style={{
              color: BRAND.textMain,
              fontWeight: 800,
              fontSize: 24,
              fontFamily: BRAND.font,
            }}>
              {total.toFixed(2)} TJS
            </div>
            <div style={{
              color: BRAND.textSub,
              fontSize: 13,
              fontFamily: BRAND.font,
            }}>
              За {selectedSeats.length} {selectedSeats.length === 1 ? "билет" : "билетов"}
            </div>
          </div>

          {/* ── КНОПКА КУПИТЬ — красная по брендбуку ── */}
          <button
            className="buy-btn"
            onClick={handleBuy}
            style={{
              background: BRAND.red,
              color: BRAND.white,
              border: "none",
              borderRadius: 10,
              padding: "14px 32px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: BRAND.font,
              letterSpacing: 0.3,
              transition: "background 0.15s",
              boxShadow: `0 4px 12px rgba(227,30,36,0.35)`,
            }}
          >
            Купить
          </button>
        </div>
      )}
    </div>
  );
}