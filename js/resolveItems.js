const resolveItems = (asset, group, paths) => {
  paths.forEach((path) => {
    const item = asset.resolvePath(path)
    group.addItem(item)
  })
}

export { resolveItems }
