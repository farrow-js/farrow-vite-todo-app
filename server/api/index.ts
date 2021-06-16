import { Router } from 'farrow-http';
import { service as GreetService } from './greet';
import { service as TodoService } from './todo';

export const services = Router();

// attach greet service
services.route('/api/greet').use(GreetService);

// attach todo service
services.route('/api/todo').use(TodoService);
