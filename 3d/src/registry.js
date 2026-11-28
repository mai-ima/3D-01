// 自動生成: node 3d/tools/gen-registry.cjs
import m0 from './expressway/barrier/jp-exp-barrier-concrete.js';
import m1 from './expressway/barrier/jp-exp-cushion-drum.js';
import m2 from './expressway/barrier/jp-exp-noise-wall.js';
import m3 from './expressway/barrier/jp-exp-wire-rope.js';
import m4 from './expressway/info/jp-exp-vms.js';
import m5 from './expressway/lighting/jp-exp-light-pole.js';
import m6 from './expressway/sign/jp-exp-kilopost.js';
import m7 from './expressway/sign/jp-exp-sign-gantry.js';
import m8 from './expressway/sign/jp-exp-sign-route.js';
import m9 from './expressway/tollgate/jp-toll-lane.js';
import m10 from './road/barrier/jp-barrier-guardpipe.js';
import m11 from './road/barrier/jp-barrier-guardrail.js';
import m12 from './road/construction/jp-const-barricade.js';
import m13 from './road/construction/jp-const-cone.js';
import m14 from './road/facility/jp-facility-bollard.js';
import m15 from './road/facility/jp-facility-curve-mirror.js';
import m16 from './road/facility/jp-facility-delineator.js';
import m17 from './road/facility/jp-facility-rubber-pole.js';
import m18 from './road/lighting/jp-light-road.js';
import m19 from './road/lighting/jp-light-sidewalk.js';
import m20 from './road/sign/jp-sign-guide.js';
import m21 from './road/sign/jp-sign-speed.js';
import m22 from './road/sign/jp-sign-stop.js';
import m23 from './road/sign/jp-sign-warning.js';
import m24 from './road/surface/jp-surface-curb.js';
import m25 from './road/surface/jp-surface-grating.js';
import m26 from './road/surface/jp-surface-manhole.js';
import m27 from './road/surface/jp-surface-tenji.js';
import m28 from './roadway/arterial/jp-roadway-arterial.js';
import m29 from './roadway/expressway/jp-roadway-expressway.js';
import m30 from './roadway/national/jp-roadway-national.js';
import m31 from './roadway/regional/jp-roadway-regional.js';
import m32 from './signal/combined/jp-combo-arm-ped.js';
import m33 from './signal/combined/jp-combo-vert-ped.js';
import m34 from './signal/crossing/jp-crossing-alarm.js';
import m35 from './signal/crossing/jp-crossing-gate.js';
import m36 from './signal/pedestrian/jp-bike-ped.js';
import m37 from './signal/pedestrian/jp-ped-button.js';
import m38 from './signal/pedestrian/jp-ped-count.js';
import m39 from './signal/pedestrian/jp-ped-led.js';
import m40 from './signal/rail/jp-rail-3.js';
import m41 from './signal/rail/jp-rail-4.js';
import m42 from './signal/rail/jp-rail-5.js';
import m43 from './signal/rail/jp-rail-relay.js';
import m44 from './signal/tram/jp-tram-symbol.js';
import m45 from './signal/tram/jp-tram-with-vehicle.js';
import m46 from './signal/tram/jp-tram.js';
import m47 from './signal/vehicle/jp-veh-arrow.js';
import m48 from './signal/vehicle/jp-veh-center-pole.js';
import m49 from './signal/vehicle/jp-veh-flash.js';
import m50 from './signal/vehicle/jp-veh-h250-side.js';
import m51 from './signal/vehicle/jp-veh-h300-arm.js';
import m52 from './signal/vehicle/jp-veh-hoodless.js';
import m53 from './signal/vehicle/jp-veh-v-snow.js';
import m54 from './signal/vehicle/jp-veh-v250.js';
import m55 from './track/railway/jp-track-ballast.js';
import m56 from './track/railway/jp-track-slab.js';
import m57 from './track/tram/jp-track-tram.js';
export const MODELS=[
  {path:["expressway","barrier"],def:m0},
  {path:["expressway","barrier"],def:m1},
  {path:["expressway","barrier"],def:m2},
  {path:["expressway","barrier"],def:m3},
  {path:["expressway","info"],def:m4},
  {path:["expressway","lighting"],def:m5},
  {path:["expressway","sign"],def:m6},
  {path:["expressway","sign"],def:m7},
  {path:["expressway","sign"],def:m8},
  {path:["expressway","tollgate"],def:m9},
  {path:["road","barrier"],def:m10},
  {path:["road","barrier"],def:m11},
  {path:["road","construction"],def:m12},
  {path:["road","construction"],def:m13},
  {path:["road","facility"],def:m14},
  {path:["road","facility"],def:m15},
  {path:["road","facility"],def:m16},
  {path:["road","facility"],def:m17},
  {path:["road","lighting"],def:m18},
  {path:["road","lighting"],def:m19},
  {path:["road","sign"],def:m20},
  {path:["road","sign"],def:m21},
  {path:["road","sign"],def:m22},
  {path:["road","sign"],def:m23},
  {path:["road","surface"],def:m24},
  {path:["road","surface"],def:m25},
  {path:["road","surface"],def:m26},
  {path:["road","surface"],def:m27},
  {path:["roadway","arterial"],def:m28},
  {path:["roadway","expressway"],def:m29},
  {path:["roadway","national"],def:m30},
  {path:["roadway","regional"],def:m31},
  {path:["signal","combined"],def:m32},
  {path:["signal","combined"],def:m33},
  {path:["signal","crossing"],def:m34},
  {path:["signal","crossing"],def:m35},
  {path:["signal","pedestrian"],def:m36},
  {path:["signal","pedestrian"],def:m37},
  {path:["signal","pedestrian"],def:m38},
  {path:["signal","pedestrian"],def:m39},
  {path:["signal","rail"],def:m40},
  {path:["signal","rail"],def:m41},
  {path:["signal","rail"],def:m42},
  {path:["signal","rail"],def:m43},
  {path:["signal","tram"],def:m44},
  {path:["signal","tram"],def:m45},
  {path:["signal","tram"],def:m46},
  {path:["signal","vehicle"],def:m47},
  {path:["signal","vehicle"],def:m48},
  {path:["signal","vehicle"],def:m49},
  {path:["signal","vehicle"],def:m50},
  {path:["signal","vehicle"],def:m51},
  {path:["signal","vehicle"],def:m52},
  {path:["signal","vehicle"],def:m53},
  {path:["signal","vehicle"],def:m54},
  {path:["track","railway"],def:m55},
  {path:["track","railway"],def:m56},
  {path:["track","tram"],def:m57},
];
