import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAssignmentsService } from './admin-assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './assignment.dto';

@Controller('admin/assignments')
@UseGuards(AdminGuard)
export class AdminAssignmentsController {
  constructor(private readonly assignments: AdminAssignmentsService) {}

  @Post()
  async create(@Body() body: CreateAssignmentDto) {
    return await this.assignments.create(body);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateAssignmentDto,
  ) {
    return await this.assignments.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.assignments.delete(id);
  }
}

