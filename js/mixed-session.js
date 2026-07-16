export function mixedCounts(length,panelPercent){
  const panels=Math.round(Number(length)*Number(panelPercent)/100);
  return {panels,infractions:Number(length)-panels};
}
