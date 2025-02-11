import { IsString, IsEnum, IsOptional, IsDate, MinDate, MinLength, MaxLength } from 'class-validator';
import { TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(), { message: 'Due date cannot be in the past' })
  dueDate: Date;
}

