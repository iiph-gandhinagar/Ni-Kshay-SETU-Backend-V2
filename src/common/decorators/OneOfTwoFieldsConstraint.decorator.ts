import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class OneOfTwoFieldsConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [firstField, secondField] = args.constraints;
    const object = args.object as any;
    const isFirstFieldValid =
      Array.isArray(object[firstField]) && object[firstField].length > 0;

    // Check if the secondField is an array and not empty
    const isSecondFieldValid =
      Array.isArray(object[secondField]) && object[secondField].length > 0;
    // Check if at least one of the fields is present
    return isFirstFieldValid || isSecondFieldValid;
  }

  defaultMessage(args: ValidationArguments) {
    const [firstField, secondField] = args.constraints;
    return `Either ${firstField} or ${secondField} must be provided.`;
  }
}

export function OneOfTwoFields(
  firstField: string,
  secondField: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [firstField, secondField],
      validator: OneOfTwoFieldsConstraint,
    });
  };
}
