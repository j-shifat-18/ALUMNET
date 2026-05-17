import { get } from "node:http";
import {prisma} from "../../config/prisma.js";

const getAllUsers = async () => {
    const result = await prisma.user.findMany();

    return result ;
}

const createUser = async (payload : any) => {
    const result = await prisma.user.create({
        data : payload
    });

    return result ;
}

const getSingleUser = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return result;
};

const updateSingleUser = async (
  id: string,
  payload: any
) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteUser = async (id: string) => {
  const result = await prisma.user.delete({
    where: {
      id,
    },
  });

  return result;
};

export const UserService = {
    createUser, 
    getAllUsers,
    getSingleUser,
    updateSingleUser,
    deleteUser
}