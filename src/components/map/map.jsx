import { useState } from "react";

// ─── ДАННЫЕ ЗАЛА (имитация getSeatsV2) ────────────────────────────────────

function buildSeats() {
  const seats = [];
  // Ряды 1-4: по 17 мест, тип STANDARD (50 TJS)
  const row1_4counts = [17, 16, 16, 16];
  row1_4counts.forEach((count, ri) => {
    const row = ri + 1;
    for (let p = 1; p <= count; p++) {
      seats.push({
        seatId: `r${row}_${p}`,
        objectType: "seat",
        rowNum: String(row),
        sector: "STANDARD",
        place: String(p),
        bookedSeats: (row === 2 && (p === 5 || p === 11)) || (row === 3 && p === 8) ? "1" : "0",
        seatType: "STANDARD",
        objectTitle: String(p),
        objectDescription: `Ряд ${row}, место ${p}`,
      });
    }
  });
  // Ряды 5-10: по 18-20 мест
  const row5_10counts = [19, 19, 18, 17, 17, 20];
  row5_10counts.forEach((count, ri) => {
    const row = ri + 5;
    for (let p = 1; p <= count; p++) {
      seats.push({
        seatId: `r${row}_${p}`,
        objectType: "seat",
        rowNum: String(row),
        sector: "STANDARD",
        place: String(p),
        bookedSeats:
          (row === 6 && (p === 3 || p === 7 || p === 14)) ||
          (row === 7 && (p === 1 || p === 9)) ||
          (row === 8 && p === 12) ||
          (row === 9 && (p === 5 || p === 16)) ? "1" : "0",
        seatType: "STANDARD",
        objectTitle: String(p),
        objectDescription: `Ряд ${row}, место ${p}`,
      });
    }
  });
  // VIP1: 6 мест
  for (let p = 1; p <= 6; p++) {
    seats.push({
      seatId: `vip1_${p}`,
      objectType: "seat",
      rowNum: "VIP1",
      sector: "VIP",
      place: String(p),
      bookedSeats: p === 3 ? "1" : "0",
      seatType: "VIP",
      objectTitle: String(p),
      objectDescription: `VIP1, место ${p}`,
    });
  }
  // VIP2: 6 мест
  for (let p = 1; p <= 6; p++) {
    seats.push({
      seatId: `vip2_${p}`,
      objectType: "seat",
      rowNum: "VIP2",
      sector: "VIP",
      place: String(p),
      bookedSeats: p === 2 || p === 5 ? "1" : "0",
      seatType: "VIP",
      objectTitle: String(p),
      objectDescription: `VIP2, место ${p}`,
    });
  }
  return seats;
}

const ALL_SEATS = buildSeats();
const PRICE_DATA = [
  { seatType: "STANDARD", price: 50, currencyCode: "TJS", ticketId: "t1" },
  { seatType: "VIP", price: 80, currencyCode: "TJS", ticketId: "t2" },
];
const SESSIONS = [
  { sessionId: "1", time: "18:45", mediaType: "2D", minPrice: 55 },
  { sessionId: "2", time: "23:30", mediaType: "2D", minPrice: 50, active: true },
];

// ─── ИКОНКА КРЕСЛА ────────────────────────────────────────────────────────

function SeatIcon({ color, size = 26 }) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 26 23" fill="none">
      {/* спинка */}
      <rect x="2" y="0" width="22" height="8" rx="3" fill={color} />
      {/* сиденье */}
      <rect x="0" y="8" width="26" height="11" rx="3" fill={color} />
      {/* подлокотники */}
      <rect x="0" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      <rect x="22" y="10" width="4" height="10" rx="2" fill={color} opacity="0.7" />
      {/* ножки */}
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
    <div
      onClick={() => !booked && onToggle(seat)}
      title={booked ? "Занято" : seat.objectDescription}
      style={{
        cursor: booked ? "default" : "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.1s",
      }}
    >
      {booked ? (
        // Занято — крестик
        <div style={{
          width: 22, height: 19,
          background: "#e5e7eb",
          borderRadius: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#9ca3af", fontWeight: 700,
        }}>✕</div>
      ) : (
        <div style={{ transform: isSelected ? "scale(1.15)" : "scale(1)", transition: "transform 0.1s" }}>
          <SeatIcon color={color} size={isVip ? 28 : 24} />
        </div>
      )}
      {/* номер места при выборе */}
      {isSelected && !booked && (
        <div style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          background: "#22c55e", color: "#fff",
          fontSize: 9, fontWeight: 700,
          borderRadius: 3, padding: "1px 4px",
          whiteSpace: "nowrap",
        }}>
          {seat.place}
        </div>
      )}
    </div>
  );
}

// ─── ОДИН РЯД ────────────────────────────────────────────────────────────

function Row({ rowNum, seats, selectedSeats, onToggle, isVip = false }) {
  const label = (
    <div style={{
      minWidth: 28,
      fontSize: 11,
      color: "#9ca3af",
      textAlign: "center",
      fontWeight: 500,
      paddingTop: isVip ? 0 : 2,
    }}>
      {isVip ? rowNum : rowNum}
    </div>
  );

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: isVip ? 4 : 2,
      marginBottom: isVip ? 4 : 1,
    }}>
      {label}
      <div style={{ display: "flex", gap: isVip ? 6 : 3, alignItems: "center" }}>
        {seats.map(seat => (
          <Seat key={seat.seatId} seat={seat}
            isSelected={selectedSeats.some(s => s.seatId === seat.seatId)}
            onToggle={onToggle} />
        ))}
      </div>
      {label}
    </div>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────

