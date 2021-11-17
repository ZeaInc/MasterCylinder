import { LocatorItem } from './LocatorItem.js'
const {
  Ray,
  Vec3,
  Color,
  Xfo,
  Quat,
  EulerAngles,
  BooleanParameter,
  NumberParameter,
  ColorParameter,
  XfoParameter,
  OperatorInput,
  OperatorOutput,
  Operator,
  TreeItem,
  Material,
  LinesMaterial,
  BaseGroup,
  KinematicGroup,
  SelectionSet,
  Circle,
  GeomItem,
  Registry,
  RouterOperator,
  OperatorOutputMode,
} = window.zeaEngine

const socketMaterial = new LinesMaterial('LocatorMaterial')
socketMaterial.baseColorParam.value = new Color(1, 0, 0)
const circle = new Circle()

const PlugMode = {
  DISABLED: 0,
  UNCONNECTED: 1,
  PAIRED: 2,
  CONNECTED: 3,
}
class SocketItem extends TreeItem {
  constructor(name, display) {
    super(name)

    // we explicitly position the socket
    // this.getParameter("InitialXfoMode").setValue(Group.INITIAL_XFO_MODES.manual)

    this.connectedPlug = null
    this.connectedPlugMode = null
    this.dependentSockets = []
    this.SizeParam = new NumberParameter('Size', 0.2)
    this.RadiusParam = new NumberParameter('Radius', 0.05)
    this.SlideDistParam = new NumberParameter('SlideDist', 0.05)
    // Whther the item can be rotated in place and still fit.
    this.RadialConstraintParam = new NumberParameter('RadialConstraint', Math.PI * 2)
    this.AxialConstraintParam = new NumberParameter('AxialConstraint', Math.PI * 0.2)
    this.AxialFlipParam = new BooleanParameter('AxialFlip', true)

    this.addParameter(this.SizeParam)
    this.addParameter(this.RadiusParam)
    this.addParameter(this.SlideDistParam)
    this.addParameter(this.RadialConstraintParam)
    this.addParameter(this.AxialConstraintParam)
    this.addParameter(this.AxialFlipParam)
    if (display == true) {
      const startLocator = new LocatorItem('startLocator', 0.2, socketMaterial)
      const endLocator = new GeomItem('endLocator', circle, socketMaterial)
      const updateIcon = () => {
        startLocator.getParameter('Size').setValue(this.getParameter('Size').getValue())
        const endlocalXfoParam = endLocator.getParameter('LocalXfo')
        const endXfo = endlocalXfoParam.getValue()
        endXfo.tr.z = this.getParameter('SlideDist').getValue()
        endXfo.sc.set(this.getParameter('Radius').getValue())
        endlocalXfoParam.setValue(endXfo)
      }
      updateIcon()
      this.addChild(startLocator, false)
      this.addChild(endLocator, false)

      this.getParameter('Size').on('valueChanged', updateIcon)
      this.getParameter('Radius').on('valueChanged', updateIcon)
      this.getParameter('SlideDist').on('valueChanged', updateIcon)
    }

    // const globalXfoParam = this.getParameter("GlobalXfo")
    // const cleanGlobalXfo = (mode) => {
    //   return globalXfoParam.getValue();
    // }
    // globalXfoParam.on('valueChanged', mode => {
    //   if (mode == ValueSetMode.OPERATOR_DIRTIED) {
    //     if (this.connectedPlug && this.connectedPlugMode == PlugMode.CONNECTED) {
    //       const connectedPlugGlobalXfoParam = this.connectedPlug.getParameter("GlobalXfo")
    //       connectedPlugGlobalXfoParam.setDirty(cleanGlobalXfo)
    //     }
    //   }
    // })

    // this.plugged = new Signal()
  }

  addDependentSocket(dependentSocket) {
    this.dependentSockets.push(dependentSocket)
  }

  areDependentSocketsPlugged() {
    if (this.dependentSockets.length == 0) return true

    const result = this.dependentSockets.some((socket) => !socket.isConnected())
    return !result
  }

