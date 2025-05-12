import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class DependentQuestionConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName, expectedValue] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    console.log('related value --->', relatedValue, value, expectedValue);
    // Perform your dependency validation logic
    if (relatedValue === expectedValue && (value.length == 0 || value == 0)) {
      return false; // Validation fails if related value matches expected and current value is invalid
    }
    return true; // Validation succeeds
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${
      args.property
    } is required when ${relatedPropertyName} is ${args.constraints[1]}`;
  }
}

export function DependentQuestion(
  relatedPropertyName: string,
  expectedValue: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [relatedPropertyName, expectedValue],
      validator: DependentQuestionConstraint,
    });
  };
}
