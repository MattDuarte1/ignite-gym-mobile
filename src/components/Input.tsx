import {
  Input as NativeBaseInput,
  IInputProps,
  FormControl,
} from "native-base";

interface Input extends IInputProps {
  errorMessage?: string | null;
}

export function Input({ errorMessage = null, isInvalid, ...rest }: Input) {
  const invalid = !!errorMessage || isInvalid;

  return (
    <FormControl isInvalid={invalid} mb={4}>
      <NativeBaseInput
        bg={"gray.700"}
        h={14}
        px={4}
        borderWidth={1}
        borderColor={"transparent"}
        fontSize={"md"}
        color={"white"}
        fontFamily={"body"}
        placeholderTextColor={"gray.300"}
        isInvalid={invalid}
        _focus={{
          bg: "gray.700",
          borderWidth: 1,
          borderColor: "green.500",
        }}
        _invalid={{
          borderWidth: 1,
          borderColor: "red.500",
        }}
        {...rest}
      />

      <FormControl.ErrorMessage>{errorMessage}</FormControl.ErrorMessage>
    </FormControl>
  );
}
