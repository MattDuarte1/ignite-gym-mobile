import { Button as NativeBaseButton, IButtonProps, Text } from "native-base";

interface ButtonProps extends IButtonProps {
  title: string;
  variant?: "outline" | "solid";
}

export function Button({ title, variant = "solid", ...rest }: ButtonProps) {
  return (
    <NativeBaseButton
      h={14}
      w={"full"}
      bg={variant === "outline" ? "transparent" : "green.700"}
      borderWidth={variant === "outline" ? 1 : 0}
      borderColor={"green.500"}
      rounded={"sm"}
      _pressed={{
        bg: variant === "outline" ? "gray.500" : "green.500",
      }}
      {...rest}
    >
      <Text
        color={variant === "outline" ? "green.500" : "white"}
        fontFamily={"heading"}
        fontSize={"sm"}
      >
        {title}
      </Text>
    </NativeBaseButton>
  );
}
