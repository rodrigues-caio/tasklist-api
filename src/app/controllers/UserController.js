import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Falha na validação!' });
    }

    const userExists = await User.findOne({
      where: { email: request.body.email },
    });

    if (userExists) {
      return response.status(400).json({ error: 'Usuário já existe!' });
    }

    const { id, name, email } = await User.create(request.body);

    return response.json({ id, name, email });
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      nome: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Falha na validação.' });
    }

    const userId = request.userId;
    const { email, oldPassword } = request.body;

    const user = await User.findByPk(userId);

    if (email !== user.email) {
      const emailExist = await User.findOne({ where: { email } });

      if (emailExist) {
        return response.status(400).json({ error: 'Email já cadastrado!' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return response.status(401).json({ error: 'Senha incorreta!' });
    }

    const { id, name } = await user.update(request.body);

    return response.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
