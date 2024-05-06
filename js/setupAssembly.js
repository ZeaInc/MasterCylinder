﻿import { SocketItem, PlugItem, PlugMode } from './SocketAndPlug.js'
const { Vec3, Color, Xfo, KinematicGroup, CuttingPlane, SelectionSet } = window.zeaEngine
const { PlanarMovementHandle } = window.zeaUx
import { resolveItems } from './resolveItems.js'

const displayDebug = true
function setupPlugAndSocket(
  asset,
  name,
  xfo,
  radius,
  slideDist,
  plugLength,
  radialConstraint,
  geomItem,
  appData,
  dependentSockets,
  parent
) {
  const socket = new SocketItem(name, displayDebug)
  socket.globalXfoParam.value = xfo
  socket.getParameter('Size').value = radius * 5
  socket.getParameter('Radius').value = radius
  socket.getParameter('SlideDist').value = slideDist
  if (plugLength > 0.0) socket.getParameter('AxialFlip').value = true

  if (radialConstraint) socket.getParameter('RadialConstraint').value = radialConstraint

  if (dependentSockets) {
    dependentSockets.forEach((dependentSocket) => {
      socket.addDependentSocket(dependentSocket)
    })
  }

  if (parent) parent.addChild(socket)
  else asset.addChild(socket)

  const plug = new PlugItem(name + 'Plug', displayDebug)
  plug.getParameter('Size').value = radius * 5
  plug.getParameter('Length').value = plugLength
  const plugXfo = xfo.clone()
  plug.globalXfoParam.value = plugXfo
  if (geomItem) plug.addItem(geomItem)
  plug.sockets.push(socket)
  // asset.addChild(plug);

  const dir = new Vec3(1, 0, 0)
  const up = new Vec3(0, 0, 1)
  const handle = new PlanarMovementHandle()
  const handleXfo = xfo.clone()
  handleXfo.ori.setFromDirectionAndUpvector(dir, up)
  handle.getParameter('LocalXfo').value = handleXfo
  handle.addChild(plug, true)

  // const handle = new ScreenSpaceMovementHandle();
  // handle.setGlobalXfo(plug.getGlobalXfo())
  // handle.addChild(plug, true);
  // handle.setTargetParam(plug.getParameter("GlobalXfo"), false)

  asset.addChild(handle)

  return { socket, plug }
}