  setConnectedPlug(connectedPlug, plugMode) {
    this.connectedPlug = connectedPlug
    this.connectedPlugMode = plugMode

    if (this.connectedPlugMode == PlugMode.CONNECTED) {
      this.emit('plugged', {})
    }
  }

  isConnected() {
    return this.connectedPlugMode == PlugMode.CONNECTED
  }

  // bindItem(item, index) {
  //   super.bindItem(item, index)
  //   item.holdProxy = this;
  // }

  // unbindItem(item, index) {
  //   super.unbindItem(item, index)
  //   if (item.holdProxy == this)
  //     item.holdProxy = null;
  // }
}

class PlugOp extends Operator {
  constructor(name, plugItem, globalXfoParam) {
    super(name)

    this.plugItem = plugItem
    this.addInput(new OperatorInput('SocketGlobal'))
    this.addOutput(new OperatorOutput('GlobalXfo', OperatorOutputMode.OP_READ_WRITE)).setParam(globalXfoParam)
  }
  evaluate() {
    const output = this.getOutput('GlobalXfo')
    const xfo = output.getValue()
    if (this.plugItem.state != PlugMode.DISABLED) {
      const cleanXfo = this.plugItem.cleanGlobalXfo(xfo)
      output.setClean(cleanXfo)
    } else {
      output.setClean(xfo)
    }
  }
}
const plugMaterial = new LinesMaterial('LocatorMaterial')
plugMaterial.baseColorParam.value = new Color(0, 0, 1)

