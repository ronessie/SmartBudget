import {NextApiRequest, NextApiResponse} from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {sum, afterCurrency, beforeCurrency} = JSON.parse(req.body);

    fetch("https://api.apilayer.com/exchangerates_data/convert?to="+beforeCurrency+"&from="+afterCurrency+"&amount="+sum)
        .then(response => response.text())
        .then(result => res.status(200).json({ result: result }))
        .catch(error => console.log('error', error));
}