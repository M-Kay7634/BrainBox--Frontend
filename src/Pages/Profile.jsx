import { Box, Text, SimpleGrid } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getUserScores } from "../services/api";
import Achievements from "../components/Achievements";

export default function Profile() {
  const [scores, setScores] = useState([]);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    getUserScores().then(res => {
      const s = res.data || [];
      setScores(s.map(x => ({ date: new Date(x.date).toLocaleDateString(), score: x.score })));
      setDates(s.map(x => new Date(x.date).toDateString()));
    });
  }, []);

  return (
    <Box pt="120px" maxW="1100px" mx="auto" px={4}>
      <Text fontSize="3xl" fontWeight="bold">Your Profile</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Text fontSize="xl" fontWeight="600" mb={4}>Score Progress</Text>
          <LineChart width={450} height={250} data={scores}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#6B46C1" strokeWidth="3" />
          </LineChart>
        </Box>

        <Box bg="white" p={6} rounded="lg" shadow="md">
          <Text fontSize="xl" fontWeight="600" mb={4}>Game Streak</Text>
          <Calendar tileClassName={({ date }) =>
            dates.includes(date.toDateString()) ? "react-calendar__tile--active" : null
          } />
        </Box>
      </SimpleGrid>

      <Box mt={10}>
        <Achievements />
      </Box>
    </Box>
  );
}
