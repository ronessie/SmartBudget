import { ObjectId } from 'bson';

export default interface IOperation {
    _id: ObjectId;
    user_id: ObjectId;
    bankAccount_id: ObjectId;
    sum?: number;
    currency?: string;
    category?: string;
    date?: Date;
    operationsStatus?: string;
}