import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto, UpdateLeaveDto } from './dto/leave.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { ResponseMessage } from '../common/interceptors/response.interceptor';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ResponseMessage('Leave request created successfully')
  async create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  @ResponseMessage('Retrieved leave records')
  async findAll(@Query('employeeId') employeeId?: string) {
    if (employeeId) {
      return this.leaveService.findByEmployee(+employeeId);
    }
    return this.leaveService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Retrieved leave record')
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(+id);
  }

  @Patch(':id')
  @ResponseMessage('Leave record updated successfully')
  async update(@Param('id') id: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leaveService.update(+id, updateLeaveDto);
  }

  @Delete(':id')
  @ResponseMessage('Leave record deleted successfully')
  async remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}
