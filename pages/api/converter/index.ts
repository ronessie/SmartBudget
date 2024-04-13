import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { sum, afterCurrency, beforeCurrency } = JSON.parse(req.body);
    console.log(sum, afterCurrency, beforeCurrency);
    const url = "https://api.apilayer.com/exchangerates_data/convert?to="+beforeCurrency+"&from="+afterCurrency+"&amount="+sum;
    const myHeaders = new Headers();
    myHeaders.append("apikey", "oTKqCujvyTo5enTl3d3zjwH3Vj02aEKo");

    const response = await fetch(url, {
        method: 'GET',
        headers: myHeaders
    });

    //example of success return
    // {
    //     success: true,
    //     query: { from: 'RUB', to: 'USD', amount: 1 },
    //     info: { timestamp: 1712858644, rate: 0.010764 },
    //     date: '2024-04-11',
    //     result: 0.010764
    // }

    const convertInfo = await response.json();
    return res.json({ result: convertInfo.result });
}
