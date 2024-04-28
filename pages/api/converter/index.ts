import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {sum, afterCurrency, beforeCurrency} = JSON.parse(req.body);

    const url = "https://api.apilayer.com/exchangerates_data/convert?to=" + afterCurrency + "&from=" + beforeCurrency + "&amount=" + sum;
    const myHeaders = new Headers();
    myHeaders.append("apikey", "hE44IsmHdazgHUSbLcj34Sl2cGPVsduz");
    //myHeaders.append("apikey", "oTKqCujvyTo5enTl3d3zjwH3Vj02aEKo"); //Второй код

    const response = await fetch(url, {
        method: 'GET',
        headers: myHeaders
    });

    const convertInfo = await response.json();
    console.log(sum, beforeCurrency, afterCurrency, convertInfo.result);
    return res.json({result: convertInfo.result});
}
