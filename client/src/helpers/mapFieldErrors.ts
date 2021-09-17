import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (errors: FieldError[]) => {
    return errors.reduce((accumulatedErrorsObj, error) =>  {
        console.log(`accumulatedErrorsObj: ${JSON.stringify(accumulatedErrorsObj)}, Error: ${JSON.stringify(error)}`)
        return {
            ...accumulatedErrorsObj,
            [error.field]: error.message
        }
    }, {})
}