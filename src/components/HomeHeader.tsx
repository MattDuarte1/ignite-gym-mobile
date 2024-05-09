import { HStack, Heading, Icon, Text, VStack, useToast } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { UserPhoto } from "./UserPhoto";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@hooks/useAuth";
import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { api } from "@services/api";
export function HomeHeader() {
  const { user, signOut } = useAuth();
  const toast = useToast();

  const avatarImg = user.avatar
    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
    : defaultUserPhotoImg;

  const handleSignOut = async () => {
    await signOut();
    toast.show({
      title: "Você saiu com sucesso!",
      placement: "top",
      bgColor: "green.500",
    });
  };

  return (
    <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems={"center"}>
      <UserPhoto size={16} source={avatarImg} alt="Imagem do usuário" mr={4} />
      <VStack flex={1}>
        <Text color={"gray.100"} fontSize={"md"}>
          Olá,
        </Text>
        <Heading color={"gray.100"} fontSize={"md"} fontFamily={"heading"}>
          {user.name}
        </Heading>
      </VStack>

      <TouchableOpacity onPress={handleSignOut}>
        <Icon as={MaterialIcons} name="logout" color={"gray.200"} size={7} />
      </TouchableOpacity>
    </HStack>
  );
}
