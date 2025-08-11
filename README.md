> 1. To reproduce output, restore tables using dump files (postgres) or csv files contained in Data.zip

> 2. Schema
```sql
CREATE TABLE hdb_blocks (
    blk_no                VARCHAR(4) NOT NULL,
    street                VARCHAR(100) NOT NULL,
    max_floor_lvl         SMALLINT,
    year_completed        VARCHAR(4),
    residential           BOOLEAN,
    commercial            BOOLEAN,
    market_hawker         BOOLEAN,
    miscellaneous         BOOLEAN,
    multistorey_carpark   BOOLEAN,
    precinct_pavilion     BOOLEAN,
    bldg_contract_town    VARCHAR(3),
    total_dwelling_units  INTEGER,
    room_1_sold           INTEGER,
    room_2_sold           INTEGER,
    room_3_sold           INTEGER,
    room_4_sold           INTEGER,
    room_5_sold           INTEGER,
    exec_sold             INTEGER,
    multigen_sold         INTEGER,
    studio_apartment_sold INTEGER,
    room_1_rental         INTEGER,
    room_2_rental         INTEGER,
    room_3_rental         INTEGER,
    other_room_rental     INTEGER,
    latitude              DOUBLE PRECISION,
    longitude             DOUBLE PRECISION,
    PRIMARY KEY (blk_no, street)
);

CREATE TABLE clinics (
    x                      DOUBLE PRECISION,
    y                      DOUBLE PRECISION,
    z                      DOUBLE PRECISION,
    name                   TEXT,
    hci_code               VARCHAR(10) PRIMARY KEY,
    hci_name               TEXT,
    licence_type           VARCHAR(5),
    hci_tel                VARCHAR(20),
    postal_cd              VARCHAR(6),
    addr_type              VARCHAR(2),
    blk_hse_no             VARCHAR(5),
    floor_no               VARCHAR(10),
    unit_no                TEXT,
    street_name            TEXT,
    building_name          TEXT,
    clinic_programme_code  TEXT,
    x_coordinate           DOUBLE PRECISION,
    y_coordinate           DOUBLE PRECISION,
    inc_crc                VARCHAR(32),
    fmel_upd_d             VARCHAR(20),
    planning_area          TEXT
);

-- indexing for faster query --
CREATE INDEX ON hdb_blocks (latitude);
CREATE INDEX ON hdb_blocks (longitude);
CREATE INDEX ON clinics (x);
CREATE INDEX ON clinics (y);
```

> 3. To include these cte
```sql
with mapped_clinics as (
select  hci_code, hci_name, planning_area, 
    case 
        when planning_area = 'ANG MO KIO' then 'AMK'
        when planning_area = 'BEDOK' then 'BD'
        when planning_area = 'BISHAN' then 'BH'
        when planning_area = 'BUKIT BATOK' then 'BB'
        when planning_area = 'BUKIT MERAH' then 'BM'
        when planning_area = 'BUKIT PANJANG' then 'BP'
        when planning_area = 'BUKIT TIMAH' then 'BT'
        when planning_area = 'CHANGI' then 'PRC'
        when planning_area = 'CHOA CHU KANG' then 'CCK'
        when planning_area = 'CLEMENTI' then 'CL'
        when planning_area = 'DOWNTOWN CORE' then 'CT'
        when planning_area = 'GEYLANG' then 'GL'
        when planning_area = 'HOUGANG' then 'HG'
        when planning_area = 'JURONG WEST' then 'JW'
        when planning_area = 'JURONG EAST' then 'JE'
        when planning_area = 'KALLANG' then 'KWN'
        when planning_area = 'MARINE PARADE' then 'MP'
        when planning_area = 'MUSEUM' then 'CT'
        when planning_area = 'NEWTON' then 'CT'
        when planning_area = 'ORCHARD' then 'CT' 
        when planning_area = 'NOVENA' then 'KWN'
        when planning_area = 'OUTRAM' then 'CT'
        when planning_area = 'PASIR RIS' then 'PRC'
        when planning_area = 'PAYA LEBAR' then 'GL'
        when planning_area = 'PUNGGOL' then 'PG'
        when planning_area = 'QUEENSTOWN' then 'QT'
        when planning_area = 'RIVER VALLEY' then 'CT'
        when planning_area = 'ROCHOR' then 'CT'
        when planning_area = 'SEMBAWANG' then 'SB'
        when planning_area = 'SENGKANG' then 'SK'
        when planning_area = 'SERANGOON' then 'SGN'
        when planning_area = 'SINGAPORE RIVER' then 'CT'
        when planning_area = 'TAMPINES' then 'TAP'
        when planning_area = 'TOA PAYOH' then 'TP'
        when planning_area = 'WOODLANDS' then 'WL'
        when planning_area = 'YISHUN' then 'YS'
    end as bldg_contract_town
from clinics
),
clinic_500m_residents AS (
    select 
        c.bldg_contract_town as town,
        hci_name as clinic_name,
        sum(total_dwelling_units) * 3.1 as residents_within_500m
    from mapped_clinics c
    lateral (
        select *
        from hdb_blocks hdb
        where 
            c.bldg_contract_town = hdb.bldg_contract_town
            and hdb.residential is true
            and 6371000 * acos(
                LEAST(1, GREATEST(-1,
                    cos(radians(y)) 
                    * cos(radians(latitude)) 
                    * cos(radians(longitude) - radians(x)) 
                    + sin(radians(y)) 
                    * sin(radians(latitude))
                ))
            ) <= 500
    ) as sq1 
    group by hci_name, c.bldg_contract_town
),
residents as (
select 
	bldg_contract_town,  
	sum(total_dwelling_units) * 3.1 as total_residents
from hdb_blocks 
where residential is true
group by bldg_contract_town 
order by total_residents desc
),
clinics_count as (
	select
		bldg_contract_town,
		count(hci_name) as total_clinics
	from mapped_clinics
	group by bldg_contract_town
)
```

