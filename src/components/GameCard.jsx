import { Box, Text, Button, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionBox = motion(Box);

export default function GameCard({ title, description, icon, path }) {
  return (
    <MotionBox
      p={6}
      bg="white"
      rounded="lg"
      shadow="lg"
      whileHover={{ scale: 1.05, y: -5 }}
      transition="0.2s"
    >
      <Flex align="center" gap={4}>
        <Box fontSize="3xl">{icon}</Box>
        <Box>
          <Text fontSize="xl" fontWeight="semibold">{title}</Text>
          <Text color="gray.600" fontSize="sm">{description}</Text>
        </Box>
      </Flex>

      <Flex mt={4} gap={3}>
        <Link to={path}>
          <Button colorScheme="purple" size="sm">Play</Button>
        </Link>
        <Button size="sm" variant="outline">Info</Button>
      </Flex>
    </MotionBox>
  );
}