class PlugItem extends KinematicGroup {
  constructor(name, display) {
    super(name)

    // ///////////////////////////////////////////////////////
    // From SelectionSet
    this.highlightedParam = new BooleanParameter('Highlighted', false)
    this.highlightColorParam = new ColorParameter('HighlightColor', new Color(0.5, 0.5, 1))
    this.highlightFillParam = new NumberParameter('HighlightFill', 0.0, [0, 1])

    this.addParameter(this.highlightedParam)
    this.highlightedParam.on('valueChanged', () => {
      this.updateHighlight()
    })
    this.addParameter(this.highlightColorParam)
    this.highlightColorParam.on('valueChanged', (event) => {
      this.updateHighlight()
    })
    this.addParameter(this.highlightFillParam)
    this.highlightFillParam.on('valueChanged', () => {
      this.updateHighlight()
    })
    // ///////////////////////////////////////////////////////

    // we explicitly position the socket
    this.getParameter('InitialXfoMode').setValue(KinematicGroup.INITIAL_XFO_MODES.manual)

    this.sockets = []
    this.pairedSocket
    this.state = PlugMode.DISABLED

    const sizeParam = this.addParameter(new NumberParameter('Size', 0.2))
    const lengthParam = this.addParameter(new NumberParameter('Length', 0.05))

    if (display == true) {
      if (!circle) {
        circle = new Circle()
      }

      const startLocator = new LocatorItem('startLocator', 0.2, plugMaterial)
      const endLocator = new LocatorItem('endLocator', 0.2, plugMaterial)
      const updateIcon = () => {
        startLocator.getParameter('Size').setValue(this.getParameter('Size').getValue())
        endLocator.getParameter('Size').setValue(this.getParameter('Size').getValue())
        const endlocalXfoParam = endLocator.getParameter('LocalXfo')
        const endXfo = endlocalXfoParam.getValue()
        endXfo.tr.z = this.getParameter('Length').getValue()
        // endXfo.sc.set(this.getParameter("Radius").getValue())
        endlocalXfoParam.setValue(endXfo)
      }

      // const locator = new LocatorItem("locator", 0.2, plugMaterial)
      // this.addChild(locator, false)
      // const updateIcon = () => {
      //   locator.getParameter("Size").setValue(this.getParameter("Size").getValue());
      // }

      sizeParam.on('valueChanged', updateIcon)
      lengthParam.on('valueChanged', updateIcon)
      updateIcon()
      this.addChild(startLocator, false)
      this.addChild(endLocator, false)
    }

    const globalXfoParam = this.getParameter('GlobalXfo')
    let highlightDisplayId = 0
    const displayHighlight = (color, duration) => {
      this.getParameter('HighlightColor').setValue(color)
      this.getParameter('HighlightFill').setValue(color.a)
      this.getParameter('Highlighted').setValue(true)
      if (duration) {
        if (highlightDisplayId) clearTimeout(highlightDisplayId)
        highlightDisplayId = setTimeout(() => {
          this.getParameter('Highlighted').setValue(false)
        }, duration)
      }
    }
    this.cleanGlobalXfo = (xfo) => {
      if (this.state == PlugMode.CONNECTED) {
        // Once a plug has been connected, it can no longer be disonnected.
        return this.pairedSocket.getParameter('GlobalXfo').getValue()
        // const pairedSocketXfo = this.pairedSocket.getParameter("GlobalXfo").getValue()
        // globalXfoParam.setValue(pairedSocketXfo, ValueSetMode.OPERATOR_SETVALUE);
        // return;
      }

      let displayError = false
      const testSocket = (socket, paired = false) => {
        const socketXfo = socket.getParameter('GlobalXfo').getValue()
        const socketRadius = socket.getParameter('Radius').getValue()
        const socketSlideDist = socket.getParameter('SlideDist').getValue()
        let socketAxis = socketXfo.ori.getZaxis()
        const socketEndPoint = socketXfo.tr.add(socketAxis.scale(socketSlideDist))
        const plugOffset = xfo.tr.subtract(socketXfo.tr)
        const plugSlideDist = plugOffset.dot(socketAxis)
        const projectedPos = socketXfo.tr.add(socketAxis.scale(plugSlideDist))
        if (paired) {
          // Snap the plug into the axis of the socket
          if (plugSlideDist > socketSlideDist && projectedPos.distanceTo(socketEndPoint) > socketRadius) {
            return false
          }
          xfo.tr = projectedPos
        } else {
          const vecToSocketAxis = plugOffset.subtract(socketAxis.scale(plugSlideDist))
          const distToSocketAxis = vecToSocketAxis.length()
          const pushAwayDist = socketRadius * 4.0
          if (plugSlideDist > -socketRadius && plugSlideDist < socketSlideDist && distToSocketAxis < pushAwayDist) {
            // xfo.tr = projectedPos
            // xfo.tr.addInPlace(vecToSocketAxis.scale(pushAwayDist / distToSocketAxis));
            displayError = true
            return false
          }
          if (xfo.tr.distanceTo(socketEndPoint) > socketRadius) {
            return false
          }
          if (!socket.areDependentSocketsPlugged()) {
            displayError = true
            return false
          }
        }

        const axialConstraint = socket.getParameter('AxialConstraint').getValue()
        const axialFlip = socket.getParameter('AxialFlip').getValue()
        const plugAxis = xfo.ori.getZaxis()
        let axialOffset = socketAxis.angleTo(plugAxis)
        if (axialFlip && axialOffset > Math.PI * 0.5) {
          axialOffset -= Math.PI
          socketAxis = socketAxis.negate()
        }

        if (paired) {
          const align = new Quat()
          align.setFrom2Vectors(plugAxis, socketAxis)
          xfo.ori = align.multiply(xfo.ori)
        } else {
          if (axialOffset > axialConstraint) {
            displayError = true
            return false
          }
        }

        const radialConstraint = socket.getParameter('RadialConstraint').getValue()
        const radialOffset = socketXfo.ori.getXaxis().angleTo(xfo.ori.getXaxis())
        if (radialOffset > radialConstraint) {
          displayError = true
          return false
        }

        if (paired) {
          // Once the paired plug has been moved down the length of the socket.
          // and reached the base, we snap them together and consider them connected.
          if (plugSlideDist < socketRadius) {
            xfo.tr = socketXfo.tr
            xfo.ori = socketXfo.ori
            connectToSocket(socket)
            displayHighlight(new Color(0, 1, 0, 0.25), 1000)
          }
        }

        return true
      }

      //
      if (this.pairedSocket) {
        if (testSocket(this.pairedSocket, true)) {
          return xfo
        } else {
          this.getParameter('Highlighted').setValue(false)
          this.pairedSocket.setConnectedPlug(null, PlugMode.UNCONNECTED)
          this.pairedSocket = null
        }
      } else {
        const pairSocket = this.sockets.find((socket) => {
          return testSocket(socket)
        })
        if (displayError) {
          displayHighlight(new Color(0.75, 0, 0, 0.25), 200)
        } else if (pairSocket) {
          this.pairedSocket = pairSocket
          displayHighlight(new Color(0, 0.75, 0, 0.0))
          this.pairedSocket.setConnectedPlug(this, PlugMode.PAIRED)
        } else if (this.pairedSocket) {
          this.getParameter('Highlighted').setValue(false)
          this.pairedSocket.setConnectedPlug(null, PlugMode.UNCONNECTED)
          this.pairedSocket = null
        }
      }
      return xfo
    }
    const op = new PlugOp(this.getName(), this, globalXfoParam)
    //   evaluate: () => {
    //     if (this.state != PlugMode.DISABLED) {
    //       const xfo = globalXfoParam.getValue(ValueGetMode.OPERATOR_GETVALUE)
    //       const cleanXfo = cleanGlobalXfo(xfo)
    //       globalXfoParam.setValue(cleanXfo, ValueSetMode.OPERATOR_SETVALUE)
    //     }
    //   },
    //   connectInput: (param) => {
    //     param.on('valueChanged', (mode) => {
    //       if (mode == ValueSetMode.OPERATOR_DIRTIED) {
    //         globalXfoParam.setDirtyFromOp()
    //       }
    //     })
    //   },
    // }
    // globalXfoParam.bindOperator(op)

    const connectToSocket = (socket) => {
      this.state = PlugMode.CONNECTED
      socket.setConnectedPlug(this, PlugMode.CONNECTED)
      op.getInput('SocketGlobal').setParam(socket.getParameter('GlobalXfo'))
    }
  }