export default function App() {
  const [selectedSession, setSelectedSession] = useState("2");
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    setSelectedSeats(prev =>
      prev.find(s => s.seatId === seat.seatId)
        ? prev.filter(s => s.seatId !== seat.seatId)
        : [...prev, seat]
    );
  };

  // Группируем по рядам
  const rowNums = [...new Set(ALL_SEATS.filter(s => s.seatType === "STANDARD").map(s => s.rowNum))];
  const vip1Seats = ALL_SEATS.filter(s => s.rowNum === "VIP1");
  const vip2Seats = ALL_SEATS.filter(s => s.rowNum === "VIP2");

  const freeCount = ALL_SEATS.filter(s => s.bookedSeats === "0").length;

  // Итого
  const total = selectedSeats.reduce((sum, s) => {
    const p = PRICE_DATA.find(x => x.seatType === s.seatType);
    return sum + (p?.price || 0);
  }, 0);

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

      {/* Шапка */}
      <div style={{
        background: "#111827",
        color: "#fff",
        padding: "16px 16px 20px",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 22, color: "#9ca3af", cursor: "pointer" }}>←</div>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 18 }}>Ограбление в Лос-Андже...</div>
        </div>
        <div style={{ color: "#9ca3af", fontSize: 14, marginBottom: 16 }}>
          24 февраля, вторник
        </div>

        {/* Сеансы */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-start" }}>
          {SESSIONS.map(s => (
            <div key={s.sessionId}
              onClick={() => setSelectedSession(s.sessionId)}
              style={{
                cursor: "pointer",
                background: selectedSession === s.sessionId ? "#22c55e" : "#374151",
                borderRadius: 10,
                padding: "8px 18px",
                textAlign: "center",
                minWidth: 80,
                transition: "background 0.15s",
              }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{s.time}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{s.mediaType}</div>
              <div style={{ fontSize: 12, color: selectedSession === s.sessionId ? "rgba(255,255,255,0.8)" : "#9ca3af", marginTop: 4 }}>
                от {s.minPrice} TJS
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Название кинотеатра */}
      <div style={{ textAlign: "center", padding: "18px 16px 8px" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>Кинотеатр «Навруз»</div>
        <div style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>Зал 1</div>
      </div>

      {/* Легенда */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, padding: "8px 16px 4px",
      }}>
        {[
          { color: "#f59e0b", label: "50 TJS" },
          { color: "#a855f7", label: "80 TJS" },
          { color: "#e5e7eb", label: "Занято", isX: true },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {item.isX ? (
              <div style={{
                width: 20, height: 17, background: item.color,
                borderRadius: 3, fontSize: 10, color: "#9ca3af",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
              }}>✕</div>
            ) : (
              <SeatIcon color={item.color} size={20} />
            )}
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginBottom: 12 }}>
        Осталось мест: {freeCount}
      </div>

      {/* ЭКРАН */}
      <div style={{ position: "relative", textAlign: "center", margin: "0 20px 8px" }}>
        <div style={{
          height: 16,
          background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
          marginBottom: 4,
        }} />
        <div style={{ fontSize: 10, color: "#9ca3af", letterSpacing: 4, fontWeight: 600 }}>ЭКРАН</div>
      </div>

      {/* ЗОНА МЕСТ */}
      <div style={{ padding: "8px 4px", overflowX: "auto" }}>

        {/* Группа рядов 1-4 */}
        <div style={{ marginBottom: 14 }}>
          {[1,2,3,4].map(rn => {
            const rowSeats = ALL_SEATS.filter(s => s.rowNum === String(rn));
            return (
              <Row key={rn} rowNum={rn} seats={rowSeats}
                selectedSeats={selectedSeats} onToggle={toggleSeat} />
            );
          })}
        </div>

        {/* Группа рядов 5-10 */}
        <div style={{ marginBottom: 14 }}>
          {[5,6,7,8,9,10].map(rn => {
            const rowSeats = ALL_SEATS.filter(s => s.rowNum === String(rn));
            return (
              <Row key={rn} rowNum={rn} seats={rowSeats}
                selectedSeats={selectedSeats} onToggle={toggleSeat} />
            );
          })}
        </div>

        {/* VIP */}
        <div>
          <Row rowNum="VIP1" seats={vip1Seats}
            selectedSeats={selectedSeats} onToggle={toggleSeat} isVip />
          <Row rowNum="VIP2" seats={vip2Seats}
            selectedSeats={selectedSeats} onToggle={toggleSeat} isVip />
        </div>
      </div>

      {/* ПАНЕЛЬ ПОКУПКИ (появляется при выборе мест) */}
      {selectedSeats.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "#1f2937",
          borderRadius: "16px 16px 0 0",
          padding: "16px 20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
          zIndex: 100,
          animation: "slideUp 0.2s ease",
        }}>
          <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }`}</style>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 24 }}>
              {total} TJS
            </div>
            <div style={{ color: "#9ca3af", fontSize: 13 }}>
              За {selectedSeats.length} {selectedSeats.length === 1 ? "билет" : "билетов"}
            </div>
          </div>
          <button style={{
            background: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}>
            Купить
          </button>
        </div>
      )}
    </div>
  );
}