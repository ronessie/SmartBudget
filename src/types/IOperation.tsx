import { ObjectId } from 'bson';

export default interface IOperation {
    _id: ObjectId;
    user_id: number;
    bankAccount_id: number;
    sum?: number;
    currency?: string;
    category?: string;
    date?: Date;
    operationsStatus?: string;
}