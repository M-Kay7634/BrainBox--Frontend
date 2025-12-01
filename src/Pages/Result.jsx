import { Box, Text, Button, Flex } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

export default function Result() {
  const { state } = useLocation();

  return (
    <Box pt="120px" maxW="600px" mx="auto" textAlign="center">
      <Box bg="white" p={8} rounded="lg" shadow="xl">
        <Text fontSize="3xl" fontWeight="bold">Your Result</Text>
        <Text fontSize="5xl" color="purple.600" mt={4}>{state?.score}</Text>

        <Flex justify="center" gap={4} mt={6}>
          <Link to="/">
            <Button colorScheme="purple">Play Again</Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline">View Profile</Button>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
}
