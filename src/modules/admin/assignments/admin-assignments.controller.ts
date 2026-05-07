import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminAssignmentsService } from './admin-assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './assignment.dto';

@Controller('admin/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAssignmentsController {
  constructor(private readonly assignments: AdminAssignmentsService) {}

  @Get()
  async list() {
    return await this.assignments.list();
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.assignments.getById(id);
  }

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

