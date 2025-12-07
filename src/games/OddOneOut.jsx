import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { submitScore } from "../services/api";

const levelSettings = {
  basic: { label: "Basic", size: 3 },        // 3x3 grid
  intermediate: { label: "Intermediate", size: 4 }, // 4x4 grid
  advanced: { label: "Advanced", size: 5 },   // 5x5 grid
};

const categories = {
  shapes: ["⬛", "⬜", "🔺", "🔻", "🔵", "🔶", "🟤", "🟢"],
  animals: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐼", "🐻", "🐷"],
  fruits: ["🍎", "🍌", "🍇", "🍊", "🍉", "🍓", "🍍", "🥝"],
  emojis: ["😀", "😎", "😮", "😡", "😍", "😴", "🤢", "🤠"],
};

export default function OddOneOut() {
  const [level, setLevel] = useState("basic");
  const [category, setCategory] = useState("shapes");

  const [grid, setGrid] = useState([]);
  const [oddIndex, setOddIndex] = useState(null);

  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState(0);

  const [startTime, setStartTime] = useState(null);
  const [completed, setCompleted] = useState(false);

  const navigate = useNavigate();

  const areaBg = useColorModeValue("white", "gray.800");
  const panelBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    startNewRound();
  }, [level, category]);

  const startNewRound = () => {
    const size = levelSettings[level].size;
    const totalCells = size * size;

    const icons = categories[category];
    const common = icons[Math.floor(Math.random() * icons.length)];
    let odd = icons[Math.floor(Math.random() * icons.length)];

    while (odd === common) odd = icons[Math.floor(Math.random() * icons.length)];

    const oddPos = Math.floor(Math.random() * totalCells);

    const newGrid = Array(totalCells).fill(common);
    newGrid[oddPos] = odd;

    setOddIndex(oddPos);
    setGrid(newGrid);

    setStartTime(Date.now());
  };

  const handleSelect = (index) => {
    if (completed) return;

    const reaction = Date.now() - startTime;
    setMoves((m) => m + 1);

    if (index === oddIndex) {
      const size = levelSettings[level].size;

      // If last level reached → finish game
      if (round === 5) {
        finishGame();
      } else {
        setRound((r) => r + 1);
        startNewRound();
      }
    }
  };

  const finishGame = () => {
    setCompleted(true);

    const totalTime = Date.now() - startTime;
    const score = Math.max(0, 100 - totalTime / 20 + moves);

    submitScore({
      game: "Odd One Out",
      score,
      timeTaken: totalTime,
      moves,
      level,
      category,
    }).catch((err) => console.log("Score save failed", err));

    navigate("/result", {
      state: {
        game: "Odd One Out",
        score,
        moves,
        timeTaken: totalTime,
        level,
        category,
      },
    });
  };

  return (
    <Box minH="100vh" bg="gray.100" pt="90px" pb={10}>
      <Box maxW="1100px" mx="auto" px={5}>
        <Flex justify="space-between" mb={6} direction={{ base: "column", md: "row" }} gap={3}>
          <Box>
            <Text fontSize="3xl" fontWeight="bold">Odd One Out</Text>
            <Text color="gray.500" fontSize="sm">Find the unique item as fast as possible!</Text>
          </Box>

          <HStack>
            <Text fontWeight={600}>Level:</Text>
            {Object.keys(levelSettings).map((key) => (
              <Button
                key={key}
                size="sm"
                colorScheme={level === key ? "purple" : "gray"}
                variant={level === key ? "solid" : "outline"}
                onClick={() => {
                  setLevel(key);
                  setRound(1);
                  setMoves(0);
                  startNewRound();
                }}
              >
                {levelSettings[key].label}
              </Button>
            ))}
          </HStack>
        </Flex>

        <Flex mb={5} gap={3}>
          <Text fontWeight="600">Category:</Text>

          {Object.keys(categories).map((c) => (
            <Button
              key={c}
              size="sm"
              colorScheme={category === c ? "purple" : "gray"}
              variant={category === c ? "solid" : "outline"}
              onClick={() => {
                setCategory(c);
                setRound(1);
                setMoves(0);
                startNewRound();
              }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </Flex>

        <Box
          bg={panelBg}
          p={4}
          rounded="lg"
          shadow="md"
          mb={6}
        >
          <HStack spacing={8}>
            <Text>Round: {round} / 5</Text>
            <Text>Moves: {moves}</Text>
          </HStack>
        </Box>

        <Box
          bg={areaBg}
          p={5}
          rounded="xl"
          shadow="xl"
          maxW="600px"
          mx="auto"
        >
          <SimpleGrid columns={levelSettings[level].size} spacing={4}>
            {grid.map((item, index) => (
              <Box
                key={index}
                fontSize="40px"
                bg="gray.200"
                _dark={{ bg: "gray.600" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                rounded="lg"
                h="80px"
                cursor="pointer"
                _hover={{ bg: "purple.200", _dark: { bg: "purple.500" } }}
                onClick={() => handleSelect(index)}
              >
                {item}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
}
