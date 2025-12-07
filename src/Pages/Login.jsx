import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🔥 Import the correct API login function
import { login as loginAPI, setAuthToken } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const { login } = useAuth(); // Auth context handler

  const handleLogin = async () => {
    try {
      const res = await loginAPI({ email, password });

      const { token, user } = res.data;

      // Save token globally
      setAuthToken(token);
      login(token, user);

      toast({
        title: "Login Successful",
        status: "success",
        duration: 2000,
      });

      navigate("/profile");
    } catch (err) {
      toast({
        title: "Invalid credentials",
        status: "error",
        duration: 2000,
      });
      console.log(err);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="120px" p={6}>
      <Heading mb={4}>Login</Heading>

      <Stack spacing={4}>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button colorScheme="purple" onClick={handleLogin}>
          Login
        </Button>

        <Text textAlign="center" fontSize="sm">
          Don’t have an account? <a href="/signup">Signup</a>
        </Text>
      </Stack>
    </Box>
  );
}
