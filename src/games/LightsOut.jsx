// src/games/LightsOut.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Select,
  SimpleGrid,
  Divider,
  useToast,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  generateSolvableBoard,
  toggleAt,
  isSolved,
  rc,
  countLights,
  bestHintIndex,
} from "./utils/lightOutUtils";
import { submitScore } from "../services/api";

const MotionBox = motion(Box);

const LEVELS = {
  Easy: 3,
  Medium: 4,
  Hard: 5,
  Expert: 6,
};

export default function LightsOut() {
  const navigate = useNavigate();
  const toast = useToast();

  const [level, setLevel] = useState("Easy");
  const [size, setSize] = useState(3);

  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const grid = LEVELS[level];
    setSize(grid);
    const { board: newBoard } = generateSolvableBoard(grid);

    setBoard(newBoard);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  }, [level]);

  // Timer logic
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const startIfNotRunning = () => {
    if (!running) setRunning(true);
  };

  const handleClick = (i) => {
    startIfNotRunning();
    const newBoard = toggleAt(board, i, size);
    setBoard(newBoard);
    setMoves((m) => m + 1);
  };

  const computeScore = (moves, time, size) => {
    const maxMoves = size * size;
    const base = Math.max(0, ((maxMoves - moves) / maxMoves) * 100);
    return Math.max(0, Math.round(base - time / 2));
  };

  useEffect(() => {
    if (board.length > 0 && isSolved(board)) {
      setRunning(false);
      clearInterval(timerRef.current);

      const game = "Lights Out Puzzle";
      const category = "logic";
      const score = computeScore(moves, seconds, size);

      submitScore({ game, score, timeTaken: seconds, moves, level, category })
        .then(() => {
          navigate("/result", {
            state: { game, score, timeTaken: seconds, moves, level, category },
          });
        })
        .catch(() => {
          navigate("/result", {
            state: { game, score, timeTaken: seconds, moves, level, category },
          });
        });
    }
  }, [board]);

  const handleRestart = () => {
    const { board: b } = generateSolvableBoard(size);
    setBoard(b);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  };

  const hintCell = () => {
    const best = bestHintIndex(board, size);
    const pos = rc(best.index, size);

    toast({
      title: "Hint",
      description: `Try toggling Row ${pos.row + 1}, Column ${pos.col + 1}`,
      status: "info",
      duration: 2000,
    });
  };

  return (
    <Box pt="100px" px={10} pb={12}>
      <Heading mb={6}>Lights Out Puzzle</Heading>

      <HStack align="flex-start" spacing={10}>
        {/* LEFT SIDEBAR */}
        <Card w="280px" boxShadow="lg">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Game Controls</Heading>

              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {Object.keys(LEVELS).map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>

              <Button colorScheme="blue" onClick={handleRestart}>
                Restart Game
              </Button>

              <Button variant="outline" onClick={hintCell}>
                Hint
              </Button>

              <Divider />

              <Text><b>Time:</b> {seconds}s</Text>
              <Text><b>Moves:</b> {moves}</Text>
              <Text><b>Lights ON:</b> {countLights(board)}</Text>

              <Divider />

              <Button onClick={() => navigate("/dashboard")} variant="ghost">
                ← Back to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* CENTER BOARD */}
        <VStack flex="1">
          <Card p={6} boxShadow="xl" borderRadius="16px">
            <SimpleGrid columns={size} spacing={4}>
              {board.map((cell, i) => (
                <MotionBox
                  key={i}
                  onClick={() => handleClick(i)}
                  cursor="pointer"
                  w="70px"
                  h="70px"
                  borderRadius="12px"
                  bg={cell ? "yellow.300" : "gray.200"}
                  whileHover={{ scale: 1.05 }}
                  transition="0.2s"
                  boxShadow={cell ? "0 0 12px rgba(255, 214, 0, 0.7)" : "sm"}
                />
              ))}
            </SimpleGrid>
          </Card>
        </VStack>

        {/* RIGHT SIDEBAR: HOW TO PLAY */}
        <Card w="300px" p={4} boxShadow="lg">
          <Heading size="md" mb={2}>
            How to Play
          </Heading>

          <Text fontSize="sm" color="gray.600">
            Lights Out is a logic puzzle game.
            Your goal is simple:
          </Text>

          <Box mt={3}>
            <Text><b>1.</b> Clicking a tile toggles it ON/OFF.</Text>
            <Text><b>2.</b> It also toggles the tiles UP, DOWN, LEFT, RIGHT.</Text>
            <Text><b>3.</b> Your objective: <b>Turn ALL lights OFF.</b></Text>
            <Text><b>4.</b> Solve it in the fewest moves to maximize score.</Text>
          </Box>

          <Divider my={4} />

          <Text fontSize="sm" color="gray.600">
            Tips:
          </Text>
          <Box mt={2}>
            <Text>• Start from corners and edges.</Text>
            <Text>• Use the board pattern to predict toggles.</Text>
            <Text>• Use the <b>Hint</b> button if stuck.</Text>
          </Box>
        </Card>
      </HStack>
    </Box>
  );
}
