import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './graphql/types/customer.type';
import { CustomersPagination } from './graphql/types/customers-pagination.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Resolver(() => Customer)
@UseGuards(JwtAuthGuard)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Mutation(() => Customer)
  createCustomer(
    @Args('createCustomerDto') createCustomerDto: CreateCustomerDto,
  ) {
    return this.customerService.create(createCustomerDto);
  }

  @Query(() => CustomersPagination, { name: 'customers' })
  async findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.customerService.findAll(page, limit);
    return {
      data: result.customers,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Query(() => Customer, { name: 'customer' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.customerService.findOne(id);
  }

  @Mutation(() => Customer)
  updateCustomer(
    @Args('id', { type: () => String }) id: string,
    @Args('updateCustomerDto') updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Mutation(() => Customer)
  deleteCustomer(@Args('id', { type: () => String }) id: string) {
    return this.customerService.remove(id);
  }
}
