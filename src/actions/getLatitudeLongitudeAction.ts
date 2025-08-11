'use server'

import { ServerActionResultBuilder } from "@/lib/builders/ServerActionResultBuilder";
import pool from "@/lib/db";
import { getAccessToken } from "@/lib/server/getAccessToken";
import { ServerActionResult } from "@/types/ServerActionResult";


export async function getLatitudeLongitudeAction(): Promise<ServerActionResult> {

    try {
        const authToken = await getAccessToken();

        // 1. get all hdb blocks addresses
        const { rows } = await pool.query('select blk_no, street from hdb_blocks where (latitude is null or longitude is null)')

        // 2. loop through rows, fetch data from api
        for (const { blk_no: blockNumber, street } of rows) {

            const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${blockNumber}%20${street}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `${authToken}`,  // API token for authorization
                }
            })

            if (response.status === 200) {

                const data = await response.json();
                let blkNo;
                let roadName;
                let latitude;
                let longitude;


                for (let i = 0; i < data.results.length; i++) {
                    const { BLK_NO, ROAD_NAME, LATITUDE, LONGITUDE } = data.results[i];
                    blkNo = BLK_NO;
                    roadName = ROAD_NAME.replaceAll(/ROAD/ig, 'RD')
                        .replaceAll(/SOUTH/ig, 'STH')
                        .replaceAll(/CRESCENT/ig, 'CRES')
                        .replaceAll(/AVENUE/ig, 'AVE')
                        .replaceAll(/PARK/ig, 'PK')
                        .replaceAll(/BUKIT/ig, 'BT')
                        .replaceAll(/JALAN/ig, 'JLN')
                        .replaceAll(/LORONG/ig, 'LOR')
                        .replaceAll(/TERRACE/ig, 'TER')
                        .replaceAll(/DRIVE/ig, 'DR')
                        .replaceAll(/KAMPONG/ig, 'KG')
                        .replaceAll(/CLOSE/ig, 'CL')
                        .replaceAll(/SAINT/ig, 'ST.')
                        .replaceAll(/TANJONG/ig, 'TG')
                        .replaceAll(/UPPER/ig, 'UPP')
                        .replaceAll(/INDUSTRIAL/ig, 'IND')
                        .replaceAll(/STREET/ig, 'ST')
                        .replaceAll(/CENTRAL/ig, 'CTRL')
                        .replaceAll(/GARDEN/ig, 'GDN')
                        .replaceAll(/COMMONWEALTH/ig, "C'WEALTH")
                        .replaceAll(/\bNORTH\b/ig, 'NTH')
                        .replaceAll(/PLACE/ig, 'PL')
                        .replaceAll(/HEIGHTS/ig, 'HTS')
                        .replaceAll(/MARKET/ig, 'MKT');
                    latitude = LATITUDE;
                    longitude = LONGITUDE;


                    // While we could simply use the first postal code from the response, 
                    // OneMap may return results that are not an exact match. 
                    // For example, searching for "2 Foo Central" might return an address 
                    // where the block number and street name match, as well as another 
                    // address with a building named "Foo Central" located at a completely 
                    // different address.
                    if (blkNo === blockNumber && roadName === street) {

                        await pool.query('update hdb_blocks set latitude = $1, longitude = $2 where blk_no = $3 and street = $4', [latitude, longitude, blockNumber, street])
                        console.log('added', latitude, longitude, 'to', blockNumber, street)
                        break;
                    }
                    console.log('unable to add')

                    console.log('compare block number, from onemap:', blkNo, ', from clinics dataset:', blockNumber)

                    console.log('compare street address, from onemap:', roadName, ', from clinics dataset: ', street);

                }
            } else if (response.status === 400) {
                console.error(await response.text())
            }
        }
        return new ServerActionResultBuilder().success();

    }

    catch (e) {
        console.error(e);

        return new ServerActionResultBuilder().error('Internal Server Error');

    }

}