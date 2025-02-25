import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { HStack, Heading, Image, Text, VStack, Icon } from "native-base";
import { Entypo } from "@expo/vector-icons";
import { ExerciseDTO } from "@dtos/ExerciseDTO";

import { api } from "@services/api";

interface ExerciseCardProps extends TouchableOpacityProps {
  data: ExerciseDTO;
}

export function ExerciseCard({ data, ...rest }: ExerciseCardProps) {
  return (
    <TouchableOpacity {...rest}>
      <HStack
        bg={"gray.500"}
        alignItems={"center"}
        p={2}
        pr={4}
        rounded={"md"}
        mb={3}
        overflow={"hidden"}
      >
        <Image
          source={{
            uri: `${api.defaults.baseURL}/exercise/thumb/${data.thumb}`,
          }}
          w={16}
          height={16}
          rounded={"md"}
          alt="remada unilateral"
          mr={4}
          resizeMode="cover"
        />

        <VStack flex={1}>
          <Heading fontSize={"lg"} color={"white"} fontFamily={"heading"}>
            {data.name}
          </Heading>
          <Text fontSize={"sm"} color={"gray.200"} mt={1} numberOfLines={2}>
            {data.series} séries x {data.repetitions} repetições.
          </Text>
        </VStack>
        <Icon as={Entypo} name="chevron-thin-right" color={"gray.300"} />
      </HStack>
    </TouchableOpacity>
  );
}
