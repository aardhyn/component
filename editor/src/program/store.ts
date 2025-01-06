import { create } from 'zustand';
import produce from 'immer';
import { Definition, Component } from 'types';
import { algorithm } from './algorithm';
import { EmplacementAction, Mutation, Program } from './types';
import { BLANK_PROGRAM } from 'constants/program';
import { LOCAL_STORAGE_KEY } from '../constants/program';
import { ReadPersistent } from 'hooks/usePersistent';

// read any existing program from disk
const defaultProgram =
  ReadPersistent<Program>(LOCAL_STORAGE_KEY) ?? BLANK_PROGRAM;

// Stores? Zustand? See https://docs.pmnd.rs/zustand/getting-started/introduction

// What does `produce()` do? See https://immerjs.github.io/immer/*

export type VariableStore = Record<string, Definition>;

type ProgramStore = {
  /**
   * The current program structure
   */
  program: Program | null;
  /**
   * set the screen resolution
   */
  setScreenSize: (width: number, height: number) => void;
  /**
   * Variables used in the program
   */
  variables: VariableStore;
  /**
   * Declare a new variable
   */
  declare(id: string, variable: Definition | undefined): void;
  /**
   * Rename the program
   */
  rename(name: string): void;
  /**
   * Set the program
   * @param program The new program
   */
  setProgram(program: Program): void;
  /**
   * Find a component in the program AST
   * @param id The id of the component to find
   */
  findComponent(id: string): Component | null;
  /**
   * Move a component within the program AST
   * @param sourceId component id to move
   * @param destinationId component id to move to
   * @param action relationship between the source and destination (append, prepend, insert, etc.)
   * @param locale how to emplace the component within the `destinationId`, ('condition', 'expression', 'false-branch`, etc.)
   */
  moveBlock(
    sourceId: string,
    destinationId: string | null,
    action: EmplacementAction,
    locale?: string,
  ): void;
  /**
   * Add a new component to the program AST
   */
  addBlock(
    component: Component,
    destinationId: string | null,
    action: EmplacementAction,
    locale?: string,
  ): void;
  /**
   * Mutate a component in the program AST
   * @param id The id of the component to mutate
   * @param component The new component
   */
  mutateBlock(id: string, component: Mutation): void;
  /**
   * Remove a component and its children from the program AST
   * @param id The id of the component to remove
   */
  removeBlock(id: string): void;
};

const useComponentStore = create<ProgramStore>((set, get) => ({
  program: defaultProgram,
  setProgram: (program) => set((state) => (state = { ...state, program })),

  setScreenSize: (width, height) =>
    set((state) =>
      produce(state, (draft) => {
        if (!draft.program) return;
        draft.program.canvas ??= { width: 0, height: 0 };
        draft.program.canvas.height = height;
        draft.program.canvas.width = width;
      }),
    ),

  variables: {},
  declare: (id: string, variable: Definition | undefined) =>
    set((state) =>
      produce(state, (draft) => {
        if (!!variable) draft.variables[id] = variable;
        else delete draft.variables[id];
      }),
    ),

  rename(name) {
    set((state) =>
      produce(state, (draft) => {
        if (!draft.program) return;
        draft.program.name = name;
      }),
    );
  },

  findComponent: (id) => algorithm.Find(id, get().program?.ast ?? []),

  moveBlock(sourceId, destinationId, action, locale) {
    set((state) =>
      produce(state, (draft) => {
        if (!state.program?.ast) return;
        draft.program!.ast = algorithm.Move(
          sourceId,
          destinationId,
          action,
          locale,
          state?.program.ast,
        );
      }),
    );
  },

  addBlock(component, destinationId, action, locale) {
    set((state) =>
      produce(state, (draft) => {
        if (!state.program?.ast) return;
        draft.program!.ast = algorithm.Emplace(
          {
            component,
            destinationId,
            action,
            locale,
          },
          state?.program.ast,
        );
      }),
    );
  },

  mutateBlock(id, component) {
    set((state) =>
      produce(state, (draft) => {
        if (!state.program?.ast) return;
        draft.program!.ast = algorithm.Mutate(
          id,
          state?.program.ast,
          component,
        );
      }),
    );
  },

  removeBlock(id) {
    set((state) =>
      produce(state, (draft) => {
        draft.program ??= BLANK_PROGRAM;
        draft.program.ast = algorithm.Remove(id, draft.program.ast ?? []);
      }),
    );
  },
}));

// Expose store functions in stand-alone hooks for convenience

export function useRemoveComponent() {
  return useComponentStore((state) => state.removeBlock);
}
export function useAddComponent() {
  return useComponentStore((state) => state.addBlock);
}
export function useMoveComponent() {
  return useComponentStore((state) => state.moveBlock);
}
export function useMutateComponent() {
  return useComponentStore((state) => state.mutateBlock);
}

export function useScreen() {
  return useComponentStore(
    (state) =>
      [
        state.program?.canvas ?? { width: 0, height: 0 },
        state.setScreenSize,
      ] as const,
  );
}

export function useVariableStore() {
  return useComponentStore((state) => ({
    variables: state.variables,
    declare: state.declare,
  }));
}
/**
 * Get a variable by its definition id
 * @param definitionId id of the component that declares this variable
 * @returns the variable definition
 */
export function useVariableDefinition(definitionId?: string) {
  const { variables } = useVariableStore();
  if (!definitionId) return null;
  const variable = definitionId in variables ? variables[definitionId] : null;
  return variable;
}

export default useComponentStore;
