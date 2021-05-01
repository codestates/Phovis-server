import e from 'express';
import connection, {
  getRepository,
  getConnection,
  ObjectLiteral,
} from 'typeorm';

export const makeRelation = async function (
  entity: connection.EntityTarget<unknown>,
  fields: string[],
  connection: connection.Connection
) {
  try {
    await connection.getRepository(entity).find({ relations: [...fields] });
  } catch (err) {
    console.log(err);
  }
};

export const insertJoinColumn = function (
  instance: any[],
  target: string,
  joininstance: any[],
  type: string = 'M'
) {
  instance.forEach((el, idx) => {
    if (type === 'M') {
      el[target] = [joininstance[idx]];
    } else if (type === 'O') {
      el[target] = joininstance[idx];
    }
    el = {
      ...el,
    };
  });
};

export const transformInstance = (seed: any[], entity: any, fnc = create) => {
  return seed.map((el): any => {
    const instance: typeof entity = fnc(entity);
    for (const key in el) {
      instance[key] = el[key];
    }
    return instance;
  });
};

function create<T>(c: { new (): T }): T {
  return new c();
}

export const insertdb = async function (
  Entity: connection.EntityTarget<unknown>,
  values: object | any[]
) {
  const tmp = await getRepository(Entity)
    .createQueryBuilder(Entity.toString().toLowerCase())
    .insert()
    .into(Entity)
    .values({
      ...values,
    })
    .execute();
  return { identifiers: tmp.identifiers, generatedMaps: tmp.generatedMaps };
};

export const CreateRelation = async (
  Entity: connection.EntityTarget<unknown>,
  columnName: string,
  baseresult: ObjectLiteral | number | string,
  targetresult: ObjectLiteral | ObjectLiteral | number | string,
  type: string
) => {
  try {
    if (type === 'O') {
      await getConnection()
        .createQueryBuilder()
        .relation(Entity, columnName)
        .of(baseresult)
        .set(targetresult);
    } else if (type === 'M') {
      await getConnection()
        .createQueryBuilder()
        .relation(Entity, columnName)
        .of(baseresult)
        .add(targetresult);
    }
  } catch (err) {
    console.log(err);
  }
};
