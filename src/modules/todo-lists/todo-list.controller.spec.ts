import { Test, TestingModule } from '@nestjs/testing';
import { TodoListController } from './todo-list.controller';
import { TodoListService } from './todo-list.service';
import { HttpStatus } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

jest.mock('../../common/utils/api-response.util', () => ({
  apiResponse: (payload: any, statusCode: number) => ({
    status: 'success',
    statusCode,
    data: payload
  })
}));

describe('TodoListController', () => {
  let controller: TodoListController;
  let service: TodoListService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    todoLists: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTodoListService = {
    createToDoList: jest.fn(),
    getUserToDoLists: jest.fn(),
    getToDoListById: jest.fn(),
    updateToDoList: jest.fn(),
    deleteToDoList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoListController],
      providers: [
        {
          provide: TodoListService,
          useValue: mockTodoListService
        },
      ],
    }).compile();

    controller = module.get<TodoListController>(TodoListController);
    service = module.get<TodoListService>(TodoListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createToDoList', () => {
    const createDto = {
      name: 'Test List',
      description: 'Test Description'
    };

    it('should create a todo list', async () => {
      const mockResponse = {
        id: '1',
        ...createDto,
        user: mockUser
      };

      mockTodoListService.createToDoList.mockResolvedValue(mockResponse);

      const result = await controller.createToDoList(createDto, mockUser);

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.CREATED,
        data: mockResponse
      });
      expect(service.createToDoList).toHaveBeenCalledWith(createDto, mockUser);
    });
  });

  describe('getUserToDoLists', () => {
    const mockRequest = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
      originalUrl: '/todo-lists'
    } as unknown as Request;

    it('should return paginated todo lists', async () => {
      const mockResponse = {
        items: [
          { id: '1', name: 'List 1' },
          { id: '2', name: 'List 2' }
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10
        }
      };

      mockTodoListService.getUserToDoLists.mockResolvedValue(mockResponse);

      const result = await controller.getUserToDoLists(
        mockUser,
        mockRequest,
        undefined,
        1,
        10
      );

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.OK,
        data: mockResponse
      });
      expect(service.getUserToDoLists).toHaveBeenCalledWith(
        mockUser,
        {
          page: 1,
          limit: 10,
          searchTerm: undefined,
          url: 'http://localhost:3000/todo-lists'
        }
      );
    });
  });

  describe('getToDoListById', () => {
    const listId = '1';

    it('should return a specific todo list', async () => {
      const mockResponse = {
        id: listId,
        name: 'Test List',
        user: mockUser
      };

      mockTodoListService.getToDoListById.mockResolvedValue(mockResponse);

      const result = await controller.getToDoListById(listId, mockUser);

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.OK,
        data: mockResponse
      });
      expect(service.getToDoListById).toHaveBeenCalledWith(listId, mockUser);
    });
  });

  describe('updateToDoList', () => {
    const listId = '1';
    const updateDto = {
      name: 'Updated List'
    };

    it('should update a todo list', async () => {
      const mockResponse = {
        id: listId,
        ...updateDto,
        user: mockUser
      };

      mockTodoListService.updateToDoList.mockResolvedValue(mockResponse);

      const result = await controller.updateToDoList(listId, updateDto, mockUser);

      expect(result).toEqual({
        status: 'success',
        statusCode: HttpStatus.OK,
        data: mockResponse
      });
      expect(service.updateToDoList).toHaveBeenCalledWith(listId, updateDto, mockUser);
    });
  });

  describe('deleteToDoList', () => {
    const listId = '1';

    it('should delete a todo list', async () => {
      mockTodoListService.deleteToDoList.mockResolvedValue({
        success: true,
        message: 'Todo deleted successfully'
      });

      await controller.deleteToDoList(listId, mockUser);

      expect(service.deleteToDoList).toHaveBeenCalledWith(listId, mockUser);
    });
  });
});