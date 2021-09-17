import { FormControl, FormLabel, Input, FormErrorMessage } from "@chakra-ui/react"
import { useField } from "formik"

interface InputFieldProps {
    name: string
    label: string
    placeholder: string 
    type: string
}
const InputField = (props: InputFieldProps) => {
    const [field, {error}] = useField(props)

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
            <Input {...field} id={field.name} {...props}></Input>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}

export default InputField
