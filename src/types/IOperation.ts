export default interface IOperation {
    _id: string;
    user_id: string;
    bankAccount_id: string;
    sum?: number;
    currency?: string;
    category?: string;
    date?: Date;
    operationsStatus?: string;
    finalSum?: number;
}