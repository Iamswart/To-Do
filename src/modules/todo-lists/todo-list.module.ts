import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoListController } from './todo-list.controller';
import { TodoListService } from './todo-list.service';
import { TodoListRepository } from './repositories/todo-list.repository';
import { TodoList } from './entities/todo-list.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TodoList]), AuthModule],
  controllers: [TodoListController],
  providers: [TodoListService, TodoListRepository],
  exports: [TodoListService, TodoListRepository],
})
export class TodoListModule {}
