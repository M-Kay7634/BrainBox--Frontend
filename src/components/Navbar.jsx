import {
  Box,
  Flex,
  HStack,
  Button,
  IconButton,
  Text,
  useColorMode,
  useDisclosure
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const MotionBox = motion(Box);

export default function Navbar() {
  const [hide, setHide] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  if (hide) return null; // completely hides navbar

  return (
    <MotionBox
      position="fixed"
      top="0"
      left="0"
      width="100%"
      bg="white"
      _dark={{ bg: "gray.800" }}
      boxShadow="sm"
      zIndex="1000"
      py={3}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <Flex
        maxW="1200px"
        mx="auto"
        alignItems="center"
        justifyContent="space-between"
        px={6}
      >
        {/* LOGO */}
        <Link to="/">
          <Text fontSize="2xl" fontWeight="bold" color="purple.500" cursor="pointer">
            BrainBox
          </Text>
        </Link>

        {/* Desktop Menu */}
        <HStack spacing={5} display={{ base: "none", md: "flex" }}>
          <Link to="/leaderboard">Leaderboard</Link>

          <Link to="/login">
            <Button size="sm" variant="ghost">Login</Button>
          </Link>

          <Link to="/signup">
            <Button size="sm" colorScheme="purple">Signup</Button>
          </Link>

          {/* Dark/Light Toggle */}
          <IconButton
            size="sm"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />

          {/* Hide Navbar Button */}
          <Button size="sm" onClick={() => setHide(true)} variant="outline">
            Hide Nav
          </Button>
        </HStack>

        {/* Mobile Menu Icon */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={onToggle}
        />
      </Flex>

      {/* Mobile Dropdown */}
      {isOpen && (
        <Box bg="white" _dark={{ bg: "gray.800" }} p={4} display={{ md: "none" }}>
          <Link to="/leaderboard"><Text py={2}>Leaderboard</Text></Link>
          <Link to="/login"><Text py={2}>Login</Text></Link>
          <Link to="/signup"><Text py={2}>Signup</Text></Link>
          <Button w="100%" mt={2} onClick={toggleColorMode}>
            {colorMode === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
          <Button w="100%" mt={2} variant="outline" onClick={() => setHide(true)}>
            Hide Navbar
          </Button>
        </Box>
      )}
    </MotionBox>
  );
}
