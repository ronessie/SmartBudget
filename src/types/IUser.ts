export default interface IUser {
    _id: string;
    twoStepAuth?: boolean;
    twoStepAuthCode?: string;
    fio?: string;
    email: string;
    password: string;
    status: string;
    currentBankAccount?: string;
}