import { Box, Text, Select, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getGlobalTop, getDailyTop } from "../services/api";

export default function Leaderboard() {
  const [game, setGame] = useState("");
  const [global, setGlobal] = useState([]);
  const [daily, setDaily] = useState([]);

  useEffect(() => {
    load();
  }, [game]);

  const load = async () => {
    setGlobal(await getGlobalTop(game).then(r=>r.data).catch(()=>[]));
    setDaily(await getDailyTop(game).then(r=>r.data).catch(()=>[]));
  };

  return (
    <Box pt="120px" maxW="900px" mx="auto" px={4}>
      <Text fontSize="3xl" fontWeight="bold">Leaderboard</Text>

      <Select mt={4} value={game} onChange={e=>setGame(e.target.value)}>
        <option value="">All Games</option>
        <option value="Memory Flip">Memory Flip</option>
        <option value="Speed Math">Speed Math</option>
      </Select>

      <VStack align="stretch" mt={6} spacing={6}>
        <Box bg="white" p={5} rounded="md" shadow="md">
          <Text fontSize="xl" fontWeight="600" mb={3}>Global Top</Text>
          {global.map((item,i)=>(
            <Text key={i}>{i+1}. {item.playerName} — {item.score}</Text>
          ))}
        </Box>

        <Box bg="white" p={5} rounded="md" shadow="md">
          <Text fontSize="xl" fontWeight="600" mb={3}>Today's Top</Text>
          {daily.map((item,i)=>(
            <Text key={i}>{i+1}. {item.playerName} — {item.score}</Text>
          ))}
        </Box>
      </VStack>

    </Box>
  );
}
