import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(
    userData: Partial<User>,
    entityManager?: EntityManager,
  ): Promise<User> {
    const repo = entityManager
      ? entityManager.getRepository(User)
      : this.repository;
    const user = repo.create(userData);
    return repo.save(user);
  }

  async findOne(
    where: FindOptionsWhere<User>,
    options?: {
      select?: (keyof User)[];
      relations?: string[];
    },
    entityManager?: EntityManager,
  ): Promise<User | null> {
    const repo = entityManager
      ? entityManager.getRepository(User)
      : this.repository;
    return repo.findOne({
      where,
      select: options?.select,
      relations: options?.relations,
    });
  }

  async findById(
    id: string,
    options?: {
      attributes?: (keyof User)[];
      relations?: string[];
    },
    entityManager?: EntityManager,
  ): Promise<User | null> {
    return this.findOne({ id }, options, entityManager);
  }

  async findByEmail(
    email: string,
    options?: {
      select?: (keyof User)[];
      relations?: string[];
    },
    entityManager?: EntityManager,
  ): Promise<User | null> {
    return this.findOne(
      { email },
      {
        select: [...(options?.select || []), 'password'],
        relations: options?.relations,
      },
      entityManager,
    );
  }
}
