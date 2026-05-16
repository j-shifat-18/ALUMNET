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

export const UserService = {
    createUser, 
    getAllUsers,
}