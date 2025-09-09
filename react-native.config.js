// react-native.config.js in the library root
module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: "android",
        libraryName: "DndStatus",
        packageImportPath: "import com.dndstatus.DndStatusPackage;",
        packageInstance: "new DndStatusPackage()",
      },
      ios: null,
    },
  },
}
