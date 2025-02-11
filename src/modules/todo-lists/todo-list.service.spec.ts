import { Test, TestingModule } from '@nestjs/testing';
import { TodoListService } from './todo-list.service';
import { TodoListRepository } from './repositories/todo-list.repository';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

jest.mock('../../common/utils/pagination.util', () => ({
  pagingResponse: (items: any[], total: number, page: number, limit: number, url: string) => ({
    items,
    meta: {
      total,
      page,
      limit,
      url
    }
  })
}));

describe('TodoListService', () => {
  let service: TodoListService;
  let repository: TodoListRepository;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    todoLists: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTodoListRepository = {
    createToDoList: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    updateToDoList: jest.fn(),
    deleteToDoList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoListService,
        {
          provide: TodoListRepository,
          useValue: mockTodoListRepository,
        },
      ],
    }).compile();

    service = module.get<TodoListService>(TodoListService);
    repository = module.get<TodoListRepository>(TodoListRepository);
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
      const expectedResult = {
        id: '1',
        ...createDto,
        user: mockUser,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTodoListRepository.createToDoList.mockResolvedValue(expectedResult);

      const result = await service.createToDoList(createDto, mockUser);

      expect(result).toEqual(expectedResult);
      expect(repository.createToDoList).toHaveBeenCalledWith({
        ...createDto,
        user: mockUser,
      });
    });
  });

  describe('getUserToDoLists', () => {
    const queryOptions = {
      page: 1,
      limit: 10,
      searchTerm: 'test',
      url: 'http://example.com/lists'
    };

    it('should return paginated todo lists', async () => {
      const mockLists = [
        { id: '1', name: 'List 1' },
        { id: '2', name: 'List 2' }
      ];
      const total = 2;

      mockTodoListRepository.findByUser.mockResolvedValue([mockLists, total]);

      const result = await service.getUserToDoLists(mockUser, queryOptions);

      expect(result).toEqual({
        items: mockLists,
        meta: {
          total,
          page: queryOptions.page,
          limit: queryOptions.limit,
          url: queryOptions.url
        }
      });
      expect(repository.findByUser).toHaveBeenCalledWith(mockUser.id, {
        relations: ['user', 'tasks'],
        offset: 0,
        limit: queryOptions.limit,
        searchTerm: queryOptions.searchTerm,
      });
    });
  });

  describe('getToDoListById', () => {
    const listId = '1';

    it('should return a todo list', async () => {
      const expectedResult = {
        id: listId,
        name: 'Test List',
        user: mockUser
      };

      mockTodoListRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.getToDoListById(listId, mockUser);

      expect(result).toEqual(expectedResult);
      expect(repository.findOne).toHaveBeenCalledWith(
        { id: listId, user: { id: mockUser.id } },
        undefined,
        ['user', 'tasks']
      );
    });

    it('should throw NotFoundException when list not found', async () => {
      mockTodoListRepository.findOne.mockResolvedValue(null);

      await expect(service.getToDoListById(listId, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateToDoList', () => {
    const listId = '1';
    const updateDto = { name: 'Updated List' };

    it('should update a todo list', async () => {
      const existingList = { id: listId, name: 'Old Name' };
      const updatedList = { ...existingList, ...updateDto };

      mockTodoListRepository.findOne.mockResolvedValue(existingList);
      mockTodoListRepository.updateToDoList.mockResolvedValue(updatedList);

      const result = await service.updateToDoList(listId, updateDto, mockUser);

      expect(result).toEqual(updatedList);
      expect(repository.updateToDoList).toHaveBeenCalledWith(listId, updateDto);
    });

    it('should throw NotFoundException when list not found', async () => {
      mockTodoListRepository.findOne.mockResolvedValue(null);

      await expect(service.updateToDoList(listId, updateDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteToDoList', () => {
    const listId = '1';

    it('should delete a todo list', async () => {
      const existingList = { id: listId, name: 'Test List' };

      mockTodoListRepository.findOne.mockResolvedValue(existingList);

      const result = await service.deleteToDoList(listId, mockUser);

      expect(result).toEqual({
        success: true,
        message: 'Todo deleted successfully'
      });
      expect(repository.deleteToDoList).toHaveBeenCalledWith(listId);
    });

    it('should throw NotFoundException when list not found', async () => {
      mockTodoListRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteToDoList(listId, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });
});