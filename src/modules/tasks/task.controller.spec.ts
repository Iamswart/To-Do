import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { HttpStatus } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { TaskStatus, TaskPriority } from './entities/task.entity';
import { Request } from 'express';

jest.mock('../../common/utils/api-response.util', () => ({
  apiResponse: (payload: any, statusCode: number) => ({
    status: 'success',
    statusCode,
    data: payload
  })
}));

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    todoLists: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTaskService = {
    createTask: jest.fn(),
    getTasksByToDoList: jest.fn(),
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const todoListId = '1';
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date(),
      priority: TaskPriority.MEDIUM,
    };

    it('should create a task', async () => {
      const mockResponse = {
        task: {
          id: '1',
          ...createTaskDto,
          timelineStatus: 'GREEN'
        }
      };

      mockTaskService.createTask.mockResolvedValue(mockResponse);

      const result = await controller.createTask(todoListId, createTaskDto, mockUser);

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.CREATED,
        data: mockResponse
      });
      expect(service.createTask).toHaveBeenCalledWith(todoListId, createTaskDto, mockUser);
    });
  });

  describe('getTasksByToDoList', () => {
    const todoListId = '1';
    const mockRequest = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
      originalUrl: '/todo-lists/1/tasks'
    } as unknown as Request;

    it('should return paginated tasks', async () => {
      const mockResponse = {
        items: [
          { id: '1', title: 'Task 1', timelineStatus: 'GREEN' },
          { id: '2', title: 'Task 2', timelineStatus: 'AMBER' }
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10
        }
      };

      mockTaskService.getTasksByToDoList.mockResolvedValue(mockResponse);

      const result = await controller.getTasksByToDoList(
        todoListId,
        mockUser,
        mockRequest,
        1,
        10,
        TaskStatus.PENDING,
        TaskPriority.HIGH,
        'test'
      );

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.OK,
        data: mockResponse
      });
      expect(service.getTasksByToDoList).toHaveBeenCalledWith(
        todoListId,
        mockUser,
        expect.objectContaining({
          page: 1,
          limit: 10,
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          searchTerm: 'test',
          url: 'http://localhost:3000/todo-lists/1/tasks'
        })
      );
    });
  });

  describe('getTaskById', () => {
    const taskId = '1';

    it('should return a task', async () => {
      const mockResponse = {
        task: {
          id: taskId,
          title: 'Test Task',
          timelineStatus: 'GREEN'
        }
      };

      mockTaskService.getTaskById.mockResolvedValue(mockResponse);

      const result = await controller.getTaskById(taskId, mockUser);

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.OK,
        data: mockResponse
      });
      expect(service.getTaskById).toHaveBeenCalledWith(taskId, mockUser);
    });
  });

  describe('updateTask', () => {
    const taskId = '1';
    const updateTaskDto = {
      title: 'Updated Task',
      status: TaskStatus.COMPLETED
    };

    it('should update a task', async () => {
      const mockResponse = {
        task: {
          id: taskId,
          ...updateTaskDto,
          timelineStatus: 'GREEN'
        }
      };

      mockTaskService.updateTask.mockResolvedValue(mockResponse);

      const result = await controller.updateTask(taskId, updateTaskDto, mockUser);

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.OK,
        data: mockResponse
      });
      expect(service.updateTask).toHaveBeenCalledWith(taskId, updateTaskDto, mockUser);
    });
  });

  describe('deleteTask', () => {
    const taskId = '1';

    it('should delete a task', async () => {
      const mockResponse = {
        success: true,
        message: 'Task deleted successfully'
      };

      mockTaskService.deleteTask.mockResolvedValue(mockResponse);

      await controller.deleteTask(taskId, mockUser);

      expect(service.deleteTask).toHaveBeenCalledWith(taskId, mockUser);
    });
  });
});