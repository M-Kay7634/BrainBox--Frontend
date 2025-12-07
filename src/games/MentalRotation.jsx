import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { submitScore } from "../services/api";

const levelConfig = {
  basic: { label: "Basic", maxRounds: 6 },
  intermediate: { label: "Intermediate", maxRounds: 8 },
  advanced: { label: "Advanced", maxRounds: 10 },
};

// 3x3 block shapes (1 = filled, 0 = empty)
const SHAPES = [
  // L shape
  [1, 1, 0,
   0, 1, 0,
   0, 1, 0],

  // T shape
  [1, 1, 1,
   0, 1, 0,
   0, 1, 0],

  // zig-zag
  [0, 1, 1,
   1, 1, 0,
   1, 0, 0],

  // F-like
  [1, 1, 1,
   1, 1, 0,
   1, 0, 0],

  // skewed S
  [0, 1, 1,
   1, 1, 0,
   1, 0, 0],

  // corner
  [1, 1, 0,
   1, 0, 0,
   1, 0, 0],

  // plus
  [0, 1, 0,
   1, 1, 1,
   0, 1, 0],
];

// rotate 3x3 pattern 90 deg clockwise
function rotate90(pattern) {
  const res = Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const from = r * 3 + c;
      const to = c * 3 + (2 - r);
      res[to] = pattern[from];
    }
  }
  return res;
}

function rotate(pattern, times) {
  let p = [...pattern];
  for (let i = 0; i < times; i++) p = rotate90(p);
  return p;
}

// mirror horizontally
function mirror(pattern) {
  const res = Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const from = r * 3 + c;
      const to = r * 3 + (2 - c);
      res[to] = pattern[from];
    }
  }
  return res;
}

