import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { ResponseMessage } from '../common/interceptors/response.interceptor';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Post()
    @ResponseMessage('Employee created successfully')
    async create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.create(createEmployeeDto);
    }

    @Get()
    @ResponseMessage('Retrieved all employees')
    async findAll() {
        return this.employeeService.findAll();
    }

    @Get('with-leaves')
    @ResponseMessage('Retrieved all employees with their leave records')
    async findAllWithLeaves() {
        return this.employeeService.findAllWithLeaves();
    }

    @Get(':id')
    @ResponseMessage('Retrieved employee')
    async findOne(@Param('id') id: string) {
        return this.employeeService.findOne(+id);
    }

    @Get(':id/leaves')
    @ResponseMessage('Retrieved employee with leave records')
    async findOneWithLeaves(@Param('id') id: string) {
        return this.employeeService.findOneWithLeaves(+id);
    }

    @Patch(':id')
    @ResponseMessage('Employee updated successfully')
    async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeeService.update(+id, updateEmployeeDto);
    }

    @Delete(':id')
    @ResponseMessage('Employee deleted successfully')
    async remove(@Param('id') id: string) {
        return this.employeeService.remove(+id);
    }
}