  addConnectableSocket(socket) {
    this.sockets.push(socket)
  }

  /**
   * Causes an event to occur when the mouse pointer is moved onto an element.
   * @param {PointerEvent} event - The mouse event that occurs.
   */
  onPointerEnter(event) {
    super.onPointerEnter(event)

    const color = new Color(0.25, 0.85, 1, 0.0)
    this.getParameter('HighlightColor').setValue(color)
    this.getParameter('HighlightFill').setValue(color.a)
    this.getParameter('Highlighted').setValue(true)
  }

  /**
   * Causes an event to occur when the mouse pointer is moved out of an element.
   * @param {PointerEvent} event - The mouse event that occurs.
   */
  onPointerLeave(event) {
    super.onPointerLeave(event)
    this.getParameter('Highlighted').setValue(false)
  }

  bindItem(item, index) {
    super.bindItem(item, index)
    item.holdProxy = this
  }

  unbindItem(item, index) {
    super.unbindItem(item, index)
    if (item.holdProxy == this) item.holdProxy = null
  }

  // ///////////////////////////////////////////////////////
  // From SelectionSet
  /**
   * The updateHighlight method.
   * @private
   */
  updateHighlight() {
    let highlighted = false
    let color
    if (this.highlightedParam.value || this.isSelected()) {
      highlighted = true
      color = this.highlightColorParam.value
      color.a = this.highlightFillParam.value
    }

    const key = 'groupItemHighlight' + this.getId()
    Array.from(this.itemsParam.value).forEach((item) => {
      if (item instanceof TreeItem) {
        if (highlighted) item.addHighlight(key, color, true)
        else item.removeHighlight(key, true)
      }
    })
  }
}

export { SocketItem, PlugItem, PlugMode }
