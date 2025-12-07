import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  SimpleGrid,
  HStack,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { submitScore } from "../services/api";

const levelConfig = {
  basic: { label: "Basic", speed: 700, maxRounds: 5 },
  intermediate: { label: "Intermediate", speed: 500, maxRounds: 7 },
  advanced: { label: "Advanced", speed: 350, maxRounds: 9 },
};

const PAD_COLORS = ["teal.400", "pink.400", "orange.400", "blue.400"];

export default function PatternSequence() {
  const [level, setLevel] = useState("basic");
  const [sequence, setSequence] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [allowInput, setAllowInput] = useState(false);
  const [message, setMessage] = useState("Press Start to begin.");
  const [moves, setMoves] = useState(0);

  const startedAtRef = useRef(null);
  const timeoutsRef = useRef([]);
  const navigate = useNavigate();

  const panelBg = useColorModeValue("white", "gray.800");
  const gameBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    return () => {
      // cleanup timeouts
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const addTimeout = (cb, delay) => {
    const id = setTimeout(cb, delay);
    timeoutsRef.current.push(id);
  };

  const startGame = () => {
    clearAllTimeouts();
    setSequence([]);
    setUserIndex(0);
    setRound(0);
    setMoves(0);
    setMessage("Watch the pattern...");
    startedAtRef.current = Date.now();
    nextRound(true);
  };

  const nextRound = (first = false) => {
    setIsPlayingBack(true);
    setAllowInput(false);

    setRound((prevRound) => {
      const newRound = first ? 1 : prevRound + 1;

      setSequence((prevSeq) => {
        const nextPad = Math.floor(Math.random() * PAD_COLORS.length);
        const newSeq = first ? [nextPad] : [...prevSeq, nextPad];
        playSequence(newSeq, newRound);
        return newSeq;
      });

      return newRound;
    });
  };

  const playSequence = (seq, currentRound) => {
    const speed = levelConfig[level].speed;
    setMessage(`Round ${currentRound}: Watch the pattern`);

    let i = 0;
    const flash = () => {
      if (i >= seq.length) {
        setIsPlayingBack(false);
        setAllowInput(true);
        setUserIndex(0);
        setActivePad(null);
        setMessage("Now repeat the pattern.");
        return;
      }

      const idx = seq[i];
      setActivePad(idx);
      addTimeout(() => {
        setActivePad(null);
        addTimeout(() => {
          i++;
          flash();
        }, speed / 2);
      }, speed);
    };

    flash();
  };

  const handlePadClick = (index) => {
    if (!allowInput || isPlayingBack || sequence.length === 0) return;

    setMoves((m) => m + 1);

    if (index === sequence[userIndex]) {
      const nextUserIndex = userIndex + 1;
      setUserIndex(nextUserIndex);

      // Completed this round
      if (nextUserIndex === sequence.length) {
        const { maxRounds } = levelConfig[level];
        if (round >= maxRounds) {
          finishGame(true);
        } else {
          setMessage("Great! Get ready for the next round...");
          setAllowInput(false);
          addTimeout(() => nextRound(false), 800);
        }
      }
    } else {
      finishGame(false);
    }
  };

  const finishGame = (completedAll) => {
    clearAllTimeouts();
    setAllowInput(false);
    setIsPlayingBack(false);

    const timeTaken = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : 0;

    // scoring: based on round + speed
    const roundScore = round * 20;
    const timePenalty = Math.floor(timeTaken / 5);
    const score = Math.max(0, roundScore - timePenalty + (completedAll ? 30 : 0));

    setMessage(
      completedAll
        ? `Awesome! You completed all ${round} rounds.`
        : `Game Over! You reached round ${round}.`
    );

    submitScore({
      game: "Pattern Sequence",
      score,
      timeTaken,
      moves,
      level,
      category: "sequence",
    }).catch((err) => console.log("score save failed", err));

    addTimeout(() => {
      navigate("/result", {
        state: {
          game: "Pattern Sequence",
          score,
          timeTaken,
          moves,
          level,
          category: "sequence",
          rounds: round,
        },
      });
    }, 1200);
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
              Pattern Sequence
            </Text>
            <Text color="gray.600" fontSize="sm">
              Watch the pattern, then repeat it. Each round gets harder.
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
                onClick={() => {
                  setLevel(key);
                  startGame();
                }}
              >
                {cfg.label}
              </Button>
            ))}
          </HStack>
        </Flex>

        <Flex gap={6} direction={{ base: "column", md: "row" }}>
          {/* LEFT PANEL: Stats */}
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
                  Tip: Focus on rhythm and group the pattern into small chunks.
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* RIGHT: Game Grid */}
          <Box
            bg={gameBg}
            p={6}
            rounded="xl"
            shadow="lg"
            flex="1"
            textAlign="center"
          >
            <Text mb={4} fontWeight="600">
              {message}
            </Text>

            <SimpleGrid columns={2} spacing={4} maxW="360px" mx="auto" mt={4}>
              {PAD_COLORS.map((color, idx) => (
                <Box
                  key={idx}
                  h="130px"
                  rounded="xl"
                  bg={color}
                  opacity={activePad === idx ? 1 : 0.7}
                  transform={activePad === idx ? "scale(1.05)" : "scale(1.0)"}
                  boxShadow={
                    activePad === idx
                      ? "0 0 25px rgba(128,0,128,0.8)"
                      : "md"
                  }
                  transition="all 0.15s"
                  onClick={() => handlePadClick(idx)}
                  cursor={allowInput ? "pointer" : "not-allowed"}
                />
              ))}
            </SimpleGrid>

            <Box mt={6}>
              <Text fontSize="sm" color="gray.500">
                Watch the pads light up, then repeat by clicking them in the same order.
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
