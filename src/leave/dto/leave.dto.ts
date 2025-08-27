import { IsString, IsDateString, IsInt, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export class CreateLeaveDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsInt()
  @IsNotEmpty()
  employeeId: number;

  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus = LeaveStatus.PENDING;
}

export class UpdateLeaveDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;
}
