import { get } from "node:http";
import {prisma} from "../../config/prisma.js";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    include: {
      studentProfile: true,
      alumniProfile: true,
      adminProfile: true,
    },
  });

  return result;
};

const createUser = async (payload : any) => {
    const result = await prisma.user.create({
        data : payload
    });

    return result ;
}

const getSingleUser = async (uid: string) => {
  const result = await prisma.user.findUnique({
    where: {
      uid,
    },
    include: {
      studentProfile: true,
      alumniProfile: true,
      adminProfile: true,
    },
  });

  return result;
};

const updateUser = async (
  uid: string,
  payload: Record<string, unknown>
) => {
  const result = await prisma.user.update({
    where: {
      uid,
    },
    data: payload,
  });

  return result;
};

const deleteUser = async (uid: string) => {
  const result = await prisma.user.delete({
    where: {
      uid,
    },
  });

  return result;
};

export const UserService = {
    createUser, 
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser
}