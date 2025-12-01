import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Collapse,
  Divider,
  Stack,
  ButtonGroup,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { submitScore } from "../services/api";
import { memoryCategories } from "./memoryCategories";
import PageWrapper from "../components/PageWrapper";

function shuffleArray(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.v);
}

export default function MemoryGame() {
  // GAME STATES
  const [cards, setCards] = useState([]);
  const [opened, setOpened] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const lockRef = useRef(false);

  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("basic"); // "basic" | "intermediate" | "advanced"
  const [rulesOpen, setRulesOpen] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  // Animation mode: flip | fade | glow
  const [animationMode, setAnimationMode] = useState("flip");

  const navigate = useNavigate();

  const levelSize = {
    basic: 3,
    intermediate: 4,
    advanced: 5,
  };

  const totalSlots = levelSize[level] * levelSize[level];

  // Generate cards based on level + category
  const generateCards = () => {
    const keys = Object.keys(memoryCategories);
    const randomCat = keys[Math.floor(Math.random() * keys.length)];
    setCategory(randomCat);

    const base = memoryCategories[randomCat];

    // We only use FULL pairs. No extra single card.
    const pairsCount = Math.floor(totalSlots / 2); // e.g. 9 -> 4 pairs, 5 slots unused
    const selected = base.slice(0, pairsCount);
    const doubled = shuffleArray([...selected, ...selected]); // full pairs only

    setCards(doubled); // LENGTH = pairsCount * 2, so 8 for 3x3, 24 for 5x5
    setOpened([]);
    setMatched([]);
    setMoves(0);
    setTimer(0);
    setGameRunning(false);

    clearInterval(timerRef.current);
  };

  // Initial + when level changes
  useEffect(() => {
    generateCards();
  }, [level]);

  // Start / pause
  const startGame = () => {
    if (gameRunning) return;
    setGameRunning(true);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const pauseGame = () => {
    setGameRunning(false);
    clearInterval(timerRef.current);
  };

  const restartGame = () => {
    generateCards();
  };

  // Matching logic
  useEffect(() => {
    if (opened.length === 2) {
      const [i, j] = opened;

      if (cards[i] === cards[j]) {
        setMatched((prev) => [...prev, i, j]);
      }

      lockRef.current = true;
      setTimeout(() => {
        setOpened([]);
        lockRef.current = false;
      }, 600);

      setMoves((m) => m + 1);
    }
  }, [opened, cards]);

  // Finish condition
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      clearInterval(timerRef.current);
      const score = Math.max(0, 200 - moves * 2 - timer);

      submitScore({
        game: "Memory Flip",
        score,
        timeTaken: timer,
      }).catch(() => {});

      navigate("/result", {
        state: { score, moves, timeTaken: timer, level, category },
      });
    }
  }, [matched, cards.length, moves, timer, level, category, navigate]);

  const handleClick = (i) => {
    if (!gameRunning) return;
    if (lockRef.current) return;
    if (opened.includes(i) || matched.includes(i)) return;

    setOpened((prev) => [...prev, i]);
  };

  // Card visual style based on animationMode
  const getCardStyles = (i) => {
    const isOpen = opened.includes(i);
    const isMatch = matched.includes(i);

    if (animationMode === "flip") {
      const rotated = isOpen || isMatch ? "rotateY(0deg)" : "rotateY(180deg)";
      return {
        transform: rotated,
        transformStyle: "preserve-3d",
        transition: "transform 0.4s ease",
      };
    }

    if (animationMode === "fade") {
      return {
        transform: isOpen || isMatch ? "scale(1.05)" : "scale(1.0)",
        opacity: isOpen || isMatch ? 1 : 0.8,
        transition: "all 0.3s ease",
      };
    }

    if (animationMode === "glow") {
      return {
        boxShadow: isMatch ? "0 0 18px rgba(124,58,237,0.7)" : "none",
        transform: isOpen || isMatch ? "scale(1.05)" : "scale(1.0)",
        transition: "all 0.25s ease",
      };
    }

    return {};
  };

  return (<PageWrapper>
    <Box minH="100vh" bg="gray.100">
      {/* TOP BAR: Level selection */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        shadow="md"
        zIndex={10}
      >
        <Box maxW="1200px" mx="auto" py={3} px={4}>
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            spacing={3}
          >
            <HStack spacing={3}>
              <Text fontWeight="bold" fontSize="lg">
                Memory Flip — Level:
              </Text>
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  colorScheme={level === "basic" ? "purple" : "gray"}
                  onClick={() => setLevel("basic")}
                >
                  Basic 3×3
                </Button>
                <Button
                  colorScheme={level === "intermediate" ? "purple" : "gray"}
                  onClick={() => setLevel("intermediate")}
                >
                  Inter 4×4
                </Button>
                <Button
                  colorScheme={level === "advanced" ? "purple" : "gray"}
                  onClick={() => setLevel("advanced")}
                >
                  Adv 5×5
                </Button>
              </ButtonGroup>
            </HStack>

            <HStack spacing={3}>
              <Text fontSize="sm">Animation:</Text>
              <ButtonGroup size="sm" isAttached>
                <Button
                  variant={animationMode === "flip" ? "solid" : "outline"}
                  colorScheme="purple"
                  onClick={() => setAnimationMode("flip")}
                >
                  Flip
                </Button>
                <Button
                  variant={animationMode === "fade" ? "solid" : "outline"}
                  colorScheme="purple"
                  onClick={() => setAnimationMode("fade")}
                >
                  Fade
                </Button>
                <Button
                  variant={animationMode === "glow" ? "solid" : "outline"}
                  colorScheme="purple"
                  onClick={() => setAnimationMode("glow")}
                >
                  Glow
                </Button>
              </ButtonGroup>

              <Button size="sm" variant="outline" onClick={generateCards}>
                Change Category
              </Button>
            </HStack>
          </Stack>

          {/* Under top bar: Dashboard + Rules button */}
          <HStack justify="flex-end" mt={3} spacing={3}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/")}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={() => setRulesOpen((v) => !v)}
            >
              {rulesOpen ? "Hide Rules" : "Show Rules"}
            </Button>
          </HStack>
        </Box>
      </Box>

      {/* MAIN CONTENT (below navbar) */}
      <Box maxW="1200px" mx="auto" pt="110px" pb={6} px={4}>
        <HStack align="start" spacing={6}>
          {/* LEFT PANEL */}
          <Box
            bg="white"
            shadow="lg"
            p={5}
            rounded="lg"
            w={{ base: "100%", md: "260px" }}
          >
            <VStack align="start" spacing={4}>
              <Text fontSize="2xl" fontWeight="bold">
                Score Panel
              </Text>

              <Text>Category: {category || "-"}</Text>
              <Text>Level: {level}</Text>
              <Text>Moves: {moves}</Text>
              <Text>Time: {timer}s</Text>

              <Divider />

              <Button colorScheme="purple" w="100%" onClick={startGame}>
                Start
              </Button>
              <Button colorScheme="orange" w="100%" onClick={pauseGame}>
                Pause
              </Button>
              <Button colorScheme="red" w="100%" onClick={restartGame}>
                Restart
              </Button>
            </VStack>

            {/* RULES COLLAPSE (under panel, but controlled by top button) */}
            <Collapse in={rulesOpen} animateOpacity>
              <Box
                mt={4}
                bg="purple.50"
                p={4}
                rounded="md"
                fontSize="sm"
                shadow="inner"
              >
                <Text fontWeight="bold" mb={2}>
                  Game Rules:
                </Text>
                <Text>
                  • Click "Start" to begin the game.<br />
                  • Flip two cards at a time.<br />
                  • Match identical icons to clear them.<br />
                  • Wrong guesses increase the move count.<br />
                  • Complete all pairs with fewer moves & in less time for a better score.<br />
                  • Change level for more challenge, or change category for fresh icons.
                </Text>
              </Box>
            </Collapse>
          </Box>

          {/* RIGHT PANEL – GAME AREA */}
          <Box flex="1" display="flex" justifyContent="center">
            <SimpleGrid
              columns={levelSize[level]}
              spacing={4}
              justifyContent="center"
            >
              {cards.map((c, i) => (
                <Button
                  key={i}
                  onClick={() => handleClick(i)}
                  h="90px"
                  w="90px"
                  fontSize="40px"
                  bg={
                    opened.includes(i) || matched.includes(i)
                      ? "purple.200"
                      : "gray.300"
                  }
                  rounded="lg"
                  sx={getCardStyles(i)}
                >
                  {opened.includes(i) || matched.includes(i) ? c : "❓"}
                </Button>
              ))}
            </SimpleGrid>
          </Box>
        </HStack>
      </Box>
    </Box>
  </PageWrapper>);
}
