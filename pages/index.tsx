import {GetServerSideProps} from "next";

export default function Page()
{
    return(
        <div>
            <h2>Введите ФИО</h2>
            <input type={"text"}></input>
            <button>Сохранить</button>
        </div>)
}
export const getServerSideProps: GetServerSideProps = async ctx => {
    const { userId } = ctx.query;

    return {
        props: {}
    };
};