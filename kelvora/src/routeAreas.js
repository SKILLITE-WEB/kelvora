import {stationP} from './journeyTL.js'

const AREAS={
 welcome:0,
 audit:1,
 automate:2,
 grow:3,
 start:4
}

const ROUTES={
 dashboard:'welcome',
 audit:'audit',
 agents:'automate',
 admin:'audit',
 store:'grow',
 portfolio:'grow',
 register:'start',
 network:'start',
 business:'start',
 profile:'start'
}

export const areaP=pathname=>{
 const segment=pathname.split('/').filter(Boolean)[0]||''
 const area=ROUTES[segment]
 return area?stationP(AREAS[area]):null
}
