import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { StateService } from 'src/state/state.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueIgnoreConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => StateService))
    private readonly stateService: StateService,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const [field] = args.constraints;
    console.log('field and id field --->', field, args, value);
    const existingRecord = await this.stateService.findByProperty(field, value);
    console.log('State-->', existingRecord);
    if (existingRecord) {
      return false;
    }
    return true;
  }
}

export function Unique(
  field: string,
  idField: string,
  options?: ValidationOptions,
) {
  console.log('inside unique validation function ---->');
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'unique',
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [field, idField],
      validator: IsUniqueIgnoreConstraint,
    });
  };
}
