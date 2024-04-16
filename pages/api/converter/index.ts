import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {sum, afterCurrency, beforeCurrency} = JSON.parse(req.body);
    console.log(sum, afterCurrency, beforeCurrency);
    const url = "https://api.apilayer.com/exchangerates_data/convert?to=" + beforeCurrency + "&from=" + afterCurrency + "&amount=" + sum;
    const myHeaders = new Headers();
    myHeaders.append("apikey", "hE44IsmHdazgHUSbLcj34Sl2cGPVsduz");
    //myHeaders.append("apikey", "oTKqCujvyTo5enTl3d3zjwH3Vj02aEKo"); //Второй код

    const response = await fetch(url, {
        method: 'GET',
        headers: myHeaders
    });

    const convertInfo = await response.json();
    return res.json({result: convertInfo.result});
}
