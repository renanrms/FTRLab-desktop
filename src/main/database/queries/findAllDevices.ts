import { DeviceModel, SensorModel, MeasurementModel } from '../models'

export async function findAllDevices() {
  const devices = (await DeviceModel.findAll({ include: SensorModel }))
    .map((deviceM: any) => deviceM.dataValues)
    .map((device: any) => ({
      ...device,
      sensors: device.sensors.map((sensor: any) => sensor.dataValues),
    }))

  for (const d of devices) {
    for (const s of d.sensors) {
      s.hasMeasurement =
        (await MeasurementModel.findOne({
          where: {
            sensorId: [s.id],
          },
          attributes: ['sensorId'],
          group: ['sensorId'],
          raw: true,
        })) !== null
    }
  }

  return devices
}
