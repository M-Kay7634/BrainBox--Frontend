import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Stack,
  Divider,
  Collapse,
  Input,
  FormControl,
  FormLabel,
  ButtonGroup,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { submitScore, setAuthToken } from "../services/api";
import PageWrapper from "../components/PageWrapper";

// ------------------------------
// PROBLEM GENERATOR
// ------------------------------
function genProblem(level = "basic") {
  let range = 20;
  if (level === "intermediate") range = 40;
  if (level === "advanced") range = 80;

  const a = Math.floor(Math.random() * range) + 1;
  const b = Math.floor(Math.random() * range) + 1;

  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let ans;
  if (op === "+") ans = a + b;
  if (op === "-") ans = a - b;
  if (op === "*") ans = a * b;

  return { q: `${a} ${op} ${b}`, ans };
}

// ------------------------------
// MAIN COMPONENT
// ------------------------------
export default function SpeedMath() {
  const navigate = useNavigate();

  // GAME STATE
  const [level, setLevel] = useState("basic"); 
  const [problem, setProblem] = useState(genProblem("basic"));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);

  const [rulesOpen, setRulesOpen] = useState(false);

  // Setup timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle time end
  useEffect(() => {
    if (timer <= 0) {
      clearInterval(timerRef.current);

      // Prepare score payload
      const payload = {
        game: "Speed Math",
        score,
        timeTaken: 30,
        moves,
        level,
        category: "math",
      };

      // Submit score
      submitScore(payload).catch(() => {});

      navigate("/result", {
        state: { score, moves, game: "Speed Math", timeTaken: 30, level },
      });
    }
  }, [timer]);

  // SUBMIT ANSWER
  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(input) === problem.ans) {
      setScore((s) => s + 10);
    } else {
      setScore((s) => Math.max(0, s - 5));
    }

    setMoves((m) => m + 1);
    setInput("");
    setProblem(genProblem(level));
  };

  // RESET GAME
  const restartGame = () => {
    clearInterval(timerRef.current);
    setTimer(30);
    setScore(0);
    setMoves(0);
    setProblem(genProblem(level));
    timerRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
  };

  return (
    <PageWrapper>
      <Box minH="100vh" bg="gray.100">
        {/* TOP FIXED BAR */}
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
                  Speed Math — Level:
                </Text>

                <ButtonGroup size="sm" isAttached variant="outline">
                  <Button
                    colorScheme={level === "basic" ? "purple" : "gray"}
                    onClick={() => setLevel("basic")}
                  >
                    Basic
                  </Button>
                  <Button
                    colorScheme={level === "intermediate" ? "purple" : "gray"}
                    onClick={() => setLevel("intermediate")}
                  >
                    Intermediate
                  </Button>
                  <Button
                    colorScheme={level === "advanced" ? "purple" : "gray"}
                    onClick={() => setLevel("advanced")}
                  >
                    Advanced
                  </Button>
                </ButtonGroup>
              </HStack>

              <HStack spacing={3}>
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
            </Stack>
          </Box>
        </Box>

        {/* MAIN GAME AREA */}
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

                <Text>Level: {level}</Text>
                <Text>Score: {score}</Text>
                <Text>Moves: {moves}</Text>
                <Text>Timer: {timer}s</Text>

                <Divider />

                <Button colorScheme="purple" w="100%" onClick={restartGame}>
                  Restart
                </Button>

                {/* RULES */}
                <Collapse in={rulesOpen}>
                  <Box
                    mt={4}
                    bg="purple.50"
                    p={4}
                    rounded="md"
                    fontSize="sm"
                    shadow="inner"
                  >
                    <Text fontWeight="bold" mb={2}>
                      Rules:
                    </Text>
                    <Text>
                      • You have 30 seconds.<br />
                      • Solve as many problems as you can.<br />
                      • Correct answer: +10 points.<br />
                      • Wrong answer: -5 points.<br />
                      • Higher levels increase number difficulty.<br />
                    </Text>
                  </Box>
                </Collapse>
              </VStack>
            </Box>

            {/* RIGHT — GAME BOX */}
            <Box flex="1" display="flex" justifyContent="center">
              <VStack spacing={6} w="100%">
                <Box
                  bg="white"
                  shadow="lg"
                  p={8}
                  rounded="lg"
                  w="100%"
                  maxW="500px"
                  textAlign="center"
                >
                  <Text fontSize="3xl" fontWeight="bold" mb={4}>
                    {problem.q}
                  </Text>

                  <form onSubmit={handleSubmit}>
                    <FormControl>
                      <FormLabel>Enter Answer</FormLabel>
                      <Input
                        size="lg"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                        textAlign="center"
                      />
                    </FormControl>

                    <Button
                      mt={4}
                      w="100%"
                      colorScheme="purple"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </form>
                </Box>
              </VStack>
            </Box>
          </HStack>
        </Box>
      </Box>
    </PageWrapper>
  );
}
