const { Vec3, Quat, Xfo, EulerAngles, Group, Material, Color } = window.zeaEngine
const { GLCADPass, CADAsset } = window.zeaCad

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
  asset.getParameter('DataFilePath').setValue('data/servo_mestre-visu.zcad')

  // return asset

  // https://www.quadratec.com/p/mopar/brake-master-cylinder-booster-jk-dana-60-axle-P5160050
  // https://righttorisesuperpac.org/symptoms-of-a-bad-brake-booster/

  const blackPlasticGroup = new Group('blackPlasticGroup')
  {
    const material = new Material('blackPlastic')
    material.modifyParams(
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

  const blackRubberGroup = new Group('blackRubberGroup')
  {
    const material = new Material('blackRubber')
    material.modifyParams(
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

  const whitePlasticGroup = new Group('whitePlasticGroup')
  {
    const material = new Material('whitePlastic')
    material.modifyParams(
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

  const yellowPlasticGroup = new Group('yellowPlasticGroup')
  {
    const material = new Material('yellowPlastic')
    material.modifyParams(
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

  const shinyMetalGroup = new Group('shinyMetalGroup')
  {
    const material = new Material('shinyMetal')
    material.modifyParams(
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

  const darkGreyMetalGroup = new Group('darkGreyMetalGroup')
  {
    const material = new Material('darkGreyMetal')
    material.modifyParams(
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

  const blackMetalGroup = new Group('blackMetalGroup')
  {
    const material = new Material('blackMetal')
    material.modifyParams(
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

  asset.on('loaded', () => {
    const logTreeItem = (treeItem, depth) => {
      console.log(' '.repeat(depth * 2) + '|-' + treeItem.getName())
      for (let i = 0; i < treeItem.getNumChildren(); i++) {
        logTreeItem(treeItem.getChild(i), depth + 1)
      }
    }
    logTreeItem(asset, 0)
    /*
    blackPlasticGroup.resolveItems([
      ['.', 'SJ Cilindro MESTRE', 'tampa_tanque'],
      ['.', 'tubo_vacuo'],
    ])

    blackRubberGroup.resolveItems([
      ['.', 'SJ Cilindro MESTRE', 'gaxeta'],
      ['.', 'SJ Cilindro MESTRE', 'gaxeta_010'],
      ['.', 'SJ Cilindro MESTRE', 'gaxeta_013'],
      ['.', 'SJ Cilindro MESTRE', 'Bucha_tanque'], // Rubber seals to top reservoir
      ['.', 'SJ Cilindro MESTRE', 'Bucha_tanque_003'], // Rubber seals to top reservoir
      ['.', 'SJ Cilindro MESTRE', 'anel_borracha'],
      ['.', 'filtro_ar'],
      ['.', 'SJ Cilindro MESTRE', 'Anel Trava'], // Booster seal
      ['.', 'bucha_vacuo'], // Booster seal
    ])

    whitePlasticGroup.resolveItems([['.', 'SJ Cilindro MESTRE', 'tanque_fluido']])

    yellowPlasticGroup.resolveItems([
      ['.', 'SJ Cilindro MESTRE', 'bucha_freio_005'],
      ['.', 'SJ Cilindro MESTRE', 'bucha_freio_006'],
      ['.', 'SJ Cilindro MESTRE', 'bucha_freio_007'],
      ['.', 'SJ Cilindro MESTRE', 'bucha_freio'],
    ])

    shinyMetalGroup.resolveItems([
      ['.', 'mola12'], //  Big spring
      ['.', 'SJ Cilindro MESTRE', 'mola2'], //  Big spring
      ['.', 'SJ Cilindro MESTRE', 'mola1'],
      ['.', 'disco_dinamico'], // Booster ram.
      ['.', 'Pedal_de freio'], // Brake pedal

      ['.', 'paraf_m6'],
      ['.', 'SJ Cilindro MESTRE', 'porca_m6'],
      ['.', 'Part1'],
      ['.', 'SJ Cilindro MESTRE', 'porca_m6_022'],
      ['.', 'mola11'],
    ])

    darkGreyMetalGroup.resolveItems([
      ['.', 'SJ Cilindro MESTRE', 'cilindro_mestre'],
      ['.', 'prato'],
      ['.', 'Part1'],
      ['.', 'paraf_m6_014'],
      ['.', 'bucha_vedada'],
      ['.', 'Symmetry of Part1'],
      ['.', 'Symmetry of Part1_018'],
      ['.', 'Symmetry of Symmetry of Part1'],
      ['.', 'SJ Cilindro MESTRE', 'cilind'],
      ['.', 'SJ Cilindro MESTRE', 'Cilindro2'],
      ['.', 'haste_acionamento'],
      ['.', 'haste_vacuo'],
      ['.', 'SJ Cilindro MESTRE', 'Vedante'],
      ['.', 'SJ Cilindro MESTRE', 'bucha_guia'],
    ])

    blackMetalGroup.resolveItems([
      ['.', 'bacia_1'],
      ['.', 'bacia_2'],
    ])
    */
  })

  return asset
}

export default loadAsset
