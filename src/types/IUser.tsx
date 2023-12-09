import { ObjectId } from 'bson';

export default interface IUser {
    _id: ObjectId;
    fio: string;
    email: string;
    password: string;
    sum: number;
    lastUpdateDate: string;
    balance: number;
    currency: string;
    category: string;
    date: string;
    status: string;
    operationsStatus: string;
}