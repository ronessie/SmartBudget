import {DateTime} from "next-auth/providers/kakao";

export default interface IBankAccount {
    _id: string;
    user_id: string;
    secondUser_id?: string;
    name?: string;
    currency?: string;
    balance?: number;
    lastUpdateDate?: DateTime;
    invitingCode?: string;
    incomeCategories: Map<string, string>,
    expensesCategories: Map<string, string>,
}
