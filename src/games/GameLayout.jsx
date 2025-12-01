import { Box } from "@chakra-ui/react";

export default function GameLayout({ children }) {
  return (
    <Box
      minH="100vh"
      bg="gray.50"
      _dark={{ bg: "gray.900" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      {children}
    </Box>
  );
}
