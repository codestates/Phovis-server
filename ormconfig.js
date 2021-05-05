import env from 'dotenv';
env.config();

module.exports = {
  type: 'mysql',
  host: process.env.DATABASE_ENDPOINT,
  port: 3306,
  username: 'root',
  password: process.env.DATABASE_PW,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
