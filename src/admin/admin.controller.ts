import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ResponseMessage } from '../common/interceptors/response.interceptor';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Admin registered successfully')
  async register(@Body() dto: CreateAdminDto) {
    return this.adminService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ResponseMessage('Admins retrieved successfully')
  async findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ResponseMessage('Admin retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ResponseMessage('Admin updated successfully')
  async update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ResponseMessage('Admin deleted successfully')
  async remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
