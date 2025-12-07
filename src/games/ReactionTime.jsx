import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Stack,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { submitScore, setAuthToken } from "../services/api";

/**
 * ReactionTime — Feature-rich version
 *
 * Features:
 * - Auto level progression: basic (5) -> intermediate (7) -> advanced (10)
 * - Countdown (3,2,1) before each round
 * - Anti-cheat (too-fast reactions penalized)
 * - Click debouncing to avoid double clicks
 * - Reads token from localStorage and calls setAuthToken(...) before submit
 * - Submits aggregated result to /scores/secure using submitScore(...)
 */

const LEVEL_ORDER = ["basic", "intermediate", "advanced"];
const LEVEL_CONFIG = {
  basic: { label: "Basic", trials: 5 },
  intermediate: { label: "Intermediate", trials: 7 },
  advanced: { label: "Advanced", trials: 10 },
};

export default function ReactionTime() {
  // Game state
  const [status, setStatus] = useState("idle"); // idle | countdown | waiting | now | tooSoon | finished
  const [levelIndex, setLevelIndex] = useState(0); // index into LEVEL_ORDER
  const [currentTrialCount, setCurrentTrialCount] = useState(0); // trials completed in current level
  const [trials, setTrials] = useState([]); // all reaction times across progression (ms)
  const [penalties, setPenalties] = useState(0);
  const [message, setMessage] = useState("Click the box to start.");
  const [lastTime, setLastTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [soundOn, setSoundOn] = useState(false);

  // internal refs
  const navigate = useNavigate();
  const timeoutRef = useRef(null); // for green delay
  const countdownIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const clickDisabledRef = useRef(false);
  const sessionStartRef = useRef(performance.now()); // when multi-level session started

  // Derived
  const level = LEVEL_ORDER[levelIndex];
  const totalTrialsForLevel = LEVEL_CONFIG[level].trials;
  const areaBgIdle = useColorModeValue("gray.200", "gray.700");
  const areaBgWait = useColorModeValue("yellow.200", "yellow.600");
  const areaBgNow = useColorModeValue("green.300", "green.500");
  const areaBgTooSoon = useColorModeValue("red.300", "red.600");
  const panelBg = useColorModeValue("white", "gray.800");

  // cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Utility: attempt to read token from common localStorage keys and set it in API
  const ensureAuthTokenSet = () => {
    try {
      const keysToCheck = ["token", "authToken", "accessToken", "profile", "user"];
      let found = null;

      for (const k of keysToCheck) {
        const v = localStorage.getItem(k);
        if (!v) continue;
        // some apps store a JSON "profile" {..., token: '...'}
        if (k === "profile" || k === "user") {
          try {
            const parsed = JSON.parse(v);
            if (parsed?.token) {
              found = parsed.token;
              break;
            }
            if (parsed?.accessToken) {
              found = parsed.accessToken;
              break;
            }
            if (parsed?.data?.token) {
              found = parsed.data.token;
              break;
            }
          } catch (e) {
            // not JSON, maybe raw token
            found = v;
            break;
          }
        } else {
          found = v;
          break;
        }
      }

      if (found) {
        setAuthToken(found);
        return found;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Sound helper (simple beep using WebAudio)
  const playBeep = (duration = 0.08, freq = 880, vol = 0.05) => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, duration * 1000);
    } catch (e) {
      // audio blocked or not supported
    }
  };

  // Start a single trial: run countdown then waiting state (yellow), then green occurs at random delay
  const startTrial = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(countdownIntervalRef.current);
    setCountdown(3);
    setStatus("countdown");
    setMessage("Get ready...");
    playBeep(0.06, 1000, 0.04);

    // Countdown 3 -> 1
    let c = 3;
    countdownIntervalRef.current = setInterval(() => {
      c -= 1;
      if (c > 0) {
        setCountdown(c);
        playBeep(0.05, 1200, 0.04);
      } else {
        clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        // Now go to "waiting" (yellow) and set a random green delay
        setStatus("waiting");
        setMessage("Wait for GREEN... Don't click early!");
        const delay = 1500 + Math.random() * 2000; // 1.5 - 3.5s
        timeoutRef.current = setTimeout(() => {
          setStatus("now");
          setMessage("TAP NOW!");
          startTimeRef.current = performance.now();
          playBeep(0.06, 1500, 0.06);
        }, delay);
      }
    }, 750);
  };

  // Debounce clicks (short)
  const debounceClick = () => {
    clickDisabledRef.current = true;
    setTimeout(() => {
      clickDisabledRef.current = false;
    }, 250);
  };

  // handle area click (main game interaction)
  const handleAreaClick = () => {
    if (clickDisabledRef.current) return;
    debounceClick();

    // if idle or finished => start the next trial or session
    if (status === "idle") {
      // if starting a fresh session, reset multi-level data if at beginning
      if (trials.length === 0 && penalties === 0 && currentTrialCount === 0) {
        sessionStartRef.current = performance.now();
      }
      startTrial();
      return;
    }

    // too early click while waiting
    if (status === "waiting") {
      clearTimeout(timeoutRef.current);
      setPenalties((p) => p + 1);
      setStatus("tooSoon");
      setMessage("Too soon! Penalty applied.");
      playBeep(0.08, 220, 0.06);
      // brief red then auto restart the trial after a short delay
      timeoutRef.current = setTimeout(() => {
        setStatus("idle");
        setMessage("Click to try again.");
      }, 700);
      return;
    }

    // while showing tooSoon (red) clicking restarts the trial
    if (status === "tooSoon") {
      startTrial();
      return;
    }

    // when it's green — capture reaction
    if (status === "now") {
      const reaction = performance.now() - (startTimeRef.current || performance.now());
      // sanity checks
      if (!Number.isFinite(reaction) || reaction <= 0) {
        // suspicious, treat as penalty
        setPenalties((p) => p + 1);
        setMessage("Invalid measurement — penalty.");
        setStatus("idle");
        return;
      }

      const rounded = Math.round(reaction);

      // Anti-cheat: too-fast (likely not human) -> penalize and do NOT count trial
      if (rounded < 80) {
        setPenalties((p) => Math.min(99, p + 1));
        setStatus("tooSoon");
        setMessage(`Too fast (${rounded} ms)! Marked as penalty.`);
        playBeep(0.08, 220, 0.06);
        // auto return to idle after short delay
        timeoutRef.current = setTimeout(() => {
          setStatus("idle");
          setMessage("Click to try again.");
        }, 700);
        return;
      }

      // good reaction, push it
      setTrials((prev) => {
        const next = [...prev, rounded];
        return next;
      });
      setLastTime(rounded);

      // increment trial count for current level
      setCurrentTrialCount((c) => c + 1);

      // If completed current level -> either advance to next level or finish if last
      const newCount = currentTrialCount + 1;
      if (newCount >= totalTrialsForLevel) {
        // Completed this level
        // If there is a next level, auto-advance after a short celebration pause
        if (levelIndex < LEVEL_ORDER.length - 1) {
          setStatus("idle");
          setMessage(`Level ${LEVEL_CONFIG[level].label} complete! Moving to next level...`);
          playBeep(0.12, 1800, 0.07);
          // small pause then advance
          timeoutRef.current = setTimeout(() => {
            setLevelIndex((idx) => idx + 1);
            setCurrentTrialCount(0);
            setMessage("Next level ready. Click to start next level.");
          }, 1200);
        } else {
          // last level finished — finalize
          setStatus("finished");
          setMessage("All levels completed! Calculating results...");
          // finalize after tiny delay to allow UI update
          timeoutRef.current = setTimeout(() => finalizeAndSubmit(), 500);
        }
      } else {
        // still trials left in current level
        setStatus("idle");
        setMessage("Good! Click to start next trial.");
      }
    }

    // If finished, clicking should not reset the whole session. Provide Restart button for manual restart
    if (status === "finished") {
      // do nothing on click; user should use explicit Restart button below
      return;
    }
  };

  // compute stats helper
  const computeStats = (arr) => {
    if (!arr || arr.length === 0) return null;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const avg = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
    const variance = Math.round(
      arr.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / arr.length
    );
    const stdDev = Math.round(Math.sqrt(variance));
    return { min, max, avg, stdDev, count: arr.length };
  };

  // scoring formula — similar to your existing idea but aggregated across session
  const calcScore = (allTrials, penaltiesCount) => {
    if (!allTrials || allTrials.length === 0) return 0;
    const stats = computeStats(allTrials);
    // base 200 points, subtract average delay factor and penalties
    const base = 200;
    const avgPenaltyFactor = Math.round(stats.avg / 10);
    const penaltyPoints = penaltiesCount * 6;
    let score = Math.max(0, Math.round(base - avgPenaltyFactor - penaltyPoints));
    return score;
  };

  // Reset / Restart session (keeps levelIndex at 0 if fullReset = true)
  const resetSession = (fullReset = false) => {
    clearTimeout(timeoutRef.current);
    clearInterval(countdownIntervalRef.current);
    if (fullReset) {
      setLevelIndex(0);
    }
    setCurrentTrialCount(0);
    setTrials([]);
    setPenalties(0);
    setLastTime(null);
    setStatus("idle");
    setMessage("Click the box to start.");
    sessionStartRef.current = performance.now();
  };

  // finalize stats & submit to backend
  const finalizeAndSubmit = async () => {
  const stats = computeStats(trials);
  const score = calcScore(trials, penalties);
  const timeTaken = stats?.avg ?? 0;

  // BACKEND-FRIENDLY PAYLOAD
  const payload = {
    game: "Reaction Time",
    score,
    timeTaken,
  };

  try {
    await submitScore(payload);
  } catch (err) {
    console.error("Reaction Game: score submit failed", err);
  }

  navigate("/result", {
    state: {
      score,
      game: "Reaction Time",
      avgReaction: timeTaken,
      trials: trials.length,
      penalties,
    },
  });
};


  // UI computed values
  const stats = computeStats(trials);
  const avgTime = stats?.avg ?? null;
  const bestTime = stats?.min ?? null;
  const worstTime = stats?.max ?? null;
  const areaBg =
    status === "waiting"
      ? areaBgWait
      : status === "now"
      ? areaBgNow
      : status === "tooSoon"
      ? areaBgTooSoon
      : areaBgIdle;

  return (
    <Box minH="100vh" bg="gray.100" pt="100px" pb={10}>
      <Box maxW="900px" mx="auto" px={4}>
        {/* Top: Title + Level selection (display only; progression automatic) */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          mb={6}
          gap={3}
        >
          <Box>
            <Text fontSize="3xl" fontWeight="bold">
              Reaction Time Test
            </Text>
            <Text color="gray.600" fontSize="sm">
              Auto progression: Basic → Intermediate → Advanced.
            </Text>
          </Box>

          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600">
              Current Level:
            </Text>
            <Text fontSize="sm" fontWeight="700">
              {LEVEL_CONFIG[level].label} ({currentTrialCount}/{totalTrialsForLevel})
            </Text>
            <FormControl display="flex" alignItems="center" ml={4}>
              <FormLabel htmlFor="sound-toggle" mb="0" fontSize="sm">
                Sound
              </FormLabel>
              <Switch
                id="sound-toggle"
                isChecked={soundOn}
                onChange={(e) => setSoundOn(e.target.checked)}
              />
            </FormControl>
          </HStack>
        </Flex>

        <Stack direction={{ base: "column", md: "row" }} spacing={6}>
          {/* LEFT: Stats panel */}
          <Box bg={panelBg} p={5} rounded="lg" shadow="md" minW={{ base: "full", md: "260px" }}>
            <VStack align="start" spacing={3}>
              <Text fontSize="lg" fontWeight="bold">
                Session Stats
              </Text>

              <Text fontSize="sm">
                Trials recorded: {trials.length} (across levels)
              </Text>

              <Text fontSize="sm">Last reaction: {lastTime !== null ? `${lastTime} ms` : "-"}</Text>

              <Text fontSize="sm">Best reaction: {bestTime !== null ? `${bestTime} ms` : "-"}</Text>

              <Text fontSize="sm">Average: {avgTime !== null ? `${avgTime} ms` : "-"}</Text>

              <Text fontSize="sm">Worst: {worstTime !== null ? `${worstTime} ms` : "-"}</Text>

              <Text fontSize="sm">StdDev: {stats?.stdDev ?? "-"}</Text>

              <Text fontSize="sm">Penalties: {penalties}</Text>

              <HStack spacing={2} mt={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    resetSession(true);
                  }}
                >
                  Restart Session
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // go back to dashboard — keep progress if wanted
                    navigate("/");
                  }}
                >
                  Back to Dashboard
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* RIGHT: Reaction area */}
          <Box flex="1">
            <VStack spacing={4}>
              <Box
                w="100%"
                maxW="600px"
                h="300px"
                bg={areaBg}
                rounded="xl"
                shadow="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor={status === "finished" ? "default" : "pointer"}
                onClick={handleAreaClick}
                textAlign="center"
                userSelect="none"
              >
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    {status === "countdown" && countdown ? `${countdown}` : message}
                  </Text>
                  {status !== "countdown" && (
                    <Text fontSize="sm" color="gray.600">
                      • Click once to start each trial. <br />
                      • Do NOT click while it’s yellow (WAIT). <br />
                      • Click as fast as possible when it turns green.
                    </Text>
                  )}
                </VStack>
              </Box>

              <HStack spacing={4}>
                <Button
                  colorScheme="purple"
                  onClick={() => {
                    // start next trial (if idle)
                    if (status === "idle") startTrial();
                    if (status === "finished") {
                      // explicit finalization (if user wants to re-submit)
                      finalizeAndSubmit();
                    }
                  }}
                >
                  {status === "finished" ? "Finish & Submit" : "Start / Next"}
                </Button>

                <Button
                  onClick={() => {
                    // allow manual finish early (submit whatever recorded so far)
                    if (trials.length > 0) {
                      setStatus("finished");
                      setMessage("Manual finish — submitting results...");
                      setTimeout(() => finalizeAndSubmit(), 300);
                    } else {
                      // nothing recorded
                      resetSession(true);
                    }
                  }}
                >
                  Manual Finish
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    // quick skip to next level (for testing)
                    if (levelIndex < LEVEL_ORDER.length - 1) {
                      setLevelIndex((i) => i + 1);
                      setCurrentTrialCount(0);
                      setMessage("Skipped to next level. Click to start.");
                    }
                  }}
                >
                  Skip Level
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
