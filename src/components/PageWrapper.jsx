import { Box } from "@chakra-ui/react";

export default function PageWrapper({ children }) {
  return (
    <Box pt="90px" px={4} minH="100vh">
      {children}
    </Box>
  );
}
