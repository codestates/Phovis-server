import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';
import { User } from './entity/User';

const connection = async (): Promise<Connection> =>
  await createConnection().then(async (connection) => {
    console.log('Inserting a new user into the database...');
    const user = new User();
    user.userName = 'jeong';
    user.email = 'dsjoh111@gmail.com';
    user.password = '1234qwer';
    await connection.manager.save(user);
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log('Saved a new user with id: ' + user.id);

    console.log('Loading users from the database...');
    const users = await connection.manager.find(User);
    console.log('Loaded users: ', users);

    console.log('Here you can setup and run express/koa/any other framework.');
    return connection;
  });

export default connection;
