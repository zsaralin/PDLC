export let imgRatio = 32/28
export let imgRow = 28;
export let imgCol = 32;

export function setNumCol(i){
    imgCol = i;
    imgRatio = i/imgRow
}