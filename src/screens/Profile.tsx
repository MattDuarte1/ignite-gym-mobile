import {
  Center,
  ScrollView,
  VStack,
  Skeleton,
  Text,
  Heading,
  useToast,
} from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { Controller, useForm } from "react-hook-form";

import defaultUserPhotoImg from "@assets/userPhotoDefault.png";

import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { z } from "zod";
import { useAuth } from "@hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

const profileSchema = z
  .object({
    name: z.string({
      required_error: "Informe o nome",
    }),
    email: z.string({ required_error: "Infome um e-mail" }).email({
      message: "E-mail inválido",
    }),
    old_password: z
      .string()
      .optional()
      .transform((value) => (!!value ? value : null)),
    password: z
      .string()
      .optional()
      .nullable()
      .transform((value) => (!!value ? value : null)),
    confirm_password: z
      .string({
        required_error: "Confirme a sua nova senha.",
      })
      .optional()
      .transform((value) => (!!value ? value : null)),
  })
  .refine(
    (data) => {
      if (data.password !== undefined && data.password !== null) {
        return (
          data.confirm_password !== undefined &&
          data.confirm_password !== null &&
          data.password === data.confirm_password
        );
      } else if (data.password === undefined || data.password === null) {
        return (
          data.confirm_password === null || data.confirm_password === undefined
        );
      }
      return false;
    },
    {
      message: "As senhas não coincidem.",
      path: ["confirm_password"],
    }
  )
  .refine(
    (data) =>
      (data.password &&
        data.password !== undefined &&
        data.password.length >= 6) ||
      data.password === null,
    {
      message: "A senha deve ter no mínimo 6 caracteres.",
      path: ["password"],
    }
  );

type ProfileSchema = z.infer<typeof profileSchema>;

export function Profile() {
  const [userPhotoIsLoading, setUserPhotoIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toast = useToast();
  const { user, updateUserProfile } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileSchema>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: zodResolver(profileSchema),
  });

  const userPhoto = user.avatar
    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
    : defaultUserPhotoImg;

  const handleUserPhotoSelect = async () => {
    setUserPhotoIsLoading(true);
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
        selectionLimit: 1,
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri
        );

        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: "Essa imagem é muito grande. escolha uma de ate 5MB",
            placement: "top",
            bgColor: "red.500",
          });
        }

        const fileExtension = photoSelected.assets[0].uri.split(".").pop();
        const photoFile = {
          name: `avatar-${user.name}.${fileExtension}`
            .toLowerCase()
            .replaceAll(" ", "-"),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;

        const userPhotoUploadForm = new FormData();
        userPhotoUploadForm.append("avatar", photoFile);

        const avatarUpdatedResponse = await api.patch(
          "/users/avatar",
          userPhotoUploadForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const userUpdated = user;
        userUpdated.avatar = avatarUpdatedResponse.data.avatar;
        updateUserProfile(userUpdated);

        toast.show({
          title: "Foto atualizada com sucesso.",
          placement: "top",
          bgColor: "green.500",
        });
      }
    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError
        ? error.message
        : "Não foi possível atualizar a sua foto. Tente novamente mais tarde";

      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setUserPhotoIsLoading(false);
    }
  };

  const handleProfileUpdate = async (data: ProfileSchema) => {
    try {
      setIsUpdating(true);

      await api.put("/users", data);

      const userUpdated = user;
      userUpdated.name = data.name;

      await updateUserProfile(userUpdated);

      reset({
        name: data.name,
        email: data.email,
        old_password: "",
        password: "",
        confirm_password: "",
      });

      toast.show({
        title: "Perfil atualizado com sucesso.",
        placement: "top",
        bgColor: "green.500",
      });
    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError
        ? error.message
        : "Não foi possível atualizar os dados. Tente novamente mais tarde";

      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView>
        <Center mt={6} px={10}>
          {userPhotoIsLoading ? (
            <Skeleton
              rounded={"full"}
              size={33}
              startColor={"gray.500"}
              endColor={"gray.400"}
            />
          ) : (
            <UserPhoto source={userPhoto} alt="Avatar image" size={33} />
          )}
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color={"green.500"}
              fontSize={"md"}
              fontWeight={"bold"}
              mt={2}
              mb={8}
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="name"
                bg={"gray.600"}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field: { value } }) => (
              <Input
                value={value}
                bg={"gray.600"}
                isDisabled
                errorMessage={errors.email?.message}
              />
            )}
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading
            color={"gray.200"}
            fontSize={"md"}
            mb={2}
            fontFamily="heading"
          >
            {" "}
            Alterar senha
          </Heading>

          <Controller
            name="old_password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                bg={"gray.600"}
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
                value={value ?? ""}
                errorMessage={errors.old_password?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                bg={"gray.600"}
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                value={value ?? ""}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            name="confirm_password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                bg={"gray.600"}
                placeholder="Confirme a nova senha"
                secureTextEntry
                onChangeText={onChange}
                value={value ?? ""}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdating}
          />
        </VStack>
      </ScrollView>
    </VStack>
  );
}
