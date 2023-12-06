import { ObjectId } from 'bson';

export default interface IUser {
    _id: ObjectId;
    fio: string;
    email: string;
    password: string;
    sum: number;
    currency: string;
    date: string;
    bankAccount: string;
    status: string;
    operationsStatus: string;
}