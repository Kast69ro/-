import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import DateSwiper from "../../components/swipers/date-swiper.jsx";
import MovieCard from "../../components/cards/movie-card.jsx";

import { selectCategories } from "../../features/categories/categoriesSlice";
import {
  fetchEvents,
  selectEventsItems,
  selectEventsStatus,
} from "../../features/catalog/catalogSlice";

export default function CatalogScreen({ onMovieClick }) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const dispatch = useDispatch();

  const categories = useSelector(selectCategories);
  const eventsResponse = useSelector(selectEventsItems);
  const eventsStatus = useSelector(selectEventsStatus);

  const [activeTab, setActiveTab] = useState("all"); // all | today | tomorrow | pick
  const [selectedDate, setSelectedDate] = useState(""); // "" = дату НЕ отправляем

  const selectedCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(categoryId));
  }, [categories, categoryId]);

  const toYMDLocal = (d) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    const today = new Date();

    if (tab === "today") {
      setSelectedDate(toYMDLocal(today));
    } else if (tab === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      setSelectedDate(toYMDLocal(tomorrow));
    } else {
      // all | pick
      setSelectedDate("");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setActiveTab("pick");
  };

  // ✅ Запрос: getAllEventsV2 => categoryId (+ optional dateValue)
  useEffect(() => {
    if (!categoryId) return;

    const payload = {
      categoryId: String(categoryId),
      lang: "ru",
    };

    if (selectedDate) payload.dateValue = selectedDate;

    dispatch(fetchEvents(payload));
  }, [dispatch, categoryId, selectedDate]);

  // ✅ текущий формат API: [{ categoryId, categoryName, events: [...] }]
  const items = useMemo(() => {
    const arr = Array.isArray(eventsResponse) ? eventsResponse : [];
    return arr.flatMap((x) => x?.events ?? []);
  }, [eventsResponse]);

  // ✅ адаптер под MovieCard
  const mappedItems = useMemo(() => {
    return items.map((e) => ({
      id: e.eventId ?? e.id ?? `${e.title}-${e.poster ?? ""}`,
      title: e.eventName ?? e.title ?? "",
      poster: e.poster ?? "",
      genre: e.genre ?? "",
      ageRating: e.ageLimit ?? e.ageRating ?? "",
      description: e.description ?? "",
      _raw: e,
    }));
  }, [items]);

  const getChipStyles = (tab) => ({
    borderRadius: 999,
    fontWeight: 600,
    whiteSpace: "nowrap",
    ...(activeTab === tab
      ? {
          backgroundColor: "#E31E24",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#c81b20",
          },
        }
      : {
          // borderColor: "#E31E24",
        }),
  });

  const loading = eventsStatus === "loading" || eventsStatus === "idle";

  if (loading) {
    return (
      <Box className="min-h-dvh bg-neutral-50 pb-20">
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #eee",
          }}
        >
          <Toolbar
            sx={{
              minHeight: 56,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={120} height={28} />
            <Box sx={{ width: 40 }} />
          </Toolbar>

          <Box sx={{ px: 2, pb: 1.5, display: "flex", gap: 1 }}>
            <Skeleton
              variant="rounded"
              width={96}
              height={36}
              sx={{ borderRadius: 999 }}
            />
            <Skeleton
              variant="rounded"
              width={110}
              height={36}
              sx={{ borderRadius: 999 }}
            />
            <Skeleton
              variant="rounded"
              width={110}
              height={36}
              sx={{ borderRadius: 999 }}
            />
          </Box>
        </AppBar>

        <Box sx={{ px: 2, py: 2, display: "grid", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={192}
              sx={{ borderRadius: 16 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-dvh bg-background px-2.5 ">
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#f5f5f5",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #eee",
        }}
      >
        <Toolbar
          sx={{
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
          }}
        >
          <IconButton aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
            {selectedCategory?.categoryName ?? "Catalog"}
          </Typography>

          <Box sx={{ width: 40 }} />
        </Toolbar>

        <Box
          sx={{
            px: 2,
            pb: 1.5,
            display: "flex",
            gap: 1,
            mx: "auto",
            overflowX: "auto",
          }}
        >
          <Chip
            label="Все"
            clickable
            onClick={() => handleTabChange("all")}
            variant={activeTab === "all" ? "filled" : "outlined"}
            sx={getChipStyles("all")}
          />

          <Chip
            label="Сегодня"
            clickable
            onClick={() => handleTabChange("today")}
            variant={activeTab === "today" ? "filled" : "outlined"}
            sx={getChipStyles("today")}
          />

          <Chip
            label="Завтра"
            clickable
            onClick={() => handleTabChange("tomorrow")}
            variant={activeTab === "tomorrow" ? "filled" : "outlined"}
            sx={getChipStyles("tomorrow")}
          />

          <Chip
            label="Дата"
            clickable
            onClick={() => handleTabChange("pick")}
            variant={activeTab === "pick" ? "filled" : "outlined"}
            sx={getChipStyles("pick")}
          />
        </Box>

        {activeTab === "pick" && (
          <Box sx={{ pb: 1.5 }}>
            <DateSwiper
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </Box>
        )}
      </AppBar>

      <Box sx={{ display: "grid", gap: 2 }}>
        {mappedItems.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            onMovieClick={() => onMovieClick?.(m)}
            onShowSessions={() => onMovieClick?.(m)}
          />
        ))}

        {mappedItems.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: "#777" }}>
            Нет мероприятий
            {selectedDate ? (
              <>
                {" "}
                на <b>{selectedDate}</b>
              </>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}
