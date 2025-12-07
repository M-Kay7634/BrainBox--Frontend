import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { submitScore } from "../services/api";
import { useNavigate } from "react-router-dom";

// -------------------------------------------
// WORD BANK (you can add unlimited words)
// -------------------------------------------
const WORDS = [
  "planet", "silver", "forest", "mirror", "rocket", "canvas", "signal",
  "orange", "shadow", "temple", "circle", "random", "legend", "fabric",
  "pillow", "window", "letter", "market", "bridge", "castle", "coffee",
  "memory", "future", "bubble", "cactus", "galaxy", "energy", "drama",
  "spirit", "pixel", "feather", "hunter", "dream", "secret", "motion",
  "rhythm", "coin", "music", "logic", "apple", "ocean", "river", "happy",
  "storm", "mountain", "focus", "candle", "tiger", "cloud", "frozen",
  "design", "vector", "signal", "mouse", "train", "paper", "stone"
];

const MotionBox = motion(Box);

export default function VerbalMemory() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [seenWords, setSeenWords] = useState(new Set());
  const [currentWord, setCurrentWord] = useState("");

  const startedAt = useRef(Date.now());

  // Next random word always
  const generateWord = () => {
    const random = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(random);
  };

  useEffect(() => {
    generateWord();
  }, []);

  // Handle Seen/New selection
  const handleChoice = (type) => {
    const hasSeen = seenWords.has(currentWord);

    if (type === "seen") {
      if (hasSeen) {
        setScore((s) => s + 1);
      } else {
        setLives((l) => l - 1);
      }
    } else {
      // NEW clicked
      if (!hasSeen) {
        setScore((s) => s + 1);
        setSeenWords((prev) => new Set([...prev, currentWord]));
      } else {
        setLives((l) => l - 1);
      }
    }

    // End game
    if (lives - 1 < 0) {
      return finishGame();
    } else {
      generateWord();
    }
  };

  const finishGame = () => {
    const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);

    submitScore({
      game: "Verbal Memory",
      score,
      timeTaken,
      moves: score,
      level: "N/A",
      category: "Words",
    }).catch((err) => console.log("score save failed", err));

    navigate("/result", {
      state: {
        game: "Verbal Memory",
        score,
        moves: score,
        timeTaken,
        level: "N/A",
        category: "Words",
      },
    });
  };

  const restart = () => {
    setScore(0);
    setLives(3);
    setSeenWords(new Set());
    startedAt.current = Date.now();
    generateWord();
  };

  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Box pt="120px" maxW="800px" mx="auto" textAlign="center">
      <Text fontSize="4xl" fontWeight="bold" mb={2}>
        🧠 Verbal Memory
      </Text>

      <Text color="gray.500" mb={5}>
        If you've seen the word before, press <b>Seen</b>.  
        If it's new, press <b>New</b>.
      </Text>

      {/* SCORE + LIVES */}
      <HStack justify="space-between" px={6} mb={6}>
        <Text fontSize="lg">Score: <b>{score}</b></Text>
        <Text fontSize="lg">Lives: <b>{lives}</b> ❤️</Text>
      </HStack>

      {/* WORD CARD */}
      <MotionBox
        p={10}
        bg={cardBg}
        rounded="lg"
        shadow="xl"
        mx="auto"
        width="90%"
        maxW="400px"
        fontSize="3xl"
        fontWeight="bold"
        whileHover={{ scale: 1.03 }}
        transition="0.2s"
        mb={8}
      >
        {currentWord}
      </MotionBox>

      {/* BUTTONS */}
      <Flex gap={6} justify="center">
        <Button
          colorScheme="purple"
          size="lg"
          px={10}
          onClick={() => handleChoice("seen")}
        >
          Seen
        </Button>

        <Button
          variant="outline"
          colorScheme="green"
          size="lg"
          px={10}
          onClick={() => handleChoice("new")}
        >
          New
        </Button>
      </Flex>

      {/* Footer Controls */}
      <VStack mt={10}>
        <Button colorScheme="blue" onClick={restart}>
          Restart
        </Button>

        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={() => navigate("/")}
        >
          Back to Dashboard
        </Button>
      </VStack>
    </Box>
  );
}
