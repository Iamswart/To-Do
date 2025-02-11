import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { TaskStatus, TaskPriority } from './entities/task.entity';
import { apiResponse } from '../../common/utils/api-response.util';
import { Request as ExpressRequest } from 'express';

@Controller('todo-lists/:todoListId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(
    @Param('toDoListId') toDoListId: string,
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ) {
    const result = await this.taskService.createTask(
      toDoListId,
      createTaskDto,
      user,
    );
    return apiResponse(result, HttpStatus.CREATED);
  }

  @Get()
  async getTasksByToDoList(
    @Param('toDoListId') toDoListId: string,
    @GetUser() user: User,
    @Req() req: ExpressRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('search') searchTerm?: string,
    @Query('dueDateStart') dueDateStart?: Date,
    @Query('dueDateEnd') dueDateEnd?: Date,
  ) {
    const result = await this.taskService.getTasksByToDoList(
      toDoListId,
      user,
      {
        page,
        limit,
        status,
        priority,
        searchTerm,
        dueDateStart,
        dueDateEnd,
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      }
    );
    return apiResponse(result, HttpStatus.OK);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string, @GetUser() user: User) {
    const result = await this.taskService.getTaskById(id, user);
    return apiResponse(result, HttpStatus.OK);
  }

  @Patch(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    const result = await this.taskService.updateTask(id, updateTaskDto, user);
    return apiResponse(result, HttpStatus.OK);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string, @GetUser() user: User) {
    await this.taskService.deleteTask(id, user);
  }
}
