import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { signup } from "../services/api";
import { saveToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup({name,email,password});
      saveToken(res.data.token);
      navigate("/");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <Box pt="120px" maxW="400px" mx="auto">
      <Box p={8} bg="white" shadow="lg" rounded="xl">
        <Text fontSize="3xl" fontWeight="bold" mb={4}>Create Account</Text>

        <form onSubmit={submit}>
          <VStack spacing={4}>
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <Button w="100%" colorScheme="purple" type="submit">
              Signup
            </Button>

            <Text fontSize="sm">
              Already have an account? <Link to="/login" style={{color: "#6B46C1"}}>Login</Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
