import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeaveDto, UpdateLeaveDto } from './dto/leave.dto';
import { differenceInDays, getMonth, getYear } from 'date-fns';
import { PrismaErrorHandler } from '../common/utils';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateLeaveDto) {
    try {
      // Validate date range
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (endDate < startDate) {
        throw new BadRequestException('End date cannot be before start date');
      }

      // Calculate days requested
      const daysRequested = differenceInDays(endDate, startDate) + 1;

      // Check if the leave request spans multiple months
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      // Validate employee exists
      try {
        const employee = await this.prisma.employee.findUniqueOrThrow({
          where: { id: data.employeeId },
          include: { leaves: true }
        });

        // Validate rule: Max 12 days per year
        await this.validateYearlyLimit(employee.id, startDate.getFullYear(), daysRequested);

        // If the leave spans multiple months, check each month
        if (startMonth === endMonth && startYear === endYear) {
          // Single month case
          if (daysRequested > 1) {
            throw new BadRequestException(`Leave request exceeds the limit of 1 day per month.`);
          }
          await this.validateMonthlyLimit(employee.id, startDate.getMonth() + 1, startDate.getFullYear());
        } else {
          throw new BadRequestException(`Leave requests cannot span across multiple months due to the 1-day-per-month limit.`);
        }

      } catch (error) {
        PrismaErrorHandler.handleError(error, 'Employee', data.employeeId);
      }

      // Convert dates to Date objects for Prisma
      const leaveData: any = {
        ...data,
        startDate,
        endDate
      };

      const leave = await this.prisma.leave.create({
        data: leaveData,
        include: { employee: true }
      });

      return leave;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Leave');
    }
  }

  async findAll() {
    const leaves = await this.prisma.leave.findMany({
      include: { employee: true }
    });
    return leaves;
  }

  async findByEmployee(employeeId: number) {
    const leaves = await this.prisma.leave.findMany({
      where: { employeeId },
      include: { employee: true }
    });
    return leaves;
  }

  async findOne(id: number) {
    try {
      const leave = await this.prisma.leave.findUniqueOrThrow({
        where: { id },
        include: { employee: true }
      });
      return leave;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Leave', id);
    }
  }

  async update(id: number, data: UpdateLeaveDto) {
    try {
      // Verify leave exists
      const existingLeave = await this.findOne(id);

      // Create data object for update
      const updateData: any = { ...data };

      // If dates are changed, validate rules again
      if (data.startDate || data.endDate) {
        const startDate = new Date(data.startDate || existingLeave.startDate);
        const endDate = new Date(data.endDate || existingLeave.endDate);

        if (endDate < startDate) {
          throw new BadRequestException('End date cannot be before start date');
        }

        const daysRequested = differenceInDays(endDate, startDate) + 1;

        // Check if the leave request spans multiple months
        const startMonth = startDate.getMonth();
        const endMonth = endDate.getMonth();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();

        // Re-validate yearly limit
        await this.validateYearlyLimit(existingLeave.employeeId, startDate.getFullYear(), daysRequested, id);

        // Check for multi-month leaves and 1-day limit
        if (startMonth === endMonth && startYear === endYear) {
          // Single month case
          if (daysRequested > 1) {
            throw new BadRequestException(`Leave request exceeds the limit of 1 day per month.`);
          }

          // Re-validate monthly limit if month changed
          if (getMonth(startDate) !== getMonth(existingLeave.startDate) ||
            getYear(startDate) !== getYear(existingLeave.startDate)) {
            await this.validateMonthlyLimit(existingLeave.employeeId, startDate.getMonth() + 1, startDate.getFullYear(), id);
          }
        } else {
          throw new BadRequestException(`Leave requests cannot span across multiple months due to the 1-day-per-month limit.`);
        }

        // Update date objects
        if (data.startDate) updateData.startDate = startDate;
        if (data.endDate) updateData.endDate = endDate;
      }

      const leave = await this.prisma.leave.update({
        where: { id },
        data: updateData,
        include: { employee: true }
      });

      return leave;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Leave', id);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.leave.delete({
        where: { id },
      });
      return null;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Leave', id);
    }
  }

  private async validateYearlyLimit(employeeId: number, year: number, daysRequested: number, excludeLeaveId?: number) {
    // Count days already used in the specified year
    const leaves = await this.prisma.leave.findMany({
      where: {
        employeeId,
        startDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        },
        ...(excludeLeaveId && { id: { not: excludeLeaveId } })
      }
    });

    let daysUsed = 0;
    for (const leave of leaves) {
      daysUsed += differenceInDays(leave.endDate, leave.startDate) + 1;
    }

    if (daysUsed + daysRequested > 12) {
      throw new BadRequestException(`Employee has already used ${daysUsed} days of leave this year. Cannot exceed 12 days per year.`);
    }
  }

  private async validateMonthlyLimit(employeeId: number, month: number, year: number, excludeLeaveId?: number) {
    // Get all leaves that fall within the specified month
    const leaves = await this.prisma.leave.findMany({
      where: {
        employeeId,
        AND: [
          {
            OR: [
              {
                startDate: {
                  gte: new Date(`${year}-${month.toString().padStart(2, '0')}-01`),
                  lt: new Date(`${year}-${(month + 1).toString().padStart(2, '0')}-01`)
                }
              },
              {
                endDate: {
                  gte: new Date(`${year}-${month.toString().padStart(2, '0')}-01`),
                  lt: new Date(`${year}-${(month + 1).toString().padStart(2, '0')}-01`)
                }
              }
            ]
          }
        ],
        ...(excludeLeaveId && { id: { not: excludeLeaveId } })
      }
    });

    // Calculate total days of leave in this month
    let daysInMonth = 0;

    for (const leave of leaves) {
      // For leaves that span across months, calculate only days within this month
      const leaveStartDate = new Date(Math.max(
        leave.startDate.getTime(),
        new Date(`${year}-${month.toString().padStart(2, '0')}-01`).getTime()
      ));

      const leaveEndDate = new Date(Math.min(
        leave.endDate.getTime(),
        new Date(`${year}-${(month + 1).toString().padStart(2, '0')}-01`).getTime() - 86400000 // 1 day in ms
      ));

      daysInMonth += differenceInDays(leaveEndDate, leaveStartDate) + 1;
    }

    if (daysInMonth >= 1) {
      throw new BadRequestException(`Employee has already used ${daysInMonth} day(s) of leave in ${month}/${year}. Maximum 1 day per month is allowed.`);
    }
  }
}
