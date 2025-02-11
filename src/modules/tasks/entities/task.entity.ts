import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TodoList } from '../../todo-lists/entities/todo-list.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => TodoList, todoList => todoList.tasks, { onDelete: 'CASCADE' })
  todoList: TodoList;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getTimelineStatus(): 'green' | 'amber' | 'red' {
    const now = new Date();
    const hoursRemaining = (this.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining <= 3) return 'red';
    if (hoursRemaining <= 24) return 'amber';
    if (hoursRemaining >= 72) return 'green';
    return 'amber';
  }
}