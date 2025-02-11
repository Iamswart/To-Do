import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoListRepository } from './repositories/todo-list.repository';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { User } from '../users/entities/user.entity';
import { pagingResponse } from '../../common/utils/pagination.util';

@Injectable()
export class TodoListService {
  constructor(private readonly todoListRepository: TodoListRepository) {}

  async createToDoList(createTodoListDto: CreateTodoListDto, user: User) {
    const todoList = await this.todoListRepository.createToDoList({
      ...createTodoListDto,
      user,
    });

    return todoList;
  }

  async getUserToDoLists(
    user: User,
    options: {
      page: number;
      limit: number;
      searchTerm?: string;
      url: string;
    },
  ) {
    const offset = (options.page - 1) * options.limit;

    const [items, total] = await this.todoListRepository.findByUser(user.id, {
      relations: ['user', 'tasks'],
      offset,
      limit: options.limit,
      searchTerm: options.searchTerm,
    });

    return pagingResponse(
      items,
      total,
      options.page,
      options.limit,
      options.url,
    );
  }

  async getToDoListById(id: string, user: User) {
    const todoList = await this.todoListRepository.findOne(
      { id, user: { id: user.id } },
      undefined,
      ['user', 'tasks'],
    );

    if (!todoList) {
      throw new NotFoundException('Todo list not found');
    }

    return todoList;
  }

  async updateToDoList(id: string, updateTodoListDto: UpdateTodoListDto, user: User) {
    const todoList = await this.todoListRepository.findOne({
      id,
      user: { id: user.id },
    });

    if (!todoList) {
      throw new NotFoundException('Todo list not found');
    }

    const updatedTodoList = await this.todoListRepository.updateToDoList(
      id,
      updateTodoListDto,
    );

    return updatedTodoList;
  }

  async deleteToDoList(id: string, user: User) {
    const todoList = await this.todoListRepository.findOne({
      id,
      user: { id: user.id },
    });

    if (!todoList) {
      throw new NotFoundException('Todo list not found');
    }

    await this.todoListRepository.deleteToDoList(id);

    return {
      success: true,
      message: 'Todo deleted successfully',
    };
  }
}
