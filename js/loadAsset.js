const { Vec3, Quat, Xfo, EulerAngles, MaterialGroup, Material, Color } = window.zeaEngine
const { CADAsset } = window.zeaCad

import { resolveItems } from './resolveItems.js'

const modifyParams = (material, params, shaderName) => {
  material.setShaderName(shaderName)
  for (let key in params) {
    const param = material.getParameter(key)
    param.value = params[key]
  }
}

function loadAsset() {
  const asset = new CADAsset()
  const xfo = new Xfo()
  xfo.ori.setFromEulerAngles(new EulerAngles(0.0, Math.PI * -0.5, 0, 'ZXY'))
  // xfo.sc.set(0.0254 * 0.5);
  // const materialLibrary = asset.getMaterialLibrary();
  // materialLibrary.setMaterialTypeMapping({
  //     '*': 'SimpleSurfaceShader'
  // });
  asset.getParameter('GlobalXfo').setValue(xfo)
  // asset.getParameter('DataFilePath').setValue('data/servo_mestre.zcad')

  // return asset

  // https://www.quadratec.com/p/mopar/brake-master-cylinder-booster-jk-dana-60-axle-P5160050
  // https://righttorisesuperpac.org/symptoms-of-a-bad-brake-booster/

  const blackPlasticGroup = new MaterialGroup('blackPlasticGroup')
  {
    const material = new Material('blackPlastic')
    modifyParams(
      material,
      {
        BaseColor: new Color(0.01, 0.01, 0.01),
        Metallic: 0.0,
        Roughness: 0.45,
        Reflectance: 0.03,
      },
      'StandardSurfaceShader'
    )
    blackPlasticGroup.getParameter('Material').setValue(material)
    asset.addChild(blackPlasticGroup)
  }

  const blackRubberGroup = new MaterialGroup('blackRubberGroup')
  {
    const material = new Material('blackRubber')
    modifyParams(
      material,
      {
        BaseColor: new Color(0.01, 0.01, 0.01),
        Metallic: 0.0,
        Roughness: 0.85,
        Reflectance: 0.01,
      },
      'StandardSurfaceShader'
    )
    blackRubberGroup.getParameter('Material').setValue(material)
    asset.addChild(blackRubberGroup)
  }

  const whitePlasticGroup = new MaterialGroup('whitePlasticGroup')
  {
    const material = new Material('whitePlastic')
    modifyParams(
      material,
      {
        BaseColor: new Color(0.98, 0.98, 0.88),
        Metallic: 0.0,
        Roughness: 0.25,
        Reflectance: 0.03,
      },
      'StandardSurfaceShader'
    )
    whitePlasticGroup.getParameter('Material').setValue(material)
    asset.addChild(whitePlasticGroup)
  }

  const yellowPlasticGroup = new MaterialGroup('yellowPlasticGroup')
  {
    const material = new Material('yellowPlastic')
    modifyParams(
      material,
      {
        BaseColor: new Color('#F0E68C'),
        Metallic: 0.0,
        Roughness: 0.85,
        Reflectance: 0.0,
      },
      'StandardSurfaceShader'
    )
    yellowPlasticGroup.getParameter('Material').setValue(material)
    asset.addChild(yellowPlasticGroup)
  }

  const shinyMetalGroup = new MaterialGroup('shinyMetalGroup')
  {
    const material = new Material('shinyMetal')
    modifyParams(
      material,
      {
        BaseColor: new Color(0.65, 0.65, 0.65),
        Metallic: 0.75,
        Roughness: 0.25,
        Reflectance: 0.85,
      },
      'StandardSurfaceShader'
    )
    shinyMetalGroup.getParameter('Material').setValue(material)
    asset.addChild(shinyMetalGroup)
  }

  const darkGreyMetalGroup = new MaterialGroup('darkGreyMetalGroup')
  {
    const material = new Material('darkGreyMetal')
    modifyParams(
      material,
      {
        BaseColor: new Color(0.45, 0.45, 0.45),
        Metallic: 0.65,
        Roughness: 0.75,
        Reflectance: 0.7,
      },
      'StandardSurfaceShader'
    )
    darkGreyMetalGroup.getParameter('Material').setValue(material)
    asset.addChild(darkGreyMetalGroup)
  }

  const blackMetalGroup = new MaterialGroup('blackMetalGroup')
  {
    const material = new Material('blackMetal')
    modifyParams(
      material,
      {
        BaseColor: new Color(0.0, 0.0, 0.0),
        Metallic: 0.65,
        Roughness: 0.35,
        Reflectance: 0.7,
      },
      'StandardSurfaceShader'
    )
    blackMetalGroup.getParameter('Material').setValue(material)
    asset.addChild(blackMetalGroup)
  }

  asset.load('data/servo_mestre-visu.zcad').then(() => {
    const edgeMaterial = asset.getMaterialLibrary().getMaterial('Edge')
    edgeMaterial.getParameter('Overlay').setValue(0.0001)
    // const logTreeItem = (treeItem, depth) => {
    //   console.log(' '.repeat(depth * 2) + '|-' + treeItem.getName())
    //   for (let i = 0; i < treeItem.getNumChildren(); i++) {
    //     logTreeItem(treeItem.getChild(i), depth + 1)
    //   }
    // }
    // logTreeItem(asset, 0)

    resolveItems(asset, blackPlasticGroup, [
      ['.', 'SJ Cilindro MESTRE', 'Part1.13'],
      ['.', 'tubo_vacuo.1'],
    ])

    resolveItems(asset, blackRubberGroup, [
      ['.', 'SJ Cilindro MESTRE', 'primaria2'], // Floating Ram end seal
      ['.', 'SJ Cilindro MESTRE', 'secundaria'], // Floating Ram end seal
      ['.', 'SJ Cilindro MESTRE', 'secundaria.1'], // Ram end Seal
      ['.', 'SJ Cilindro MESTRE', 'primario'], // Rubber seals to top reservoir
      ['.', 'SJ Cilindro MESTRE', 'secundario'], // Rubber seals to top reservoir
      ['.', 'SJ Cilindro MESTRE', 'Part1.11'],
      ['.', 'filtro_ar'],
      ['.', 'SJ Cilindro MESTRE', 'Anel Trava'], // Booster seal
      ['.', 'bucha_vacuo.1'], // Booster seal
    ])

    resolveItems(asset, whitePlasticGroup, [['.', 'SJ Cilindro MESTRE', 'tanque_fluido.1']])

    resolveItems(asset, yellowPlasticGroup, [
      ['.', 'SJ Cilindro MESTRE', '1.1'],
      ['.', 'SJ Cilindro MESTRE', '1.2'],
      ['.', 'SJ Cilindro MESTRE', '1.3'],
      ['.', 'SJ Cilindro MESTRE', '1'],
    ])

    resolveItems(asset, shinyMetalGroup, [
      ['.', 'mola12.1'], //  Big spring
      ['.', 'SJ Cilindro MESTRE', 'mola2.1'], //  Big spring
      ['.', 'SJ Cilindro MESTRE', 'mola1.1'],
      ['.', 'disco_dinamico'], // Booster ram.
      ['.', 'Pedal_de freio.1'], // Brake pedal
      ['.', 'bucha_vedada'], // Push Plate end of booster rod

      ['.', 'SJ Cilindro MESTRE', 'secundaria1'],
      ['.', 'SJ Cilindro MESTRE', 'porca_m6.1'],
      ['.', 'SJ Cilindro MESTRE', 'porca_m6'],
      ['.', 'mola11.1'],
    ])

    resolveItems(asset, darkGreyMetalGroup, [
      ['.', 'SJ Cilindro MESTRE', 'cilindro_mestre.1'],
      ['.', 'prato.1'],
      ['.', 'Part1.8'],
      ['.', 'Part1.1'], // Bolts back
      ['.', 'Part1.6'], // Bolts back
      ['.', 'Symmetry of Part1.8.1'],
      ['.', 'Symmetry of Part1.8.2'],
      ['.', 'Symmetry of Symmetry of Part1.8.1.1'],
      ['.', 'SJ Cilindro MESTRE', 'primario1'],
      ['.', 'SJ Cilindro MESTRE', 'Secundario'],
      ['.', 'haste_acionamento'],
      ['.', 'haste_vacuo'],
      ['.', 'SJ Cilindro MESTRE', 'Part1.9'],
    ])

    resolveItems(asset, blackMetalGroup, [
      ['.', 'bacia_1.1'],
      ['.', 'bacia_2.1'],
    ])
  })

  return asset
}

export default loadAsset
