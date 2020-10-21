import Task from '../models/Task';
import * as Yup from 'yup';

class TaskController {
  async index(request, response) {
    const tasks = await Task.findAll({
      where: { user_id: request.userId, check: false },
    });

    return response.json(tasks);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      task: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Falha ao cadastrar.' });
    }

    const { task } = request.body;

    const tasks = await Task.create({
      user_id: request.userId,
      task,
    });

    return response.json(tasks);
  }

  async update(request, response) {
    const { task_id } = request.params;

    const task = await Task.findByPk(task_id);

    if (!task) {
      return response.status(400).json({ error: 'Tarefa não existe.' });
    }

    await task.update(request.body);

    return response.json(task);
  }

  async delete(request, response) {
    const { task_id } = request.params;

    const task = await Task.findByPk(task_id);

    if (!task) {
      return response.status(400).json({ error: 'Tarefa não existe.' });
    }

    if (task.user_id !== request.userId) {
      return response.status(401).json({ error: 'Requisição não autorizada.' });
    }

    await task.destroy();

    return response.send();
  }
}

export default new TaskController();
