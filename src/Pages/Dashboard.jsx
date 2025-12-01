import { Box, Text, Button, Flex, SimpleGrid } from "@chakra-ui/react";
import GameCard from "../components/GameCard";
import PageWrapper from "../components/PageWrapper";

export default function Dashboard() {
  const games = [
    { title: "Memory Flip", description: "Match pairs quickly", icon: "🃏", path: "/game/memory" },
    { title: "Speed Math", description: "Solve arithmetic fast", icon: "➕", path: "/game/math" },
    { title: "Reaction Time", description: "Test your reflex", icon: "⚡", path: "/game/reaction" },
  ];

  return (<PageWrapper>
    <Box pt="100px" maxW="1100px" mx="auto" px={4}>
      <Flex direction="column" align="center" textAlign="center" mb={10}>
        <Text fontSize="4xl" fontWeight="bold">
          Play quick games — <Text as="span" color="purple.600">boost your IQ</Text>
        </Text>
        <Text maxW="600px" color="gray.600" mt={2}>
          Improve memory, focus, reflexes, and logic with fun interactive games.
        </Text>

        <Flex gap={3} mt={5}>
          <Button colorScheme="purple">Start Playing</Button>
          <Button colorScheme="cyan" variant="outline">Features</Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
        {games.map(g => <GameCard key={g.title} {...g} />)}
      </SimpleGrid>
    </Box>
  </PageWrapper>);
}
