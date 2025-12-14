import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<Date, Date> {
  description = 'Date custom scalar type';

  parseValue(value: unknown): Date {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('Invalid date value');
  }

  serialize(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    throw new Error('Invalid date value');
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    throw new Error('Invalid date format');
  }
}
