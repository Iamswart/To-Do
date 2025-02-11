import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Like, FindOptionsWhere } from 'typeorm';
import { TodoList } from '../entities/todo-list.entity';

@Injectable()
export class TodoListRepository {
  constructor(
    @InjectRepository(TodoList)
    private readonly repository: Repository<TodoList>,
  ) {}

  async createToDoList(
    data: Partial<TodoList>,
    entityManager?: EntityManager,
  ): Promise<TodoList> {
    const repo = entityManager
      ? entityManager.getRepository(TodoList)
      : this.repository;
    const todoList = repo.create(data);
    return repo.save(todoList);
  }

  async findOne(
    where: FindOptionsWhere<TodoList> | FindOptionsWhere<TodoList>[],
    attributes?: (keyof TodoList)[],
    relations?: string[],
    entityManager?: EntityManager,
  ): Promise<TodoList | null> {
    const repo = entityManager
      ? entityManager.getRepository(TodoList)
      : this.repository;

    return repo.findOne({
      where,
      ...(attributes ? { select: attributes } : {}),
      ...(relations ? { relations } : {}),
    });
  }

  async findById(
    id: string,
    options?: {
      relations?: string[];
      includeDeleted?: boolean;
    },
    entityManager?: EntityManager,
  ): Promise<TodoList | null> {
    const repo = entityManager
      ? entityManager.getRepository(TodoList)
      : this.repository;
    return repo.findOne({
      where: { id },
      relations: options?.relations,
    });
  }

  async findByUser(
    userId: string,
    options?: {
      attributes?: (keyof TodoList)[];
      relations?: string[];
      offset?: number;
      limit?: number;
      searchTerm?: string;
      includeDeleted?: boolean;
    },
    entityManager?: EntityManager,
  ): Promise<[TodoList[], number]> {
    const repo = entityManager
      ? entityManager.getRepository(TodoList)
      : this.repository;

    const whereClause: any = {
      user: { id: userId },
    };

    if (options?.searchTerm) {
      whereClause.name = Like(`%${options.searchTerm}%`);
      if (options.searchTerm) {
        const query = repo
          .createQueryBuilder('todoList')
          .where('todoList.user = :userId', { userId });

        if (options?.attributes?.length) {
          query.select(options.attributes.map((attr) => `todoList.${attr}`));
        }

        query.andWhere(
          '(todoList.name LIKE :search OR todoList.description LIKE :search)',
          { search: `%${options.searchTerm}%` },
        );

        if (options?.relations?.length) {
          options.relations.forEach((relation) => {
            query.leftJoinAndSelect(`todoList.${relation}`, relation);
          });
        }

        return query
          .take(options?.limit)
          .skip(options?.offset)
          .orderBy('todoList.createdAt', 'DESC')
          .getManyAndCount();
      }
    }

    return repo.findAndCount({
      where: whereClause,
      ...(options?.attributes ? { select: options.attributes } : {}),
      ...(options?.relations ? { relations: options.relations } : {}),
      order: { createdAt: 'DESC' },
      skip: options?.offset,
      take: options?.limit,
    });
  }

  async updateToDoList(
    id: string,
    data: Partial<TodoList>,
    entityManager?: EntityManager,
  ): Promise<TodoList> {
    const repo = entityManager
      ? entityManager.getRepository(TodoList)
      : this.repository;
    await repo.update(id, data);
    return this.findById(id, {}, entityManager);
  }

  async deleteToDoList(id: string, entityManager?: EntityManager): Promise<void> {
    const repo = entityManager
      ? entityManager.getRepository(TodoList)
      : this.repository;
    await repo.delete(id);
  }
}
