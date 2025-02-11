# Todo List API

A RESTful API built with NestJS for managing todo lists and tasks with user authentication.

## Overview

This API allows users to create and manage multiple todo lists and their associated tasks. It features user authentication, task prioritization, timeline-based status indicators, and comprehensive filtering capabilities.

## Features

- 🔐 User Authentication (JWT)
- 📋 Multiple Todo Lists
- ✅ Task Management
- 🎯 Task Prioritization
- 🚦 Timeline Status Indicators
- 🔍 Advanced Search & Filtering
- 📄 Pagination Support
- ❌ Soft Delete for Tasks

## Tech Stack

- NestJS
- MySQL
- TypeORM
- JWT Authentication
- Jest (Testing)

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>

   ```

2. Install the dependencies:

   ```bash
   npm install


   ```

3. Set up environment variables. Create a .env file in the root directory and add the following variables:

   ```bash
   # Server configuration
   PORT=3000
   NODE_ENV=local

   # Database configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=todo_db

   # JWT configuration
   JWT_SECRET_KEY=<Your JWT Secret>
   JWT_EXPIRATION=<Your JWT Expiration Time>

   # Server URLs
   LOCAL_SERVER_URL=http://localhost:3000/api



   ```

4. Run database migrations

```bash
  npm run migration:run

```

5. Start the Server

   ```bash
    npm run start:dev

   ```

6. API Documentation

   You can view the API documentation by navigating to https://documenter.getpostman.com/view/41998970/2sAYXBFysp

## Usage

### Authentication Endpoints

- POST /auth/login - Login a user
- POST /auth/register - Register a new user

### Todo List Endpoints

- POST /todo-lists - Create a new todo list
- GET /todo-lists - Get all todo lists (with pagination)
- GET /todo-lists/:id - Get a specific todo list
- PATCH /todo-lists/:id - Update a todo list
- DELETE /todo-lists/:id - Delete a todo list

### Task Endpoints

- POST /todo-lists/:todoListId/tasks - Create a new task
- GET /todo-lists/:todoListId/tasks - Get all tasks in a todo list
- GET /todo-lists/:todoListId/tasks/:id - Get a specific task
- PATCH /todo-lists/:todoListId/tasks/:id - Update a task
- DELETE /todo-lists/:todoListId/tasks/:id - Delete a task (soft delete)

### Task Status Colors

- 🟢 Green: 3 or more days remaining
- 🟡 Amber: Less than 24 hours remaining
- 🔴 Red: Less than 3 hours remaining

## Running Tests

1. Unit tests

    ```bash
    npm run test

    ```

## Response Format

1. Successful response

    ```bash
    {
      "status": "success",
      "statusCode": 200,
      "data": {
      // Response data
      }
    }

    ```

2. Error Handling

    ```bash
    {
      "status": "error",
      "statusCode": 400,
      "message": "Error message",
      "errors": {
        "field": "Specific error details"
      }
    }

    ```

3. Paginated responses

    ```bash
    {
      "status": "success",
      "statusCode": 200,
      "data": {
        "payload": [],
        "paging": {
          "total_items": 0,
          "page_size": 10,
          "current": 1,
          "count": 0,
          "next": null,
          "previous": null
        },
        "links": []
      }
    }

    ```
