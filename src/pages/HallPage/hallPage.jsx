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
              background: "#f3f4f6",
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
  else if (isSelected) color = "#22c55e";
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
          background: "#22c55e",
          color: "#fff",
          fontSize: 8,
          fontWeight: 700,
          borderRadius: 3,
          padding: "1px 3px",
          whiteSpace: "nowrap",
          zIndex: 10,
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
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>
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
        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>Занято</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <SeatIcon color="#22c55e" size={16} />
        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>Выбрано</span>
      </div>
    </div>
  );
}

// ─── ХОЛСТ ЗАЛА ───────────────────────────────────────────────────────────

function HallCanvas({ seats, selectedSeats, onToggle, priceData, limitReached, mapWidth, mapHeight }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Фильтруем только реальные места с координатами
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
      style={{
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <div style={{
        position: "relative",
        width: "100%",
        height: canvasH,
      }}>
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
      background: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      `}</style>

      {/* ── Тост лимита ── */}
      {limitWarning && (
        <div style={{
          position: "fixed", top: 16, left: "50%",
          background: "#1f2937", color: "#fff",
          borderRadius: 10, padding: "10px 20px",
          fontSize: 13, fontWeight: 600, zIndex: 300,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          animation: "fadeInDown 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          Максимум {MAX_TICKETS} билетов за один раз
        </div>
      )}

      {/* ── Шапка ── */}
      <div style={{
        background: "#f5f5f5",
        padding: "16px 16px 20px",
        borderBottom: "1px solid #e5e7eb",
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <div
            onClick={() => navigate(-1)}
            style={{ fontSize: 22, color: "#6b7280", cursor: "pointer", paddingRight: 8 }}
          >←</div>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            {movieTitle}
          </div>
        </div>
        <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: sessions.length ? 16 : 0 }}>
          {sessionDate}
        </div>

        {sessions.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sessions.map((s) => {
              const active = activeSessionId === s.sessionId;
              return (
                <div
                  key={s.sessionId}
                  onClick={() => { setActiveSessionId(s.sessionId); setSelectedSeats([]); }}
                  style={{
                    cursor: "pointer",
                    background: active ? "#22c55e" : "#e5e7eb",
                    borderRadius: 10, padding: "8px 16px",
                    textAlign: "center", minWidth: 76,
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 18, color: active ? "#fff" : "#111827" }}>
                    {s.sessionTime}
                  </div>
                  <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.85)" : "#6b7280" }}>
                    {s.mediaType}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 3, color: active ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>
                    от {s.minPrice} {s.currencyCode}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Название зала ── */}
      <div style={{ textAlign: "center", padding: "14px 16px 6px" }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>{locationName}</div>
        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{hallName}</div>
      </div>

      {/* ── Состояния ── */}
      {status === "loading" && <Skeleton />}

      {status === "failed" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: "#ef4444", fontSize: 14, marginBottom: 12 }}>{error}</div>
          <div
            onClick={() => dispatch(fetchSeats({ sessionId: activeSessionId, bookedSeats: -1 }))}
            style={{ color: "#3b82f6", cursor: "pointer", fontSize: 13 }}
          >
            Повторить
          </div>
        </div>
      )}

      {status === "succeeded" && (
        <>
          <Legend priceData={priceData} />

          <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, marginBottom: 8 }}>
            Осталось мест: {freeCount}
            {limitReached && (
              <span style={{ color: "#f59e0b", fontWeight: 600, marginLeft: 8 }}>
                · Выбрано {MAX_TICKETS}/{MAX_TICKETS}
              </span>
            )}
          </div>

          {/* Экран */}
          <div style={{ textAlign: "center", margin: "0 20px 8px" }}>
            <div style={{
              height: 14, marginBottom: 3,
              background: "linear-gradient(180deg, #9ca3af 0%, #d1d5db 100%)",
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            }} />
            <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: 4, fontWeight: 600 }}>
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
        </>
      )}

      {/* ── Панель покупки ── */}
      {selectedSeats.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480, background: "#1f2937",
          borderRadius: "16px 16px 0 0", padding: "16px 20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.18)", zIndex: 100,
          animation: "slideUp 0.2s ease",
        }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 24 }}>
              {total.toFixed(2)} TJS
            </div>
            <div style={{ color: "#9ca3af", fontSize: 13 }}>
              За {selectedSeats.length} {selectedSeats.length === 1 ? "билет" : "билетов"}
            </div>
          </div>
          <button onClick={handleBuy} style={{
            background: "#22c55e", color: "#fff", border: "none",
            borderRadius: 12, padding: "14px 32px",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
          }}>
            Купить
          </button>
        </div>
      )}
    </div>
  );
}