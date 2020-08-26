import * as t from '@babel/types'
import * as babel from '@babel/core'

export default function babelPluginHoistCommonStrings() {
  return {
    // This provides the user with better error messages if
    // our plugin throws
    name: 'hoist-common-strings',
    // And here is the meat of your plugin - the visitor
    visitor: {
      /**
       * @param path {babel.NodePath} This is the Path we talked about above. It
       *  is an object that links Nodes together.
       * @param state {babel.State} An object that contains a bunch of metadata
       *  about the ... state ... of the transformation. Here you'll find:
       *    - state.ast: The current AST from its root Node
       *    - state.code: The code string being transformed
       *    - state.opts: Plugin options
       *    - state.cwd: The working directory of the user
       *    - state.filename: The absolute filename of file
       *      currently being transformed
       */
      StringLiteral(path: babel.NodePath<t.StringLiteral>, state: any) {
        // state.opts give us access to options specific to this plugin
        // provided by the user with ['hoist-common-strings', {...options...}]
        const {minLen = 2} = state.opts

        // Here we're going to add the paths for each string literal that
        // was used to our state. This will allow us to count them later
        // and make sure our `minUses` option was surpassed.
        const {node} = path
        state.commonStrings = state.commonStrings || {}
        const {commonStrings} = state
        // Only hoist strings that surpass our minimum length
        if (node.value.length >= minLen) {
          commonStrings[node.value] = commonStrings[node.value] || []
          commonStrings[node.value].push(path)
        }
      },
      // Program is at the root of the AST
      Program: {
        /**
         * This is a method on our visitor that is going to be
         * called right before the visitor exits the node.
         */
        exit(path: babel.NodePath<t.Program>, state: any) {
          // state.opts give us access to options specific to this plugin
          // provided by the user with ['hoist-common-strings', {...options...}]
          const {minUses = 1} = state.opts
          // These are the strings we found matching our criteria
          const {commonStrings} = state

          for (const string in commonStrings) {
            const paths = commonStrings[string]
            // This ensures we only hoist common strings that are used
            // more than the user's `minUses` option
            if (paths.length > minUses) {
              // Babel has some greate utilities that come with
              // each plugin. To cover them all in one post
              // would be impossible.
              //
              // This helper will create a unique Identifier node
              // specific to this string
              const id = path.scope.generateUidIdentifier(string)
              // Here we replace each of our string paths with the Identifier
              // returned above
              paths.forEach((stringPath: babel.NodePath<t.StringLiteral>) => {
                stringPath.replaceWith(id)
              })
              // Finally, we add our Identifier into AST
              path.scope.push({id, init: t.stringLiteral(string)})
            }
          }
        },
      },
    },
  }
}
