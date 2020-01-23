/*
UUID creation and validation utility
*/
const uuid_creation = [
  'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx', // v1
  'xxxxxxxx-xxxx-2xxx-yxxx-xxxxxxxxxxxx',  // v2
  'xxxxxxxx-xxxx-3xxx-yxxx-xxxxxxxxxxxx',  // v3
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',  // v4
  'xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx'  // v5
]

const uuid_validation = [
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i, // v1
  /^[a-f0-9]{8}-[a-f0-9]{4}-[2][0-9A-F]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i, // v2
  /^[a-f0-9]{8}-[a-f0-9]{4}-[3][0-9A-F]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i, // v3
  /^[a-f0-9]{8}-[a-f0-9]{4}-[4][0-9A-F]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i, // v4
  /^[a-f0-9]{8}-[a-f0-9]{4}-[5][0-9A-F]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i, // v5
]

// Generate UUIDs
const generateUUID = (v=4) => {
  let d = new Date().getTime()
  return uuid_creation[v].replace(/[xy]/g, function(c) {
    let r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
  })
}
// export const generateUUID1 = () => generateUUID(1)
// export const generateUUID2 = () => generateUUID(2)
// export const generateUUID3 = () => generateUUID(3)
export const generateUUID4 = () => generateUUID(4)
// export const generateUUID5 = () => generateUUID(5)

// Validate UUIDs
const validateUUID = (uuid='', v=4) => uuid.match(uuid_validation[v])
// export const validateUUID1 = (uuid='') => validateUUID(uuid, 1)
// export const validateUUID2 = (uuid='') => validateUUID(uuid, 2)
// export const validateUUID3 = (uuid='') => validateUUID(uuid, 3)
export const validateUUID4 = (uuid='') => validateUUID(uuid, 4)
// export const validateUUID5 = (uuid='') => validateUUID(uuid, 5)
