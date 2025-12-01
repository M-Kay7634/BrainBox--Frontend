import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { login } from "../services/api";
import { saveToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({email,password});
      saveToken(res.data.token);
      navigate("/");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <Box pt="120px" maxW="400px" mx="auto">
      <Box p={8} bg="white" shadow="lg" rounded="xl">
        <Text fontSize="3xl" fontWeight="bold" mb={4}>Login</Text>

        <form onSubmit={submit}>
          <VStack spacing={4}>
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <Button w="100%" colorScheme="purple" type="submit">
              Login
            </Button>

            <Text fontSize="sm">
              Don't have an account? <Link to="/signup" style={{color: "#6B46C1"}}>Signup</Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
