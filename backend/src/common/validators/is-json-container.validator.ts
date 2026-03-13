import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";

function isPlainObject(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function IsJsonContainer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isJsonContainer",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return Array.isArray(value) || isPlainObject(value);
        },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property ?? "value"} must be an object or array`;
        },
      },
    });
  };
}
