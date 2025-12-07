// src/components/ProfileHeatmap.jsx
import { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";

export default function ProfileHeatmap({ data = {} }) {
  const today = new Date();

  // Month dropdown: store selected month + year
  const [selectedMonth, setSelectedMonth] = useState({
    month: today.getMonth(), // 0-11
    year: today.getFullYear(),
  });

  const handleMonthChange = (e) => {
    const [y, m] = e.target.value.split("-").map(Number);
    setSelectedMonth({ month: m, year: y });
  };

  // Prepare month list (past 12 months)
  const monthOptions = useMemo(() => {
    const arr = [];
    const d = new Date();

    for (let i = 0; i < 12; i++) {
      const y = d.getFullYear();
      const m = d.getMonth();

      arr.push({
        label: `${d.toLocaleString("en-US", { month: "long" })} ${y}`,
        value: `${y}-${m}`,
      });

      d.setMonth(m - 1);
    }
    return arr.reverse();
  }, []);

  // Heatmap color scale
  const colors = {
    0: useColorModeValue("#e5e7eb", "#1f2937"),
    1: useColorModeValue("#c6e48b", "#064e3b"),
    2: useColorModeValue("#7bc96f", "#065f46"),
    3: useColorModeValue("#239a3b", "#047857"),
    4: useColorModeValue("#196127", "#059669"),
  };

  const colorForCount = (n) => {
    if (n <= 0) return colors[0];
    if (n <= 2) return colors[1];
    if (n <= 4) return colors[2];
    if (n <= 7) return colors[3];
    return colors[4];
  };

  // Generate calendar for selected month
  const calendarGrid = useMemo(() => {
    const { month, year } = selectedMonth;

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];

    // number of empty cells before the first day starts
    const startDay = firstDay.getDay(); // 0 = Sunday

    for (let i = 0; i < startDay; i++) {
      grid.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const key = dateObj.toISOString().slice(0, 10);
      const count = data[key] || 0;

      grid.push({
        key,
        dateObj,
        count,
      });
    }

    return grid;
  }, [selectedMonth, data]);

  return (
    <Box
      w="100%"
      p={6}
      rounded="lg"
      bg={useColorModeValue("white", "gray.900")}
      boxShadow="sm"
    >
      {/* HEADER ---------------------- */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Activity Heatmap
        </Text>

        <Select
          w="220px"
          value={`${selectedMonth.year}-${selectedMonth.month}`}
          onChange={handleMonthChange}
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </Flex>

      {/* WEEKDAY LABELS */}
      <Flex justify="space-between" mb={2} px={1}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Text key={d} fontSize="xs" color="gray.500" w="14%" textAlign="center">
            {d}
          </Text>
        ))}
      </Flex>

      {/* CALENDAR GRID ---------------------- */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap={2}
      >
        {calendarGrid.map((cell, idx) =>
          cell ? (
            <Tooltip
              key={idx}
              label={`${cell.dateObj.toLocaleDateString()} — ${cell.count} submissions`}
              hasArrow
            >
              <Box
                bg={colorForCount(cell.count)}
                w="100%"
                h="32px"
                borderRadius="6px"
              />
            </Tooltip>
          ) : (
            <Box key={idx} />
          )
        )}
      </Box>
    </Box>
  );
}
