async function test(){
    const path = "/uploads/1713298101422.png"
    const response = await fetch('/api/textRecognition', {
        method: 'POST',
        body: JSON.stringify({
            path
        }),
    });

    if (response.ok) {
        console.log('api worked successfully!');
        const result = (await response.json()).result;
    } else {
        console.error('Failed work.');
    }
}
export default function Page()
{
    return(
        <div>
            <button onClick={test}>Test</button>
        </div>
    )
}

