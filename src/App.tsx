import React, {
  useState,
  useEffect,
  ChangeEventHandler,
  MouseEventHandler,
  KeyboardEventHandler,
} from 'react';
import { api as TodoApi, Todo } from './api/todo';

type TodoItemProps = {
  todo: Todo;
  onRemove: (todoId: Todo['id']) => unknown;
  onUpdate: (
    todoId: Todo['id'],
    todoData: Partial<Omit<Todo, 'id'>>
  ) => unknown;
  onToggle: (todo: Todo) => unknown;
};

function TodoItem(props: TodoItemProps) {
  const [text, setText] = useState(props.todo.content);
  const [editable, setEditable] = useState(false);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setText(event.target.value);
  };

  const handleDblClick: MouseEventHandler<HTMLLabelElement> = () => {
    setEditable(true);
  };

  const handleUpdate = () => {
    props.onUpdate(props.todo.id, {
      content: text,
    });
    setEditable(false);
  };

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      handleUpdate();
    } else if (event.key === 'Escape') {
      setText(props.todo.content);
      setEditable(false);
    }
  };

  const handleBlur = () => {
    if (text !== props.todo.content) {
      handleUpdate();
    }
  };

  return (
    <div>
      <button onClick={() => props.onToggle(props.todo)}>
        {props.todo.completed ? 'completed' : 'active'}
      </button>
      <button onClick={() => props.onRemove(props.todo.id)}>remove</button>
      {!editable && <label onClick={handleDblClick}>{text}</label>}
      {editable && (
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
        />
      )}
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');

  const handleAdd = async () => {
    const result = await TodoApi.addTodo({
      content: text,
    });
    if (result.type === 'InvalidAddTodoInput') {
      alert(result.message);
    } else if (result.type === 'AddTodoSuccess') {
      setTodos(todos.concat(result.todo));
      setText('');
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setText(event.target.value);
  };

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      handleAdd();
    }
  };

  const handleRemove: TodoItemProps['onRemove'] = async (todoId) => {
    let result = await TodoApi.removeTodo({
      todoId: todoId,
    });

    if (result.type === 'TodoIdNotFound') {
      alert(`todoId ${todoId} not found`);
    } else {
      setTodos(result.todos);
    }
  };

  const handleUpdate: TodoItemProps['onUpdate'] = async (todoId, todoData) => {
    let result = await TodoApi.updateTodo({
      todoId: todoId,
      content: todoData.content,
      completed: todoData.completed,
    });

    if (result.type === 'TodoIdNotFound') {
      alert(`todoId ${todoId} not found`);
    } else {
      setTodos(result.todos);
    }
  };

  const handleToggle: TodoItemProps['onToggle'] = async (todo) => {
    let result = await TodoApi.updateTodo({
      todoId: todo.id,
      completed: !todo.completed,
    });

    if (result.type === 'TodoIdNotFound') {
      alert(`todoId ${todo.id} not found`);
    } else {
      setTodos(result.todos);
    }
  };

  const handleClearCompleted = async () => {
    let result = await TodoApi.clearCompleted({});
    setTodos(result.todos);
  };

  useEffect(() => {
    const task = async () => {
      const result = await TodoApi.getTodos({});
      setTodos(result.todos);
    };
    task().catch((error) => {
      console.log('error', error);
    });
  }, []);

  return (
    <div>
      <header>
        <input
          type="text"
          placeholder="input your todo content"
          onChange={handleChange}
          value={text}
          onKeyUp={handleKeyUp}
        />
        <button onClick={handleClearCompleted}>clear completed</button>
      </header>
      <hr />
      <main>
        {todos.map((todo) => {
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              onRemove={handleRemove}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
            />
          );
        })}
      </main>
    </div>
  );
}

export default App;
