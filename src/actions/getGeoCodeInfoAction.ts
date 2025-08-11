'use server'

import { ServerActionResultBuilder } from "@/lib/builders/ServerActionResultBuilder";
import { getAccessToken } from "@/lib/server/getAccessToken";
import { Building } from "@/types/GeoCode";
import { ServerActionResult } from "@/types/ServerActionResult";





const searchRadius = 500;

export async function getGeoCodeInfoAction({ longitude, latitude }: { longitude: string, latitude: string }): Promise<ServerActionResult<Building[]>> {

    try {

        const authToken = await getAccessToken();
        const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${latitude}%2C${longitude}&buffer=${searchRadius}&addressType=HDB&otherFeatures=N`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `${authToken}`,  // API token for authorization
            }
        })


        const data = await response.json();
        return new ServerActionResultBuilder<Building[]>().success(data);

    }

    catch (e) {
        console.error(e);

        return new ServerActionResultBuilder<Building[]>().error('Fail getting map access token');

    }

}