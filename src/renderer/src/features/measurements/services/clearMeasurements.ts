// TODO: utilizar React Context ou lançamento de evento para evitar reload da página
export async function clearMeasurements() {
  await window.api.measurements.deleteAll()
  window.location.reload()
}
