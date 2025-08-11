
let authToken = '';
let timestamp = '';


export async function getAccessToken() {

    // if no exisiting token fetch
    if ((!authToken && !timestamp) || (Number(timestamp) * 1000) >= Date.now()) {

        const response = await fetch(
            `${process.env.ONEMAP_BASE_URL}/api/auth/post/getToken`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: process.env.ONEMAP_API_EMAIL,
                    password: process.env.ONEMAP_API_PASSWORD,
                })
            }
        );

        const data = await response.json();


        authToken = data['access_token']
        timestamp = data['expiry_timestamp']

    }

    return authToken;

}