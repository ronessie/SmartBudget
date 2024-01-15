import { ObjectId } from 'bson';

export default interface IBankAccount {
    _id: ObjectId;
    user_id: ObjectId;
    secondUser_id?: ObjectId;
    name?: string;
    currency?: string;
    balance?: number;
    lastUpdateDate?: Date;
    invitingCode?: string;
}