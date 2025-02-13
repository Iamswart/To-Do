import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  Like,
  Between,
  FindOptionsWhere,
} from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
  ) {}

  async createTask(
    data: Partial<Task>,
    entityManager?: EntityManager,
  ): Promise<Task> {
    const repo = entityManager
      ? entityManager.getRepository(Task)
      : this.repository;
    const task = repo.create(data);
    return repo.save(task);
  }

  async findOne(
    where: FindOptionsWhere<Task> | FindOptionsWhere<Task>[],
    attributes?: (keyof Task)[],
    relations?: string[],
    entityManager?: EntityManager,
  ): Promise<Task | null> {
    const repo = entityManager
      ? entityManager.getRepository(Task)
      : this.repository;

    return repo.findOne({
      where,
      ...(attributes ? { select: attributes } : {}),
      ...(relations ? { relations } : {}),
    });
  }

  async findTasksByToDoList(
    todoListId: string,
    filters?: {
      status?: TaskStatus;
      priority?: TaskPriority;
      searchTerm?: string;
      dueDateStart?: Date;
      dueDateEnd?: Date;
    },
    options?: {
      offset?: number;
      limit?: number;
      attributes?: (keyof Task)[];
      relations?: string[];
    },
    entityManager?: EntityManager,
  ): Promise<[Task[], number]> {
    const repo = entityManager
      ? entityManager.getRepository(Task)
      : this.repository;

    const whereClause: any = {
      todoList: { id: todoListId },
      isDeleted: false,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
    };

    if (filters?.dueDateStart && filters?.dueDateEnd) {
      whereClause.dueDate = Between(filters.dueDateStart, filters.dueDateEnd);
    }

    if (filters?.searchTerm) {
      whereClause.title = Like(`%${filters.searchTerm}%`);
      return repo
        .createQueryBuilder('task')
        .where(whereClause)
        .andWhere(
          '(task.title LIKE :search OR task.description LIKE :search)',
          { search: `%${filters.searchTerm}%` },
        )
        .skip(options?.offset)
        .take(options?.limit)
        .orderBy('task.dueDate', 'ASC')
        .addOrderBy('task.createdAt', 'DESC')
        .getManyAndCount();
    }

    return repo.findAndCount({
      where: whereClause,
      ...(options?.attributes ? { select: options.attributes } : {}),
      ...(options?.relations ? { relations: options.relations } : {}),
      order: {
        dueDate: 'ASC',
        createdAt: 'DESC',
      },
      skip: options?.offset,
      take: options?.limit,
    });
  }

  async updateTask(
    id: string,
    data: Partial<Task>,
    entityManager?: EntityManager,
  ): Promise<Task> {
    const repo = entityManager
      ? entityManager.getRepository(Task)
      : this.repository;
    await repo.update(id, data);
    const updatedTask = await repo.findOne({ where: { id } });
    return updatedTask;
  }

  async softDeleteTask(
    id: string,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(Task)
      : this.repository;
    await repo.update(id, { isDeleted: true });
  }
}
