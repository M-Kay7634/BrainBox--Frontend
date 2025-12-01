import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  Spinner,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  getProfileSummary,
  getProfileHistory,
  getUserStreak,
} from "../services/api";

// Small reusable card wrapper
const SectionCard = ({ title, children }) => {
  const bg = useColorModeValue("white", "gray.800");
  return (
    <Box bg={bg} p={5} rounded="lg" shadow="md">
      {title && (
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {title}
        </Text>
      )}
      {children}
    </Box>
  );
};

export default function Profile() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, histRes, streakRes] = await Promise.all([
          getProfileSummary(),
          getProfileHistory(),
          getUserStreak(),
        ]);

        setSummary(sumRes.data || {});
        setHistory(histRes.data || []);
        setStreakData(streakRes.data || {});
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <Center minH="70vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // History → chart data (latest 10 scores, reversed)
  const chartData = history
    .slice()
    .reverse()
    .slice(0, 10)
    .map((h, idx) => ({
      index: idx + 1,
      score: h.score,
      timeTaken: h.timeTaken,
      label: new Date(h.date || h.createdAt).toLocaleDateString(),
    }));

  const totalGames = summary?.totalGames || 0;
  const bestScore = summary?.bestScore || 0;
  const avgScore = Number(summary?.avgScore || 0);
  const totalTime = summary?.totalTime || 0;
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;

  return (
    <Box pt="100px" maxW="1200px" mx="auto" px={4} pb={10}>
      {/* TOP: Profile header */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={6}
        gap={4}
      >
        <Flex align="center" gap={4}>
          <Avatar
            name={summary?.name || "Player"}
            src={summary?.avatar || undefined}
            size="xl"
          />
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {summary?.name || "Player"}
            </Text>
            <Text color="gray.500">
              {summary?.email || "guest@example.com"}
            </Text>
            <Text fontSize="sm" color="gray.400">
              Joined:{" "}
              {summary?.createdAt
                ? new Date(summary.createdAt).toLocaleDateString()
                : "—"}
            </Text>
          </Box>
        </Flex>

        <Box textAlign={{ base: "left", md: "right" }}>
          <Text fontWeight="bold" fontSize="lg">
            Current Streak:{" "}
            <Tag colorScheme={currentStreak > 0 ? "green" : "gray"} ml={2}>
              <TagLabel>{currentStreak} days</TagLabel>
            </Tag>
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Longest streak: {longestStreak} days
          </Text>
        </Box>
      </Flex>

      {/* STATS OVERVIEW */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <SectionCard>
          <Stat>
            <StatLabel>Total Games</StatLabel>
            <StatNumber>{totalGames}</StatNumber>
            <StatHelpText>All games played</StatHelpText>
          </Stat>
        </SectionCard>

        <SectionCard>
          <Stat>
            <StatLabel>Best Score</StatLabel>
            <StatNumber>{bestScore}</StatNumber>
            <StatHelpText>Highest game score</StatHelpText>
          </Stat>
        </SectionCard>

        <SectionCard>
          <Stat>
            <StatLabel>Avg Score</StatLabel>
            <StatNumber>
              {Number.isNaN(avgScore) ? 0 : avgScore.toFixed(1)}
            </StatNumber>
            <StatHelpText>Across all games</StatHelpText>
          </Stat>
        </SectionCard>

        <SectionCard>
          <Stat>
            <StatLabel>Time Played</StatLabel>
            <StatNumber>{totalTime} s</StatNumber>
            <StatHelpText>Total gameplay time</StatHelpText>
          </Stat>
        </SectionCard>
      </SimpleGrid>

      {/* CHART + STREAK */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <SectionCard title="Score Progress">
          {chartData.length === 0 ? (
            <Text color="gray.500">Play some games to see your progress.</Text>
          ) : (
            <Box height="260px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6B46C1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </SectionCard>

        <SectionCard title="Recent Activity">
          {streakData?.recentDays?.length ? (
            <Box>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Days you played recently:
              </Text>
              <Flex wrap="wrap" gap={2}>
                {streakData.recentDays.map((d) => (
                  <Tag key={d} colorScheme="purple">
                    {new Date(d).toLocaleDateString()}
                  </Tag>
                ))}
              </Flex>
            </Box>
          ) : (
            <Text color="gray.500">No recent activity.</Text>
          )}
        </SectionCard>
      </SimpleGrid>

      {/* HISTORY TABLE */}
      <Box mt={8}>
        <SectionCard title="Game History">
          {history.length === 0 ? (
            <Text color="gray.500">No games played yet.</Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Game</Th>
                    <Th isNumeric>Score</Th>
                    <Th isNumeric>Moves</Th>
                    <Th isNumeric>Time (s)</Th>
                    <Th>Level</Th>
                    <Th>Category</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {history.map((row) => (
                    <Tr key={row._id}>
                      <Td>
                        {new Date(row.date || row.createdAt).toLocaleString()}
                      </Td>
                      <Td>{row.game}</Td>
                      <Td isNumeric>{row.score}</Td>
                      <Td isNumeric>{row.moves ?? "-"}</Td>
                      <Td isNumeric>{row.timeTaken ?? "-"}</Td>
                      <Td>{row.level ?? "-"}</Td>
                      <Td>{row.category ?? "-"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </SectionCard>
      </Box>
    </Box>
  );
}