function equalPattern(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function ShapeGrid({ pattern }) {
  const cellColor = useColorModeValue("purple.500", "purple.300");
  const emptyColor = useColorModeValue("gray.200", "gray.700");
  return (
    <SimpleGrid columns={3} spacing={1}>
      {pattern.map((v, i) => (
        <Box
          key={i}
          w="24px"
          h="24px"
          bg={v ? cellColor : emptyColor}
          rounded="sm"
        />
      ))}
    </SimpleGrid>
  );
}

export default function MentalRotation() {
  const [level, setLevel] = useState("basic");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const [baseShape, setBaseShape] = useState(SHAPES[0]);
  const [rotationText, setRotationText] = useState("90°");
  const [options, setOptions] = useState([]); // [pattern, pattern]
  const [correctIndex, setCorrectIndex] = useState(0);
  const [message, setMessage] = useState("Press Start to begin.");
  const [locked, setLocked] = useState(false);

  const startedAtRef = useRef(null);
  const navigate = useNavigate();

  const panelBg = useColorModeValue("white", "gray.800");
  const gameBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    // when level changes, reset
    resetGame();
  }, [level]);

  const resetGame = () => {
    setRound(0);
    setScore(0);
    setMoves(0);
    setMessage("Press Start to begin.");
    setLocked(false);
  };

  const startGame = () => {
    resetGame();
    startedAtRef.current = Date.now();
    nextRound();
  };

  const nextRound = () => {
    const cfg = levelConfig[level];
    if (round >= cfg.maxRounds) {
      finishGame(true);
      return;
    }

    // pick base shape
    const base = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setBaseShape(base);

    // pick target rotation: 90, 180, or 270
    const rotations = [1, 2, 3];
    const times = rotations[Math.floor(Math.random() * rotations.length)];
    const rotationLabel = times === 1 ? "90°" : times === 2 ? "180°" : "270°";
    setRotationText(rotationLabel);

    const correctPattern = rotate(base, times);

    // wrong option: either mirror or different rotation
    let wrongPattern = mirror(correctPattern);
    if (equalPattern(wrongPattern, correctPattern)) {
      // fallback: rotate differently
      const otherTimes = rotations.filter((t) => t !== times)[
        Math.floor(Math.random() * 2)
      ];
      wrongPattern = rotate(base, otherTimes);
    }

    const idx = Math.random() < 0.5 ? 0 : 1;
    const opts = [];
    opts[idx] = correctPattern;
    opts[1 - idx] = wrongPattern;

    setOptions(opts);
    setCorrectIndex(idx);
    setRound((r) => r + 1);
    setMessage(`Round ${round + 1}: Choose the ${rotationLabel} rotated shape.`);
    setLocked(false);
  };

  const handleChoice = (index) => {
    if (locked || options.length === 0) return;
    setLocked(true);
    setMoves((m) => m + 1);

    if (index === correctIndex) {
      setScore((s) => s + 10);
      setMessage("Correct! Next round...");
      setTimeout(() => {
        nextRound();
      }, 600);
    } else {
      setMessage("Wrong choice! Game over.");
      setTimeout(() => {
        finishGame(false);
      }, 600);
    }
  };

  const finishGame = (completedAll) => {
    const timeTaken = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : 0;

    const bonus = completedAll ? 20 : 0;
    const timePenalty = Math.floor(timeTaken / 5);
    const finalScore = Math.max(0, score + bonus - timePenalty);

    submitScore({
      game: "Mental Rotation",
      score: finalScore,
      timeTaken,
      moves,
      level,
      category: "spatial",
    }).catch((err) => console.log("score save failed", err));

    navigate("/result", {
      state: {
        game: "Mental Rotation",
        score: finalScore,
        timeTaken,
        moves,
        level,
        category: "spatial",
        rounds: round,
      },
    });
  };

  return (
    <Box minH="100vh" bg="gray.100" pt="100px" pb={10}>
      <Box maxW="1100px" mx="auto" px={4}>
        {/* HEADER */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          mb={6}
          gap={3}
        >
          <Box>
            <Text fontSize="3xl" fontWeight="bold">
              Mental Rotation
            </Text>
            <Text color="gray.600" fontSize="sm">
              Look at the base shape and choose which option shows it rotated by the specified angle.
            </Text>
          </Box>

          <HStack spacing={2}>
            <Text fontWeight="600">Level:</Text>
            {Object.entries(levelConfig).map(([key, cfg]) => (
              <Button
                key={key}
                size="sm"
                variant={level === key ? "solid" : "outline"}
                colorScheme="purple"
                onClick={() => setLevel(key)}
              >
                {cfg.label}
              </Button>
            ))}
          </HStack>
        </Flex>

        <Flex gap={6} direction={{ base: "column", md: "row" }}>
          {/* LEFT: Stats Panel */}
          <Box
            bg={panelBg}
            p={5}
            rounded="lg"
            shadow="md"
            minW={{ base: "full", md: "260px" }}
          >
            <VStack align="start" spacing={3}>
              <Text fontSize="lg" fontWeight="bold">
                Game Stats
              </Text>
              <Text fontSize="sm">Round: {round}</Text>
              <Text fontSize="sm">Score: {score}</Text>
              <Text fontSize="sm">Moves: {moves}</Text>
              <Text fontSize="sm">
                Mode: {levelConfig[level].label} (max {levelConfig[level].maxRounds} rounds)
              </Text>

              <Button
                size="sm"
                colorScheme="purple"
                mt={2}
                onClick={startGame}
              >
                {round === 0 ? "Start Game" : "Restart Game"}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate("/")}
              >
                Back to Dashboard
              </Button>

              <Box mt={3}>
                <Text fontSize="sm" color="gray.500">
                  Tip: Imagine rotating the shape in your mind. Focus on corners and unique blocks.
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* RIGHT: Game Area */}
          <Box
            bg={gameBg}
            p={6}
            rounded="xl"
            shadow="lg"
            flex="1"
            textAlign="center"
          >
            <Text mb={3} fontWeight="600">
              {message}
            </Text>

            {/* BASE SHAPE */}
            <Box mb={4}>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Base Shape
              </Text>
              <Box
                display="inline-flex"
                p={3}
                bg={panelBg}
                rounded="md"
                shadow="sm"
              >
                <ShapeGrid pattern={baseShape} />
              </Box>
            </Box>

            {/* ROTATION LABEL */}
            <Text fontSize="sm" color="gray.500" mb={4}>
              Target rotation: <b>{rotationText}</b>
            </Text>

            {/* OPTIONS */}
            <Flex justify="center" gap={8} mt={4} flexWrap="wrap">
              {options.map((opt, idx) => (
                <Box
                  key={idx}
                  as="button"
                  onClick={() => handleChoice(idx)}
                  p={3}
                  bg={useColorModeValue("white", "gray.800")}
                  rounded="lg"
                  shadow="md"
                  _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                  transition="0.15s"
                  disabled={options.length === 0}
                >
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Option {idx + 1}
                  </Text>
                  <ShapeGrid pattern={opt} />
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
