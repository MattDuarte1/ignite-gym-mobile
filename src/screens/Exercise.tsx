import {
  VStack,
  Text,
  Icon,
  HStack,
  Heading,
  Image,
  Box,
  ScrollView,
  useToast,
} from "native-base";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigationRoutesProps } from "@routes/app.routes";

import BodySvg from "@assets/body.svg";
import SeriesSvg from "@assets/series.svg";
import RepetitionsSvg from "@assets/repetitions.svg";
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

interface RouteParamsProps {
  exerciseId: string;
}
export function Exercise() {
  const [exercise, setExercise] = useState({} as ExerciseDTO);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingRegister, setSendingRegister] = useState(false);
  const navigation = useNavigation<AppNavigationRoutesProps>();
  const route = useRoute();
  const toast = useToast();

  const { exerciseId } = route.params as RouteParamsProps;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const fetchExerciseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/exercises/${exerciseId}`);

      setExercise(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os detalhes do exercício.";

      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseHistoryRegister = async () => {
    try {
      setSendingRegister(true);

      await api.post("/history", { exercise_id: exerciseId });

      toast.show({
        title: "Parabéns! Exercício registrado no seu histórico.",
        placement: "top",
        bgColor: "green.500",
      });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível registrar o exercício.";

      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setSendingRegister(false);
    }
  };

  useEffect(() => {
    fetchExerciseDetails();
  }, [exerciseId]);

  return (
    <VStack flex={1}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <VStack px={8} bg={"gray.600"} pt={12}>
            <TouchableOpacity onPress={handleGoBack}>
              <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
            </TouchableOpacity>

            <HStack
              justifyContent={"space-between"}
              alignItems={"center"}
              mt={4}
              mb={8}
            >
              <Heading
                color={"gray.100"}
                fontSize={"lg"}
                flexShrink={1}
                fontFamily="heading"
              >
                {exercise.name}
              </Heading>

              <HStack alignItems={"center"}>
                <BodySvg />
                <Text color={"gray.200"} ml={1} textTransform={"capitalize"}>
                  {exercise.group}
                </Text>
              </HStack>
            </HStack>
          </VStack>

          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack p={8}>
              <Box w="full" h={80} mb={3} rounded={"lg"} overflow={"hidden"}>
                <Image
                  source={{
                    uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`,
                  }}
                  alt="Nome do exercicio"
                  w={"full"}
                  height={"full"}
                  resizeMode="cover"
                />
              </Box>

              <Box bg={"gray.600"} rounded={"md"} pb={4} px={4}>
                <HStack
                  alignItems={"center"}
                  justifyContent={"space-around"}
                  mb={6}
                  mt={5}
                >
                  <HStack>
                    <SeriesSvg />
                    <Text color={"gray.200"} ml={"2"}>
                      {exercise.series} séries
                    </Text>
                  </HStack>
                  <HStack>
                    <RepetitionsSvg />
                    <Text color={"gray.200"} ml={"2"}>
                      {exercise.repetitions} repetições
                    </Text>
                  </HStack>
                </HStack>

                <Button
                  title="Marca como realizado"
                  isLoading={sendingRegister}
                  onPress={handleExerciseHistoryRegister}
                />
              </Box>
            </VStack>
          </ScrollView>
        </>
      )}
    </VStack>
  );
}
