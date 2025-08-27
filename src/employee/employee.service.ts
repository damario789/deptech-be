import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { PrismaErrorHandler } from '../common/utils';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateEmployeeDto) {
    try {
      const employee = await this.prisma.employee.create({
        data,
      });
      return employee;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Employee');
    }
  }

  async findAll() {
    const employees = await this.prisma.employee.findMany();
    return employees;
  }

  async findAllWithLeaves() {
    const employees = await this.prisma.employee.findMany({
      include: {
        leaves: true,
      },
    });
    return employees;
  }

  async findOne(id: number) {
    try {
      const employee = await this.prisma.employee.findUniqueOrThrow({
        where: { id },
      });
      return employee;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Employee', id);
    }
  }

  async findOneWithLeaves(id: number) {
    try {
      const employee = await this.prisma.employee.findUniqueOrThrow({
        where: { id },
        include: {
          leaves: true,
        },
      });
      return employee;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Employee', id);
    }
  }
  
  async update(id: number, data: UpdateEmployeeDto) {
    try {
      const employee = await this.prisma.employee.update({
        where: { id },
        data,
      });
      return employee;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Employee', id);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.employee.delete({
        where: { id },
      });
      return null;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Employee', id);
    }
  }
}
