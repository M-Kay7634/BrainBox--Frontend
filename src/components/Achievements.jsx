import { Box, Text, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAchievements } from "../services/api";

export default function Achievements() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getAchievements().then(r => setList(r.data || [])).catch(() => setList([]));
  }, []);

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold">Achievements</Text>

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mt={4}>
        {list.length === 0 && <Box p={4} bg="white" shadow="md" rounded="md">No achievements yet</Box>}
        {list.map(a => (
          <Box key={a._id} p={4} bg="white" shadow="md" rounded="md">
            <Text fontWeight="600">{a.title}</Text>
            <Text fontSize="sm" color="gray.500">{a.description}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
