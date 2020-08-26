import path from 'path'
import pluginTester from 'babel-plugin-tester'
import hoistCommonStrings from './index'

pluginTester({
  plugin: hoistCommonStrings,
  tests: [
    {
      fixture: path.join(__dirname, '__fixtures__', 'repeating-strings.js'),
      outputFixture: path.join(
        __dirname,
        '__fixtures__',
        'repeating-strings.output.js'
      ),
    },
  ],
})
