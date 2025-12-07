import { Box } from "@chakra-ui/react";

export default function PageWrapper({ children }) {
  return (
    <Box pt="110px" px={4} minH="100vh">
      {children}
    </Box>
  );
}
