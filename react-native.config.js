// react-native.config.js in the library root
module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: "android",
        libraryName: "DndStatus",
        javaPackageName: "com.dndstatus",
        packageImportPath: "import com.dndstatus.DndStatusPackage;",
        packageInstance: "new DndStatusPackage()",
      },
      ios: null,
    },
  },
}