Questions & Answers:

**assumptions**
- there are slight discrepancies in address information between HDB property information and those from onemap, I've tried verifying the accuracy (e.g. st name, block number) using google maps - for the purposes of this work, obtained data is assumed to be accurate
- there are some in-house/staff clinics - for the purposes of this work, assume all clinics listed are publicly accessible
- there are 3.1 residents/ dwelling unit

Rank towns in Singapore by the average residents per clinic. 
(Use ⁠ Bldg Contract Town ⁠ as to group)

Level 1: For each town, Total Residents, Total Clinics, Average Residents = Total Residents / Total Clinics

**Total Residents** 
```sql
select 
	bldg_contract_town,  
	sum(total_dwelling_units) * 3.1 as total_residents
from hdb_blocks 
where residential is true
group by bldg_contract_town 
order by total_residents desc;
```

**Total Clinics**
```sql
-- towns that does not have an abbreviation are null --
-- all abbreviations in clinics' bldg_contract_town corresponds with those in hdb_blocks' bldg_contract_town --
select 
    bldg_contract_town as town,
    count(*) as total_clinics
from mapped_clinics
group by bldg_contract_town
order by total_clinics desc;
```

**Average Residents**
```sql
-- This average assumes each resident is linked to only one clinic in the town, without accounting for residents who might visit more than one clinic --

select 
	bldg_contract_town as town, 
	total_residents, 
	case when total_clinics is null then 0 else total_clinics end,
	total_residents/total_clinics as average_residents_per_clinic
from (	
		select 
			hdb_blocks.bldg_contract_town,
			sum(total_dwelling_units) * 3.1 as total_residents,
			sq1.total_clinics
		from hdb_blocks 
			left join (	
						select 
							count(*) as total_clinics,
							bldg_contract_town 
						from mapped_clinics 
						group by bldg_contract_town 
					  ) sq1
			on hdb_blocks.bldg_contract_town = sq1.bldg_contract_town
			group by hdb_blocks.bldg_contract_town, sq1.bldg_contract_town, sq1.total_clinics
	 ) sq2
order by average_residents_per_clinic, town;
```




Level 2: For extra challenge, for each clinic in each town, find out the # of residents within 500m radius (assuming most people will not walk >500m for medical services)

**Number of residents per clinic within 500m radius**
```sql
select 
	c.bldg_contract_town as town,
	hci_name as clinic_name,
	sum(total_dwelling_units) * 3.1 as number_of_residents_within_500m_radius
from mapped_clinics c,

 lateral ( -- similar a for loop, drops row if distance not within 500m --
	select *
		from hdb_blocks hdb
		where 
		 		c.bldg_contract_town = hdb.bldg_contract_town -- only checks within same town, prevents radius from spilling over to another town
			and
				hdb.residential is true 
			and		
				-- filter based on haversine eq --
				6371000 -- earth radius in meters --
				* acos(
					(cos(radians(y)) 
			        * cos(radians(latitude)) 
			        * cos(radians(longitude) - radians(x)) 
			        + sin(radians(y)) 
			        * sin(radians(latitude)))::numeric -- cast floating point to numeric so that calculation falls with -1 to 1 range
			 	) <= 500
		) as sq1 
group by hci_name, c.bldg_contract_town
order by town, hci_name 
```


Then for each town, find out the average residents per clinic (yes, may double count if resident is within 500m of >1 clinic)

**Average Residents**
```sql
-- This average assumes each resident goes to one or more clinics located within a 500 m radius of their residence - the values may be inflated due to potential double counting --

select
    town,
    avg(number_of_residents_within_500m_radius) as average_residents_per_clinic
from clinic_500m_residents
group by town
order by average_residents_per_clinic, town;
```



