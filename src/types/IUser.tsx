import { ObjectId } from 'bson';

export default interface IUser {
    _id: ObjectId;
    fio: string;
    email: string;
    phone: string;
    password: string;
    sum: number;
    currency: string;
    category: string;
    bankAccount: string;
    status: string;
}