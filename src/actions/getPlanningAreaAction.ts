

'use server'

import { ServerActionResultBuilder } from "@/lib/builders/ServerActionResultBuilder";
import pool from "@/lib/db";
import { getAccessToken } from "@/lib/server/getAccessToken";
import { ServerActionResult } from "@/types/ServerActionResult";





export async function getPlanningAreaAction(): Promise<ServerActionResult> {

    try {
        const authToken = await getAccessToken();
        // 1. get all coordinates from all clinics
        const { rows } = await pool.query('select hci_code, x,y from clinics where planning_area is null order by hci_code');

        // 2. loop through the rows, fetch data from api
        for (const { hci_code: hciCode, x, y } of rows) {
            const url = `https://www.onemap.gov.sg/api/public/popapi/getPlanningarea?latitude=${y}&longitude=${x}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `${authToken}`,  // API token for authorization
                }
            })

            if (response.status === 200) {

                let planningArea;
                const data = await response.json();
                if (data.length > 0) {
                    const [{ pln_area_n }] = data;
                    planningArea = pln_area_n;
                } else {
                    const { pln_area_n } = data;
                    planningArea = pln_area_n;
                }
                console.log(planningArea)

                // 3.  update planning_area
                await pool.query(`update clinics set planning_area = $1 where hci_code = $2`, [planningArea, hciCode])

            } else if (response.status === 400) {
                console.error(await response.text())
            }
        }

        return new ServerActionResultBuilder().success();

    }

    catch (e) {
        console.error(e);

        return new ServerActionResultBuilder().error('Failed to get postal code');

    }

}