Level 3: For extra extra challenge, if a resident is within 500m of n clinics, then each clinic receives only 1/n resident. (no double counting)

```sql
	select
		hdb.bldg_contract_town as town, 
		blk_no, 
		street, 
		total_dwelling_units * 3.1 as total_residents,
		count(hci_name) over (partition by blk_no, street ) as number_of_clinics_within_500m,
		hci_name as clinic, 
		-- get weighted residents 
		-- store fraction of total residents (total dwellers/total clinic within 500m of residence) living in the residence in this column
		case 
			when count(hci_name) = 0 then null
			else total_dwelling_units * 3.1 / (count(hci_name) over (partition by blk_no, street )) 
		end as weighted_residents_per_clinic
	from hdb_blocks hdb
	--  Left join the hdb_blocks with clinics using a left join, matching by town and making sure the clinic is within 500 meters. 
	-- If there’s no clinic nearby, the clinic info will just show up as null
	left join mapped_clinics c
		on
			c.bldg_contract_town = hdb.bldg_contract_town
		and		
			-- clinics within 500m radius from the residence --
			6371000 
			* acos(
				(cos(radians(y)) 
				* cos(radians(latitude)) 
				* cos(radians(longitude) - radians(x)) 
				+ sin(radians(y)) 
				* sin(radians(latitude)))::numeric 
			) <= 500
	where residential is true 
	group by 
			hdb.bldg_contract_town, blk_no, street, hci_name
	order by hdb.bldg_contract_town, hci_name
```

Output = table ranking the towns by residents per clinic, with accompanying assumptions

```sql
select * from(
	select 
		town,
		total_residents,
		round(sum(weighted_residents_per_clinic),1) as residents_within_500m_clinic,
		case when total_clinics is null then 0 else total_clinics end,
		round(sum(weighted_residents_per_clinic) * 100 / total_residents,2) as "accessibility(%)",
		case 
			when total_clinics > 0 
			then round(sum(weighted_residents_per_clinic),1)/total_clinics
			else 0
		end 
		as weighted_average_residents_per_clinic
	from(
		select
			hdb.bldg_contract_town as town, 
			blk_no, 
			street, 
			total_residents,
			total_clinics,
			hci_name as clinic, 
			-- get weighted residents 
			-- store fraction of total residents (total dwellers/total clinic within 500m of residence) living in the residence in this column
			case 
				when count(hci_name) = 0 then 0
				else total_dwelling_units * 3.1 / (count(hci_name) over (partition by blk_no, street )) 
			end as weighted_residents_per_clinic
		from hdb_blocks hdb
		--  Left join the hdb_blocks with clinics using a left join, matching by town and making sure the clinic is within 500 meters. 
		-- If there’s no clinic nearby, the clinic info will just show up as null
		left join mapped_clinics c
			on
				c.bldg_contract_town = hdb.bldg_contract_town
			and		
				-- clinics within 500m radius from the residence --
				6371000 
				* acos(
					(cos(radians(y)) 
					* cos(radians(latitude)) 
					* cos(radians(longitude) - radians(x)) 
					+ sin(radians(y)) 
					* sin(radians(latitude)))::numeric 
				) <= 500
		left join residents r
			on 
				r.bldg_contract_town = hdb.bldg_contract_town
		left join clinics_count cc
			on 
				cc.bldg_contract_town = hdb.bldg_contract_town
		where residential is true 
		group by 
				hdb.bldg_contract_town, blk_no, street, hci_name, r.total_residents, cc.total_clinics
		order by hdb.bldg_contract_town, hci_name
	)sq1
	group by town, total_residents, total_clinics
)sq2
order by case when weighted_average_residents_per_clinic > 0 then 1 else 2 end, weighted_average_residents_per_clinic, "accessibility(%)"

```


**remarks**
- added a new column in chas clinics dataset - planning_area (retrieved planning_area data from OneMap api using x,y )
- added new columns in hdb_blocks dataset - latitude, longitude (retrieved values from OneMap api using blk_no and street values)
- not enough data to map pioneer, tuas, seletar, southern islands, tanglin, western water catchmentplanning areas to a bldg_contract_town (not sure what's the abbreviation used for them)
- OneMap offers a reverse geocoding API that can return a list of buildings within a 500 m radius of given coordinates.
However, it only returns a maximum of 10 buildings
Because of this, I’m considering manually getting all buildings within a 500m radius by implementing the Haversine equation.


**references**
- https://curiocity.nlb.gov.sg/story-maps/central-area/#:~:text=Comprising%20the%2011%20Planning%20Areas,and%20historic%20heart%20of%20Singapore.
- https://www.hdb.gov.sg/about-us/history/town-planning/town-design-guides
- https://en.wikipedia.org/wiki/Planning_areas_of_Singapore



