import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskRepository } from './repositories/task.repository';
import { TodoListRepository } from '../todo-lists/repositories/todo-list.repository';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { TaskStatus, TaskPriority } from './entities/task.entity';

jest.mock('../../common/utils/pagination.util', () => ({
    pagingResponse: (items: any[], total: number, page: number, limit: number, url: string) => ({
      payload: items,
      paging: {
        total_items: total,
        page_size: limit,
        current: page,
        count: items.length,
        next: null,
        previous: null
      },
      links: []
    })
  }));

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: TaskRepository;
  let todoListRepository: TodoListRepository;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    todoLists: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTodoList = {
    id: '1',
    name: 'Test List',
    user: mockUser
  };

  const mockTaskRepository = {
    createTask: jest.fn(),
    findOne: jest.fn(),
    findTasksByToDoList: jest.fn(),
    updateTask: jest.fn(),
    softDeleteTask: jest.fn(),
  };

  const mockTodoListRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
        {
          provide: TodoListRepository,
          useValue: mockTodoListRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    todoListRepository = module.get<TodoListRepository>(TodoListRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: new Date(),
      priority: TaskPriority.MEDIUM,
    };

    it('should create a task', async () => {
      const mockTask = {
        id: '1',
        ...createTaskDto,
        todoList: mockTodoList,
        getTimelineStatus: jest.fn().mockReturnValue('GREEN'),
      };

      mockTodoListRepository.findOne.mockResolvedValue(mockTodoList);
      mockTaskRepository.createTask.mockResolvedValue(mockTask);

      const result = await service.createTask('1', createTaskDto, mockUser);

      expect(result.task).toEqual({
        ...mockTask,
        timelineStatus: 'GREEN'
      });
      expect(todoListRepository.findOne).toHaveBeenCalledWith({
        id: '1',
        user: { id: mockUser.id }
      });
    });

    it('should throw NotFoundException when todo list not found', async () => {
      mockTodoListRepository.findOne.mockResolvedValue(null);

      await expect(service.createTask('1', createTaskDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getTasksByToDoList', () => {
    const options = {
      page: 1,
      limit: 10,
      url: 'http://example.com',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      searchTerm: 'test',
    };

    it('should return paginated tasks', async () => {
      const mockTasks = [
        { 
          id: '1', 
          title: 'Task 1',
          getTimelineStatus: jest.fn().mockReturnValue('GREEN')
        },
        { 
          id: '2', 
          title: 'Task 2',
          getTimelineStatus: jest.fn().mockReturnValue('AMBER')
        }
      ];

      mockTodoListRepository.findOne.mockResolvedValue(mockTodoList);
      mockTaskRepository.findTasksByToDoList.mockResolvedValue([mockTasks, 2]);

      const result = await service.getTasksByToDoList('1', mockUser, options);

      expect(result.payload).toHaveLength(2);
      expect(result.paging.total_items).toBe(2);
      expect(result.paging.page_size).toBe(options.limit);
      expect(result.paging.current).toBe(options.page);
      expect(todoListRepository.findOne).toHaveBeenCalledWith({
        id: '1',
        user: { id: mockUser.id }
      });
    });

    it('should throw NotFoundException when todo list not found', async () => {
      mockTodoListRepository.findOne.mockResolvedValue(null);

      await expect(service.getTasksByToDoList('1', mockUser, options))
        .rejects.toThrow(NotFoundException);
    });
});

  describe('getTaskById', () => {
    const taskId = '1';

    it('should return a task', async () => {
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        getTimelineStatus: jest.fn().mockReturnValue('GREEN'),
        todoList: mockTodoList
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById(taskId, mockUser);

      expect(result.task).toEqual({
        ...mockTask,
        timelineStatus: 'GREEN'
      });
      expect(taskRepository.findOne).toHaveBeenCalledWith(
        {
          id: taskId,
          todoList: { user: { id: mockUser.id } }
        },
        undefined,
        ['todoList']
      );
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.getTaskById(taskId, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    const taskId = '1';
    const updateTaskDto = {
      title: 'Updated Task',
      status: TaskStatus.COMPLETED
    };

    it('should update a task', async () => {
      const mockTask = {
        id: taskId,
        ...updateTaskDto,
        getTimelineStatus: jest.fn().mockReturnValue('GREEN')
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.updateTask.mockResolvedValue(mockTask);

      const result = await service.updateTask(taskId, updateTaskDto, mockUser);

      expect(result.task).toEqual({
        ...mockTask,
        timelineStatus: 'GREEN'
      });
      expect(taskRepository.updateTask).toHaveBeenCalledWith(taskId, updateTaskDto);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTask(taskId, updateTaskDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException when update fails', async () => {
      const mockTask = {
        id: taskId,
        title: 'Original Task'
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.updateTask.mockResolvedValue(null);

      await expect(service.updateTask(taskId, updateTaskDto, mockUser))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteTask', () => {
    const taskId = '1';

    it('should delete a task', async () => {
      const mockTask = {
        id: taskId,
        title: 'Test Task'
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.deleteTask(taskId, mockUser);

      expect(result).toEqual({
        success: true,
        message: 'Task deleted successfully'
      });
      expect(taskRepository.softDeleteTask).toHaveBeenCalledWith(taskId);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteTask(taskId, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });
});