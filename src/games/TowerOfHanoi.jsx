// src/games/TowerOfHanoi.jsx
// Final simplified version (per your request):
// - Header
// - Main: Stats (left) + Game Board (center)  (click-to-move primary, drag optional)
// - Move History (full-width row placed AFTER the middle section, centered)
// - Clear rules section
// - Easy-to-play: click a rod or disk to pick top disk, click target rod to drop
// - Drag-and-drop still supported via dnd-kit
//
// Paste this file exactly into: src/games/TowerOfHanoi.jsx
// Install required deps if not present:
// npm install @dnd-kit/core framer-motion canvas-confetti
// or
// yarn add @dnd-kit/core framer-motion canvas-confetti

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  chakra,
  Button,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  useToast,
  Collapse,
  IconButton,
  Badge,
  Center,
  Select,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { submitScore } from "../services/api";
import { minMovesFor } from "../utils/towerUtils";
import {
  ArrowBackIcon,
  InfoOutlineIcon,
  RepeatIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";

let confetti = null;
try {
  confetti = require("canvas-confetti");
} catch (e) {
  confetti = null;
}

const MotionBox = chakra(motion.div);

// Themes
const THEMES = {
  Neon: {
    diskColors: [
      ["#00F5A0", "#00C2FF"],
      ["#FF6EC7", "#FFAE00"],
      ["#7C4DFF", "#00FFA8"],
      ["#FF4D4D", "#FFD24D"],
      ["#00F0FF", "#7DFF6A"],
      ["#FF69B4", "#8A2BE2"],
    ],
    bg: "linear-gradient(180deg,#071427,#071427 60%,#031022)",
    text: "white",
    glass: "rgba(255,255,255,0.04)",
  },
  Candy: {
    diskColors: [
      ["#FFB3C6", "#FF8FA3"],
      ["#FFD9A8", "#FFB84D"],
      ["#C4F0FF", "#8DE7FF"],
      ["#E0C8FF", "#C09CFF"],
      ["#FFDECB", "#FFC7A9"],
      ["#D3FFD8", "#A6FFBF"],
    ],
    bg: "linear-gradient(180deg,#fff7fb,#fffaf0)",
    text: "gray.800",
    glass: "rgba(255,255,255,0.75)",
  },
  Minimal: {
    diskColors: [
      ["#E2E8F0", "#CBD5E1"],
      ["#C7D2FE", "#E9D5FF"],
      ["#FDE68A", "#FECACA"],
      ["#D1FAE5", "#F0F9FF"],
      ["#F3E8FF", "#E6FFFA"],
      ["#E6E6E6", "#FFFFFF"],
    ],
    bg: "linear-gradient(180deg,#f7f8fa,#ffffff)",
    text: "gray.800",
    glass: "rgba(255,255,255,0.85)",
  },
  Futuristic: {
    diskColors: [
      ["#00F0FF", "#00B4FF"],
      ["#8AFF7A", "#44FF9B"],
      ["#FF6BE2", "#FF3CAA"],
      ["#FFD84D", "#FF9D4D"],
      ["#7CDBFF", "#57A6FF"],
      ["#C792FF", "#8257FF"],
    ],
    bg: "linear-gradient(180deg,#020617,#071426)",
    text: "white",
    glass: "rgba(255,255,255,0.03)",
  },
};

const LEVELS = { Easy: 3, Medium: 4, Hard: 5, Expert: 6 };

export default function TowerOfHanoi() {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  // UI / Theme
  const [themeName, setThemeName] = useState("Candy");
  const theme = THEMES[themeName] || THEMES.Candy;

  // Game state
  const [level, setLevel] = useState("Easy");
  const [diskCount, setDiskCount] = useState(LEVELS[level]);
  const [rods, setRods] = useState([[], [], []]); // bottom->top numbers
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]); // newest first
  const [selectedRod, setSelectedRod] = useState(null); // click-to-move
  const [showRules, setShowRules] = useState(false);
  const [draggingDisk, setDraggingDisk] = useState(null);

  const timerRef = useRef(null);
  const solvedRef = useRef(false);

  // dnd sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // initialize
  useEffect(() => setDiskCount(LEVELS[level]), [level]);
  useEffect(() => initGame(diskCount), [diskCount]);

  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (!solvedRef.current && rods[2].length === diskCount) {
      const ok = rods[2].every((d, i) => d === diskCount - i);
      if (ok) {
        solvedRef.current = true;
        setRunning(false);
        doWin();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rods]);

  function initGame(n) {
    clearInterval(timerRef.current);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    solvedRef.current = false;
    setMoveHistory([]);
    setSelectedRod(null);
    setDraggingDisk(null);
    const start = [];
    for (let i = n; i >= 1; i--) start.push(i);
    setRods([start, [], []]);
  }

  function ensureRunning() {
    if (!running && !solvedRef.current) setRunning(true);
  }

  // CLICK-TO-MOVE: simple and primary
  function handleRodClick(idx) {
    ensureRunning();
    // if nothing selected, pick top disk (if any)
    if (selectedRod === null) {
      if (rods[idx].length === 0) {
        toast({ title: "Empty", description: "No disk on this rod to pick.", status: "info", duration: 700 });
        return;
      }
      setSelectedRod(idx);
      toast({ title: "Picked", description: `Top disk picked from Rod ${idx + 1}. Click another rod to place.`, status: "info", duration: 900 });
      return;
    }

    // clicking same rod cancels pick
    if (selectedRod === idx) {
      setSelectedRod(null);
      return;
    }

    // attempt move selectedRod -> idx
    const from = selectedRod;
    const to = idx;
    const source = [...rods[from]];
    const target = [...rods[to]];
    if (source.length === 0) {
      setSelectedRod(null);
      return;
    }
    const disk = source[source.length - 1];
    const topTarget = target[target.length - 1];
    if (topTarget && topTarget < disk) {
      toast({ title: "Invalid", description: "Cannot place larger disk on smaller one.", status: "warning", duration: 1100 });
      setSelectedRod(null);
      return;
    }

    source.pop();
    target.push(disk);
    setRods((prev) => prev.map((r, i) => (i === from ? source : i === to ? target : r)));
    setMoves((m) => m + 1);
    setMoveHistory((h) => [{ from: from + 1, to: to + 1, disk, t: Date.now() }, ...h].slice(0, 200));
    setSelectedRod(null);
  }

  // DnD: Disk component (only top disk gets draggable listeners)
  function Disk({ disk, from }) {
    const isTop = rods[from].length > 0 && rods[from][rods[from].length - 1] === disk;
    const id = `disk-${disk}-r${from}`;
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id,
      data: { disk, from },
    });

    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    const colorIdx = Math.min(disk - 1, theme.diskColors.length - 1);
    const [c1, c2] = theme.diskColors[colorIdx];
    const widthPercent = 36 + (disk / diskCount) * 60;

    return (
      <MotionBox
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        borderRadius="full"
        py={{ base: 2, md: 3 }}
        bgGradient={`linear(to-r, ${c1}, ${c2})`}
        color={theme.text}
        fontWeight="semibold"
        shadow={isDragging ? "2xl" : "md"}
        width={`${widthPercent}%`}
        textAlign="center"
        cursor={isTop ? "grab" : "not-allowed"}
        {...(isTop ? { ...listeners, ...attributes } : {})}
        onPointerDown={() => ensureRunning()}
      >
        <Text fontSize={{ base: "xs", md: "sm" }}>{disk}</Text>
      </MotionBox>
    );
  }

  function RodZone({ idx, children }) {
    const { isOver, setNodeRef } = useDroppable({ id: `rod-${idx}` });
    return (
      <Box
        ref={setNodeRef}
        p={4}
        minH={{ base: "200px", md: "300px" }}
        borderRadius="lg"
        cursor="pointer"
        bg={isOver ? "rgba(255,255,255,0.03)" : "transparent"}
        onClick={() => handleRodClick(idx)}
        position="relative"
      >
        <Box
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          bottom="12px"
          width={{ base: "8px", md: "10px" }}
          height={{ base: "180px", md: "240px" }}
          bg={colorMode === "dark" ? "#111827" : "#2d3748"}
          borderRadius="full"
          boxShadow={`0 8px 20px -8px ${theme.text}22, inset 0 0 18px -10px ${theme.text}44`}
        />
        {children}
      </Box>
    );
  }

  function onDragStart(e) {
    const d = e.active?.data?.current;
    if (d) {
      setDraggingDisk(d.disk);
      ensureRunning();
    }
  }

  function onDragEnd(e) {
    const activeData = e.active?.data?.current;
    const over = e.over;
    setDraggingDisk(null);
    if (!activeData) return;
    if (!over || !over.id) return;
    const toIdx = Number(over.id.split("-")[1]);
    const fromIdx = activeData.from;

    // validate top
    const source = [...rods[fromIdx]];
    const target = [...rods[toIdx]];
    if (source.length === 0) return;
    const disk = source[source.length - 1];
    if (disk !== activeData.disk) {
      toast({ title: "Invalid", description: "Only top disk can be moved.", status: "warning", duration: 900 });
      return;
    }
    const topTarget = target[target.length - 1];
    if (topTarget && topTarget < disk) {
      toast({ title: "Invalid", description: "Cannot place larger on smaller.", status: "warning", duration: 1100 });
      return;
    }
    source.pop();
    target.push(disk);
    setRods((prev) => prev.map((r, i) => (i === fromIdx ? source : i === toIdx ? target : r)));
    setMoves((m) => m + 1);
    setMoveHistory((h) => [{ from: fromIdx + 1, to: toIdx + 1, disk, t: Date.now() }, ...h].slice(0, 200));
  }

  // confetti
  function celebrate() {
    try {
      if (confetti) confetti({ particleCount: 120, spread: 110, origin: { x: 0.5, y: 0.25 } });
    } catch (e) {}
  }

  // win
  async function doWin() {
    celebrate();
    // compute and submit
    const minMoves = minMovesFor(diskCount);
    const actualMoves = moves;
    const timeTaken = seconds;
    const baseScore = (minMoves / Math.max(actualMoves, 1)) * 100;
    const finalScore = Math.max(0, Math.round(baseScore - timeTaken / 2));
    const payload = { game: "Tower of Hanoi", score: finalScore, timeTaken, moves: actualMoves, level, category: `TowerOfHanoi-${diskCount}` };
    try {
      await submitScore(payload);
      toast({ title: "Score submitted", description: `Score: ${finalScore}`, status: "success", duration: 1200 });
    } catch (err) {
      console.error(err);
      toast({ title: "Submit failed", description: "Saved locally", status: "warning", duration: 1200 });
    }
    navigate("/result", { state: payload });
  }

  function handleRestart() {
    initGame(diskCount);
    toast({ title: "Restarted", status: "info", duration: 700 });
  }

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function DragPreview({ disk }) {
    if (!disk) return null;
    const idx = Math.min(disk - 1, theme.diskColors.length - 1);
    const [c1, c2] = theme.diskColors[idx];
    const width = 36 + (disk / diskCount) * 60;
    return (
      <MotionBox borderRadius="full" py={3} px={4} bgGradient={`linear(to-r, ${c1}, ${c2})`} color={theme.text} fontWeight="semibold" shadow="2xl" width={`${width}%`} textAlign="center">
        <Text fontSize="sm">{disk}</Text>
      </MotionBox>
    );
  }

  function diskGradient(d) {
    const idx = Math.min(d - 1, theme.diskColors.length - 1);
    const [c1, c2] = theme.diskColors[idx];
    return `linear-gradient(90deg, ${c1}, ${c2})`;
  }

  // Render
  return (
    <Box pt="100px" px={{ base: 4, md: 8 }} style={{ background: theme.bg, minHeight: "calc(100vh - 100px)" }}>
      <Center>
        <VStack spacing={6} align="stretch" maxW="1100px" w="100%">

          {/* HEADER */}
          <HStack justify="space-between" align="center" flexWrap="wrap">
            <HStack spacing={4}>
              <IconButton aria-label="back" icon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
              <Heading size="md" color={theme.text}>Tower of Hanoi</Heading>
              <Badge colorScheme="purple">BrainBox</Badge>
              <Text color={theme.text} fontSize="sm">{diskCount} disks</Text>
              <Divider orientation="vertical" height="26px" />
              <Text color={theme.text} fontSize="sm">Moves: {moves}</Text>
              <Text color={theme.text} fontSize="sm">Time: {formatTime(seconds)}</Text>
            </HStack>

            <HStack spacing={3}>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>Theme: {themeName}</MenuButton>
                <MenuList>
                  {Object.keys(THEMES).map((t) => (<MenuItem key={t} onClick={() => setThemeName(t)}>{t}</MenuItem>))}
                </MenuList>
              </Menu>

              <Button onClick={() => toggleColorMode()}>{colorMode === "light" ? <MoonIcon /> : <SunIcon />}</Button>

              <Select value={level} onChange={(e) => setLevel(e.target.value)} maxW="140px">
                {Object.keys(LEVELS).map((l) => (<option key={l} value={l}>{l}</option>))}
              </Select>

              <Button leftIcon={<RepeatIcon />} onClick={handleRestart}>Restart</Button>

              <IconButton aria-label="rules" icon={<InfoOutlineIcon />} onClick={() => setShowRules((s) => !s)} />
            </HStack>
          </HStack>

          {/* RULES */}
          <Collapse in={showRules} animateOpacity>
            <Box p={4} bg={theme.glass} rounded="md" border="1px solid rgba(255,255,255,0.06)">
              <Text fontWeight="semibold">How to play</Text>
              <Text mt={2} fontSize="sm">
                Objective: Move all disks from Rod 1 to Rod 3.
                Rules:
                1) Move only one disk at a time.
                2) Only the top disk of a rod can be moved.
                3) You may never place a larger disk on top of a smaller one.
                Interaction: Click a rod (or its top disk) to pick the top disk, then click another rod to place it.
                You may also drag the top disk and drop it on another rod.
              </Text>
            </Box>
          </Collapse>

          {/* MIDDLE: Stats (left) + Board (center) */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="start">
            {/* STATS (left) */}
            <Box p={4} bg={theme.glass} rounded="lg" border="1px solid rgba(255,255,255,0.06)" boxShadow="md">
              <VStack align="stretch" spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color={theme.text}>Stats</Text>
                <HStack justify="space-between"><Text color={theme.text}>Disks</Text><Text color={theme.text}>{diskCount}</Text></HStack>
                <HStack justify="space-between"><Text color={theme.text}>Moves</Text><Text color={theme.text}>{moves}</Text></HStack>
                <HStack justify="space-between"><Text color={theme.text}>Time</Text><Text color={theme.text}>{formatTime(seconds)}</Text></HStack>
                <HStack justify="space-between"><Text color={theme.text}>Min Moves</Text><Text color={theme.text}>{minMovesFor(diskCount)}</Text></HStack>

                <HStack pt={2}>
                  <Button onClick={() => { setRunning((r) => !r); if (!running) setRunning(true); }}>{running ? "Pause" : "Start"}</Button>
                  <Button onClick={handleRestart}>Restart</Button>
                </HStack>

                <Text fontSize="sm" color={theme.text} mt={2}>Interaction tip: Click-to-move is primary (click a rod to pick, click target to place). Drag supported too.</Text>
                {selectedRod !== null && (
                  <MotionBox mt={2} p={2} bg="rgba(0,0,0,0.04)" rounded="md">
                    <Text fontSize="sm">Picked disk from Rod {selectedRod + 1}</Text>
                    <Button size="sm" mt={2} onClick={() => setSelectedRod(null)}>Cancel pick</Button>
                  </MotionBox>
                )}
              </VStack>
            </Box>

            {/* BOARD (center) */}
            <Box p={6} bg={theme.glass} rounded="2xl" border="1px solid rgba(255,255,255,0.06)" boxShadow="lg" minH="320px" display="flex" alignItems="center" justifyContent="center">
              <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <HStack spacing={{ base: 6, md: 12 }} align="end" width="100%">
                  {rods.map((rod, idx) => (
                    <Box key={idx} flex="1" textAlign="center">
                      <RodZone idx={idx}>
                        <VStack spacing={2} position="relative" left="50%" transform="translateX(-50%)" align="center" minH="200px">
                          <AnimatePresence initial={false}>
                            {[...rod].slice().reverse().map((disk, i) => {
                              const topDisk = rod[rod.length - 1];
                              return (
                                <Box key={`rod-${idx}-disk-${disk}-${i}`} width="100%" display="flex" justifyContent="center">
                                  {topDisk === disk ? <Disk disk={disk} from={idx} /> : (
                                    <MotionBox
                                      layout
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      borderRadius="full"
                                      py={{ base: 1.5, md: 2.5 }}
                                      bg={diskGradient(disk)}
                                      color={theme.text}
                                      fontWeight="semibold"
                                      shadow="md"
                                      width={`${36 + (disk / diskCount) * 60}%`}
                                      textAlign="center"
                                      cursor="not-allowed"
                                    >
                                      <Text fontSize={{ base: "xs", md: "sm" }}>{disk}</Text>
                                    </MotionBox>
                                  )}
                                </Box>
                              );
                            })}
                          </AnimatePresence>
                        </VStack>
                      </RodZone>

                      <Text mt={3} fontSize="sm" fontWeight="medium" color={theme.text}>Rod {idx + 1}</Text>
                    </Box>
                  ))}
                </HStack>

                <DragOverlay>{draggingDisk ? <DragPreview disk={draggingDisk} /> : null}</DragOverlay>
              </DndContext>
            </Box>

            {/* placeholder to keep grid 3 columns on desktop (empty) */}
            <Box />
          </SimpleGrid>

          {/* MOVE HISTORY (placed AFTER middle section, centered under board) */}
          <Center>
            <Box w={{ base: "95%", md: "70%" }} p={4} bg={theme.glass} rounded="lg" border="1px solid rgba(255,255,255,0.06)" boxShadow="md">
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold" color={theme.text}>Move History</Text>
                  <Button size="sm" onClick={() => setMoveHistory([])}>Clear</Button>
                </HStack>

                <Box maxH="200px" overflowY="auto" pr={2}>
                  <VStack align="stretch" spacing={2}>
                    <AnimatePresence initial={false}>
                      {moveHistory.length === 0 ? (
                        <MotionBox key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Text fontSize="sm" color={theme.text}>No moves yet — make your first move.</Text>
                        </MotionBox>
                      ) : (
                        moveHistory.map((m, i) => (
                          <MotionBox key={`${m.t}-${i}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} p={2} bg="rgba(0,0,0,0.03)" rounded="md">
                            <HStack justify="space-between">
                              <HStack spacing={3}>
                                <Box w="8px" h="28px" borderRadius="4px" bg={diskGradient(m.disk)} />
                                <Text fontSize="sm">Disk <strong>{m.disk}</strong> → Rod {m.to}</Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.400">{new Date(m.t).toLocaleTimeString()}</Text>
                            </HStack>
                          </MotionBox>
                        ))
                      )}
                    </AnimatePresence>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Center>
        </VStack>
      </Center>
    </Box>
  );

  // nested helpers
  function DragPreview({ disk }) {
    if (!disk) return null;
    const idx = Math.min(disk - 1, theme.diskColors.length - 1);
    const [c1, c2] = theme.diskColors[idx];
    const width = 36 + (disk / diskCount) * 60;
    return (
      <MotionBox borderRadius="full" py={3} px={4} bgGradient={`linear(to-r, ${c1}, ${c2})`} color={theme.text} fontWeight="semibold" shadow="2xl" width={`${width}%`} textAlign="center">
        <Text fontSize="sm">{disk}</Text>
      </MotionBox>
    );
  }

  function diskGradient(d) {
    const idx = Math.min(d - 1, theme.diskColors.length - 1);
    const [c1, c2] = theme.diskColors[idx];
    return `linear-gradient(90deg, ${c1}, ${c2})`;
  }
}