function setupAssembly(scene, asset, renderer, appData) {
  // renderer.getViewport().getCamera().on('globalXfoChanged', ()=>{
  //   const xfo = renderer.getViewport().getCamera().getGlobalXfo()
  //   const target = renderer.getViewport().getCamera().getTargetPostion()
  //   console.log(xfo.toString(), target.toString())
  // })
  const position = new Vec3(0.91666, -0.05792, 0.12469)
  const target = new Vec3(0.02931, -0.12152, 0.04089)
  renderer.getViewport().getCamera().setPositionAndTarget(position, target)

  const boosterAndPedalGroup = new SelectionSet('boosterAndPedalGroup')
  // boosterAndPedalGroup.getParameter('Highlighted').value = true)
  boosterAndPedalGroup.getParameter('Visible').value = false
  asset.addChild(boosterAndPedalGroup)

  // asset.on('loaded', () => {

  resolveItems(asset, boosterAndPedalGroup, [
    ['.', 'bacia_1.1'],
    ['.', 'bacia_2.1'],
    ['.', 'disco_dinamico'],
    ['.', 'Part1.1'],
    ['.', 'Part1.6'],
    ['.', 'Part1.8'],
    ['.', 'Symmetry of Part1.8.1'],
    ['.', 'Symmetry of Part1.8.2'],
    ['.', 'Symmetry of Symmetry of Part1.8.1.1'],
    ['.', 'haste_acionamento'],
    ['.', 'Pedal_de freio.1'],
    ['.', 'mola11.1'],
    ['.', 'mola12.1'],
    ['.', 'filtro_ar'],
    ['.', 'bucha_vacuo.1'],
    ['.', 'tubo_vacuo.1'],
    ['.', 'haste_vacuo'],
    ['.', 'bucha_vedada'], // Push Plate end of booster rod
    ['.', 'prato.1'],
    ['.', 'SJ Cilindro MESTRE', 'porca_m6.1'],
    ['.', 'SJ Cilindro MESTRE', 'porca_m6'],
    ['.', 'SJ Cilindro MESTRE', 'Part1.11'],
    // ['.', 'paraf_m6.1'],
    // ['.', 'SJ Cilindro MESTRE', 'Part1.13'],
    // ['.', 'SJ Cilindro MESTRE', 'tanque_fluido.1'],
  ])

  // })

  // const applyCutaway = false
  // if (applyCutaway) {
  const cutAwayGroup = new CuttingPlane('cutAwayGroup')
  // cutAwayGroup.cutPlaneParam.value = new Vec3(1, 0, 0, -0.2)
  const xfo = new Xfo()
  xfo.ori.setFromAxisAndAngle(new Vec3(0, 1, 0), Math.PI * 0.5)
  cutAwayGroup.localXfoParam.value = xfo
  asset.addChild(cutAwayGroup)

  resolveItems(asset, cutAwayGroup, [
    // ['.', 'bacia_1.1'],
    // ['.', 'bacia_2.1'],
    ['.', 'SJ Cilindro MESTRE', 'cilindro_mestre.1'],
    ['.', 'SJ Cilindro MESTRE', 'tanque_fluido.1'],
    ['.', 'SJ Cilindro MESTRE', 'Part1.13'],
    ['.', 'SJ Cilindro MESTRE', '1'],
    ['.', 'SJ Cilindro MESTRE', '1.2'],
    // ['.', 'disco_dinamico'],
    // ['.', 'Part1.8'],
    // ['.', 'Symmetry of Part1.8.2'],
  ])

  cutAwayGroup.cutAwayEnabledParam.value = false
  // asset.getParameter('CutPlaneDist').value = 0.0
  // }

  const plugs = {}
  {
    let masterCylinderGroup
    {
      masterCylinderGroup = new KinematicGroup('masterCylinderGroup')
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'cilindro_mestre.1'])
      masterCylinderGroup.addItem(item)
      masterCylinderGroup.addItem(asset.resolvePath(['SJ Cilindro MESTRE', '1.1']))
      masterCylinderGroup.addItem(asset.resolvePath(['SJ Cilindro MESTRE', '1.2']))
      masterCylinderGroup.addItem(asset.resolvePath(['SJ Cilindro MESTRE', '1.3']))
      masterCylinderGroup.addItem(asset.resolvePath(['SJ Cilindro MESTRE', '1']))
      const dir = new Vec3(1, 0, 0)
      const up = new Vec3(0, 0, 1)
      const handle = new PlanarMovementHandle()
      const handleXfo = new Xfo()
      handleXfo.tr = item.globalXfoParam.value.tr
      handleXfo.ori.setFromDirectionAndUpvector(dir, up)
      handle.getParameter('LocalXfo').value = handleXfo
      handle.addChild(masterCylinderGroup, true)

      asset.addChild(handle)

      plugs.masterCylinder = { plug: handle }
    }
    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 0, 1), new Vec3(1, 0, 0))
      xfo.tr.set(0.0, -0.231, 0.015)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'primario'])
      const data = setupPlugAndSocket(
        asset,
        'fluidReservoirPlug1',
        xfo,
        0.007,
        0.015,
        0,
        Math.PI * 2,
        item,
        appData,
        [],
        masterCylinderGroup
      )
      plugs.fluidReservoirPlug1 = data
    }
    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 0, 1), new Vec3(1, 0, 0))
      xfo.tr.set(0.0, -0.141, 0.015)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'secundario'])
      const data = setupPlugAndSocket(
        asset,
        'fluidReservoirPlug2',
        xfo,
        0.007,
        0.015,
        0,
        Math.PI * 2,
        item,
        appData,
        [],
        masterCylinderGroup
      )
      plugs.fluidReservoirPlug2 = data
    }
    plugs.fluidReservoirPlug1.plug.addConnectableSocket(plugs.fluidReservoirPlug2.socket)
    plugs.fluidReservoirPlug2.plug.addConnectableSocket(plugs.fluidReservoirPlug1.socket)

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 0, 1), new Vec3(1, 0, 0))
      xfo.tr.set(0.0, -0.2, 0.02)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'tanque_fluido.1'])
      const data = setupPlugAndSocket(
        asset,
        'fluidReservoir',
        xfo,
        0.007,
        0.01,
        0,
        0,
        item,
        appData,
        [plugs.fluidReservoirPlug1.socket, plugs.fluidReservoirPlug2.socket],
        masterCylinderGroup
      )
      plugs.fluidReservoir = data
    }

    {
      const xfo = new Xfo()
      const dir = new Vec3(0, -0.25, 1)
      dir.normalizeInPlace()
      xfo.ori.setFromDirectionAndUpvector(dir, new Vec3(1, 0, 0))
      xfo.tr.set(0.0, -0.157, 0.08)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'Part1.13'])
      const data = setupPlugAndSocket(
        asset,
        'fluidReservoirCap',
        xfo,
        0.007,
        0.005,
        0,
        Math.PI * 2,
        item,
        appData,
        [],
        plugs.fluidReservoir.plug
      )
      plugs.fluidReservoirCap = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.288, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'mola1.1'])
      const data = setupPlugAndSocket(
        asset,
        'secondaryPistonSocket',
        xfo,
        0.007,
        0.175,
        0.055,
        Math.PI * 2,
        item,
        appData,
        [],
        masterCylinderGroup
      )
      plugs.secondarySpring = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.2325, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'primario1'])
      const data = setupPlugAndSocket(
        asset,
        'secondaryPistonSocket',
        xfo,
        0.007,
        0.12,
        0.0,
        Math.PI * 2,
        item,
        appData,
        [plugs.secondarySpring.socket],
        masterCylinderGroup
      )
      plugs.secondaryPistonSocket = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, -1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.229, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'primaria2'])
      const data = setupPlugAndSocket(
        asset,
        'secondaryPistonEndSeal',
        xfo,
        0.007,
        0.025,
        0.0035,
        Math.PI * 2,
        item,
        appData,
        [],
        plugs.secondaryPistonSocket.plug
      )
      plugs.secondaryPistonEndSeal = data

      plugs.secondaryPistonSocket.socket.addDependentSocket(data.socket)
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.195, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'secundaria'])
      const data = setupPlugAndSocket(
        asset,
        'secondaryPistonRamSeal',
        xfo,
        0.007,
        0.085,
        0.0035,
        Math.PI * 2,
        item,
        appData,
        [plugs.secondaryPistonSocket.socket],
        masterCylinderGroup
      )
      plugs.secondaryPistonRamSeal = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.19, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'secundaria1'])
      const data = setupPlugAndSocket(
        asset,
        'secondaryPistonStartRamSocket',
        xfo,
        0.007,
        0.085,
        0,
        Math.PI * 2,
        item,
        appData,
        [plugs.secondaryPistonRamSeal.socket],
        masterCylinderGroup
      )
      plugs.secondaryPistonStartRamSocket = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.188, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'mola2.1'])
      const data = setupPlugAndSocket(
        asset,
        'primarySpringSocket',
        xfo,
        0.007,
        0.077,
        0.045,
        Math.PI * 2,
        item,
        appData,
        [plugs.secondaryPistonStartRamSocket.socket],
        masterCylinderGroup
      )
      plugs.primarySpringSocket = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.14, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'Secundario'])
      const data = setupPlugAndSocket(
        asset,
        'primaryPiston',
        xfo,
        0.007,
        0.03,
        0,
        Math.PI * 2,
        item,
        appData,
        [plugs.primarySpringSocket.socket],
        masterCylinderGroup
      )
      plugs.primaryPiston = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, -1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.139, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'secundaria.1'])
      const data = setupPlugAndSocket(
        asset,
        'primaryPistonEndSeal',
        xfo,
        0.007,
        0.01,
        0.004,
        Math.PI * 2,
        item,
        appData,
        [],
        plugs.primaryPiston.plug
      )
      plugs.primaryPistonEndSeal = data

      plugs.primaryPiston.socket.addDependentSocket(data.socket)
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.118, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'Part1.9'])
      const data = setupPlugAndSocket(
        asset,
        'primaryPistonStartSeal',
        xfo,
        0.007,
        0.06,
        0.004,
        Math.PI * 2,
        item,
        appData,
        [],
        plugs.primaryPiston.plug
      )

      plugs.primaryPistonStartSeal = data
    }

    {
      const xfo = new Xfo()
      xfo.ori.setFromDirectionAndUpvector(new Vec3(0, 1, 0), new Vec3(0, 0, 1))
      xfo.tr.set(0.0, -0.114, 0.0)
      const item = asset.resolvePath(['SJ Cilindro MESTRE', 'Anel Trava'])
      const data = setupPlugAndSocket(
        asset,
        'clipSocket',
        xfo,
        0.007,
        0.055,
        0.002,
        Math.PI * 2,
        item,
        appData,
        [plugs.primaryPiston.socket, plugs.primaryPistonStartSeal.socket],
        masterCylinderGroup
      )

      plugs.clipSocket = data
    }

    plugs.secondaryPistonRamSeal.plug.addConnectableSocket(plugs.secondaryPistonEndSeal.socket)
    plugs.secondaryPistonRamSeal.plug.addConnectableSocket(plugs.primaryPistonEndSeal.socket)
    // plugs.secondaryPistonRamSeal.plug.addConnectableSocket(plugs.primaryPistonStartSeal.socket)

    plugs.secondaryPistonEndSeal.plug.addConnectableSocket(plugs.secondaryPistonRamSeal.socket)
    plugs.secondaryPistonEndSeal.plug.addConnectableSocket(plugs.primaryPistonEndSeal.socket)
    // plugs.secondaryPistonEndSeal.plug.addConnectableSocket(plugs.primaryPistonStartSeal.socket)

    plugs.primaryPistonEndSeal.plug.addConnectableSocket(plugs.secondaryPistonRamSeal.socket)
    plugs.primaryPistonEndSeal.plug.addConnectableSocket(plugs.secondaryPistonEndSeal.socket)
    plugs.primaryPistonEndSeal.plug.addConnectableSocket(plugs.primaryPistonStartSeal.socket)

    // plugs.primaryPistonStartSeal.plug.addConnectableSocket(plugs.secondaryPistonEndSeal.socket)
    // plugs.primaryPistonStartSeal.plug.addConnectableSocket(plugs.secondaryPistonRamSeal.socket)
    // plugs.primaryPistonStartSeal.plug.addConnectableSocket(plugs.primaryPistonEndSeal.socket)

    let plugsPositions = [
      new Vec3(0.0, -0.2, 0.2),
      new Vec3(0.0, -0.2, 0.1),
      new Vec3(0.0, -0.2, 0.0),
      new Vec3(0.0, -0.2, -0.1),
      new Vec3(0.0, 0.0, 0.2),
      new Vec3(0.0, 0.0, 0.1),
      new Vec3(0.0, 0.0, 0.0),
      new Vec3(0.0, 0.0, -0.1),
      new Vec3(0.0, -0.1, 0.2),
      new Vec3(0.0, -0.1, 0.1),
      new Vec3(0.0, -0.1, 0.0),
      new Vec3(0.0, -0.1, -0.1),
      new Vec3(0.0, 0.1, 0.2),
      new Vec3(0.0, 0.1, 0.1),
      new Vec3(0.0, 0.1, 0.0),
      new Vec3(0.0, 0.1, -0.1),
    ]
    const hilightAllPlugs = (duration) => {
      const color = new Color(0, 1, 0, 0.25)
      for (let key in plugs) {
        const p = plugs[key].plug
        if (p instanceof PlugItem) {
          p.getParameter('HighlightColor').value = color
          p.getParameter('HighlightFill').value = color.a
          p.getParameter('Highlighted').value = true
        }
      }
      if (duration) {
        setTimeout(() => {
          for (let key in plugs) {
            const p = plugs[key].plug
            if (p instanceof PlugItem) {
              p.getParameter('Highlighted').value = false
            }
          }
        }, duration)
      }
    }
    // hilightAllPlugs(1000);
    const applyCutaway = (delay) => {
      cutAwayGroup.cutAwayEnabledParam.value = true
      // const cutDist = cutAwayGroup.getParameter('CutPlaneDist')
      // let cutAmount = -0.2
      // cutDist.value = cutAmount
      // const timerCallback = () => {
      //   cutAmount += 0.002
      //   cutDist.value = cutAmount
      //   if (cutAmount < 0.0) {
      //     setTimeout(timerCallback, 20) // Sample at 50fps.
      //   }
      // }
      // setTimeout(timerCallback, delay) // half second delay
    }
    let index = 0
    let plugCout = 0
    for (let key in plugs) {
      const p = plugs[key].plug
      // const plugXfo = p.globalXfoParam.value
      // plugXfo.tr = plugsPositions[index]
      // plugXfo.tr.y *= 2
      // p.globalXfoParam.value = plugXfo
      if (p instanceof PlugItem) {
        p.state = PlugMode.UNCONNECTED
        plugs[key].socket.on('plugged', () => {
          plugCout--
          if (plugCout == 0) {
            hilightAllPlugs(1000)
            applyCutaway(500)
          }
        })
        plugCout++
      }
      index++
    }
  }
}

export default setupAssembly
