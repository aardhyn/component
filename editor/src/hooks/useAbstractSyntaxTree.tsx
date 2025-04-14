import { useState, useEffect } from 'react';
import { Program } from 'program';
import useComponentStore from 'program/store';

const DEFAULT_ERROR_STATE = false;
const DEFAULT_TAB_SIZE = 2;

export default function useAbstractSyntaxTree() {
  const [astString, setAstString] = useState<string>('');
  const [error, setError] = useState(DEFAULT_ERROR_STATE);
  const program = useComponentStore((state) => state.program);
  const loadProgram = useComponentStore((state) => state.setProgram);

  // load test program on mount
  const loadAst = (json: string) => {
    setAstString(json); // update local state regardless successful parse
    ParseAst(json)
      .then((program) => {
        loadProgram(program); // load program if parse is successful
        setError(false);
      })
      .catch(() => setError(true)); // invalid json
  };

  // update local state when `ast` in store updates
  useEffect(() => {
    const ast = JSON.stringify(program, null, DEFAULT_TAB_SIZE);
    setAstString(ast);
  }, [program?.ast]);

  return {
    /**
     * The current error state
     */
    error,
    /**
     * Load an AST json string into the program store
     */
    loadAst,
    /**
     * The current formatted json AST string
     */
    astString,
  };
}

function ParseAst(jsonAstString: string) {
  return new Promise<Program>((resolve, reject) => {
    try {
      resolve(JSON.parse(jsonAstString));
    } catch (e) {
      reject(e);
    }
  });
}
