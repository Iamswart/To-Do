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
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { apiResponse } from '../../common/utils/api-response.util';
import { Request as ExpressRequest } from 'express';

@Controller('todo-lists')
@UseGuards(JwtAuthGuard)
export class TodoListController {
  constructor(private readonly todoListService: TodoListService) {}
  @Post()
  async createToDoList(
    @Body() createTodoListDto: CreateTodoListDto,
    @GetUser() user: User,
  ) {
    const result = await this.todoListService.createToDoList(createTodoListDto, user);
    return apiResponse(result, HttpStatus.CREATED);
  }

  @Get()
  async getUserToDoLists(
    @GetUser() user: User,
    @Req() req: ExpressRequest,
    @Query('search') searchTerm: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.todoListService.getUserToDoLists(user, {
      page,
      limit,
      searchTerm,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    });
    return apiResponse(result, HttpStatus.OK);
  }

  @Get(':id')
  async getToDoListById(@Param('id') id: string, @GetUser() user: User) {
    const result = await this.todoListService.getToDoListById(id, user);
    return apiResponse(result, HttpStatus.OK);
  }

  @Patch(':id')
  async updateToDoList(
    @Param('id') id: string,
    @Body() updateTodoListDto: UpdateTodoListDto,
    @GetUser() user: User,
  ) {
    const result = await this.todoListService.updateToDoList(
      id,
      updateTodoListDto,
      user,
    );
    return apiResponse(result, HttpStatus.OK);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteToDoList(@Param('id') id: string, @GetUser() user: User) {
    await this.todoListService.deleteToDoList(id, user);
  }
}
