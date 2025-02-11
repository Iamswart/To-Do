import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TaskRepository } from './repositories/task.repository';
import { TodoListRepository } from '../todo-lists/repositories/todo-list.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { TaskPriority, TaskStatus } from './entities/task.entity';
import { pagingResponse } from '../../common/utils/pagination.util';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly todoListRepository: TodoListRepository,
  ) {}

  async createTask(todoListId: string, createTaskDto: CreateTaskDto, user: User) {
    const todoList = await this.todoListRepository.findOne({
      id: todoListId,
      user: { id: user.id },
    });

    if (!todoList) {
      throw new NotFoundException('Todo list not found');
    }

    const task = await this.taskRepository.createTask({
      ...createTaskDto,
      todoList,
    });

    return {
      task: {
        ...task,
        timelineStatus: task.getTimelineStatus(),
      },
    };
  }

  async getTasksByToDoList(
    todoListId: string,
    user: User,
    options: {
      page: number;
      limit: number;
      url: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      searchTerm?: string;
      dueDateStart?: Date;
      dueDateEnd?: Date;
    },
  ) {
    const todoList = await this.todoListRepository.findOne({
      id: todoListId,
      user: { id: user.id },
    });

    if (!todoList) {
      throw new NotFoundException('Todo list not found');
    }

    const offset = (options.page - 1) * options.limit;

    const [items, total] = await this.taskRepository.findTasksByToDoList(
      todoListId,
      {
        status: options.status,
        priority: options.priority,
        searchTerm: options.searchTerm,
        dueDateStart: options.dueDateStart,
        dueDateEnd: options.dueDateEnd,
      },
      {
        offset,
        limit: options.limit,
        relations: ['todoList'],
      },
    );

    const enhancedItems = items.map((task) => ({
      ...task,
      timelineStatus: task.getTimelineStatus(),
    }));

    return pagingResponse(
      enhancedItems,
      total,
      options.page,
      options.limit,
      options.url,
    );
  }

  async getTaskById(id: string, user: User) {
    const task = await this.taskRepository.findOne(
      {
        id,
        todoList: { user: { id: user.id } },
      },
      undefined,
      ['todoList'],
    );

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      task: {
        ...task,
        timelineStatus: task.getTimelineStatus(),
      },
    };
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.taskRepository.findOne({
      id,
      todoList: { user: { id: user.id } },
    });

    if (!task) {
      throw new NotFoundException('Task not found ');
    }

    const updatedTask = await this.taskRepository.updateTask(id, updateTaskDto);

    if (!updatedTask) {
      throw new InternalServerErrorException('Failed to update task');
    }

    return {
      task: {
        ...updatedTask,
        timelineStatus: updatedTask.getTimelineStatus(),
      },
    };
  }

  async deleteTask(id: string, user: User) {
    const task = await this.taskRepository.findOne({
      id,
      todoList: { user: { id: user.id } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.softDeleteTask(id);

    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }
}
