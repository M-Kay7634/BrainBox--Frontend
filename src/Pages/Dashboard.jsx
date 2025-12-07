import { Box, Text, Button, Flex, SimpleGrid } from "@chakra-ui/react";
import GameCard from "../components/GameCard";
import PageWrapper from "../components/PageWrapper";
import { GamesList } from "../data/gameList";   // <-- NEW IMPORT

export default function Dashboard() {
  return (
    <PageWrapper>
      <Box pt="100px" maxW="1100px" mx="auto" px={4}>
        
        {/* HERO SECTION */}
        <Flex direction="column" align="center" textAlign="center" mb={10}>
          <Text fontSize="4xl" fontWeight="bold">
            Play quick games —{" "}
            <Text as="span" color="purple.600">boost your IQ</Text>
          </Text>
          <Text maxW="600px" color="gray.600" mt={2}>
            Improve memory, focus, reflexes, and logic with fun interactive games.
          </Text>

          <Flex gap={3} mt={5}>
            <Button colorScheme="purple">Start Playing</Button>
            <Button colorScheme="cyan" variant="outline">Features</Button>
          </Flex>
        </Flex>

        {/* GAME CARDS GRID */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {GamesList.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </SimpleGrid>
      </Box>
    </PageWrapper>
  );
}
