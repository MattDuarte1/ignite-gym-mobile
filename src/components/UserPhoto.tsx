import { Image, IImageProps } from "native-base";

interface UserPhotos extends IImageProps {
  size: number;
}

export function UserPhoto({ size, ...rest }: UserPhotos) {
  return (
    <Image
      w={size}
      h={size}
      rounded={"full"}
      {...rest}
      borderWidth={2}
      borderColor={"gray.400"}
    />
  );
}
