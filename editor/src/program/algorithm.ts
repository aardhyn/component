import { Emplacement, EmplacementAction, Mutation } from 'program/types';
import {
  Block,
  Expression,
  IsBlock,
  IsCondition,
  IsList,
  IsLiteral,
  IsNumericVariable,
  IsOperation,
  IsBinaryOperation,
  IsVariable,
  IsSubscript,
} from 'types';
import produce from 'immer';

/**
 * Program tree mutation algorithms and reducers
 */
export namespace algorithm {
  /** Search **/

  /**
   * Search for a block by id recursively within immutable state
   */
  export function Find(
    id: string,
    state: Block[] | null,
  ): Block | Expression | null {
    if (!state) return null;
    let found: Block | Expression | null = null;
    for (const block of state) {
      if (block.id === id) return block;
      switch (block.type) {
        case 'definition':
          found ??= FindExpression(id, block.expression); // search expression
          break;
        case 'branch':
          for (const branch of block.branches) found ??= Find(id, branch); // search branches
          found ??= FindExpression(id, block.condition); // search condition
          break;
        case 'increment':
        case 'decrement':
          found ??= FindExpression(id, block.expression); // search variable
          break;
        case 'repeat':
          found ??= FindExpression(id, block.repetition); // search repeat condition
          found ??= Find(id, block.components); // search repeat body
          break;
        case 'forever':
          found ??= Find(id, block.components); // search forever body
          break;
        case 'while':
          found ??= FindExpression(id, block.condition); // search repeat condition
          found ??= Find(id, block.components); // search forever body
          break;
        case 'print':
          if (block.expression) found ??= FindExpression(id, block.expression); // search expression
          break;
        case 'assignment':
          found ??= FindExpression(id, block.rvalue);
          found ??= FindExpression(id, block.lvalue);
          break;
        case 'append':
          found ??= FindExpression(id, block.list);
          found ??= FindExpression(id, block.item);
          break;
        case 'draw_line':
          found ??= FindExpression(id, block.x1);
          found ??= FindExpression(id, block.y1);
          found ??= FindExpression(id, block.x2);
          found ??= FindExpression(id, block.y2);
          break;
        case 'draw_rect':
          found ??= FindExpression(id, block.x);
          found ??= FindExpression(id, block.y);
          found ??= FindExpression(id, block.w);
          found ??= FindExpression(id, block.h);
          break;
        case 'draw_pixel':
          found ??= FindExpression(id, block.x);
          found ??= FindExpression(id, block.y);
          break;
      }
    }

    return found;
  }

  /**
   * Find an expression by id recursively from an expression state
   */
  function FindExpression(
    id: string,
    state: Expression | null,
  ): Expression | null {
    if (!state) return null;
    if (state.id === id) return state;

    // this is not the expression, search within
    let found: Expression | null = null;
    switch (state.type) {
      case 'eq':
      case 'ne':
      case 'lt':
      case 'gt':
      case 'le':
      case 'ge':
      case 'and':
      case 'or':
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
      case 'modulo':
      case 'exponent':
      case 'random':
        const [lvalue, rvalue] = state.expression;
        found ??= FindExpression(id, lvalue); // expression lvalue
        if (rvalue) found ??= FindExpression(id, rvalue); // optional expression rvalue
        break;
      case 'sin':
      case 'cos':
      case 'tan':
      case 'round':
      case 'floor':
      case 'ceil':
      case 'abs':
      case 'sqrt':
      case 'log':
        found ??= RemoveExpression(id, state.expression);
        break;
      case 'subscript':
        found ??= FindExpression(id, state.list);
        found ??= FindExpression(id, state.index);
        break;
      case 'size':
        found ??= FindExpression(id, state.list);
        break;
      case 'list':
        for (const expression of state.expression) {
          found ??= FindExpression(id, expression); // search expressions
          if (found) break; // early return
        }
        found ??= FindExpression(id, state.reserve); // search second expression
        found ??= FindExpression(id, state.fill); // search first expression
        break;
    }
    return found;
  }

  /** Removal **/

  /**
   * Omit a block|expression by id recursively into a new block[] state
   */
  export function Remove(id: string, state: Block[] | null): Block[] | null {
    if (!state) return null;

    const draft = state.filter((block) => block.id != id); // search current state
    if (draft.length !== state.length) return draft; // a block was removed, return

    return draft.map((block) =>
      produce(block, (draft) => {
        switch (draft.type) {
          case 'definition':
            draft.expression = RemoveExpression(id, draft.expression); // variable|literal expression
            break;
          case 'print':
            if (draft.expression)
              draft.expression = RemoveExpression(id, draft.expression); // variable|literal expression
            break;
          case 'increment':
          case 'decrement':
            draft.expression = RemoveExpression(id, draft.expression); // variable
            break;
          case 'branch':
            draft.condition = RemoveExpression(id, draft.condition); // condition

            for (const [index, branch] of draft.branches.entries())
              draft.branches[index] = Remove(id, branch); // branches

            break;
          case 'repeat':
            draft.repetition = RemoveExpression(id, draft.repetition);
            draft.components = Remove(id, draft.components); // repeat body
            break;
          case 'while':
            draft.condition = RemoveExpression(id, draft.condition);
            draft.components = Remove(id, draft.components); // repeat body
            break;
          case 'forever':
            draft.components = Remove(id, draft.components); // forever body
            break;
          case 'assignment':
            draft.lvalue = RemoveExpression(id, draft.lvalue);
            draft.rvalue = RemoveExpression(id, draft.rvalue);
            break;
          case 'append':
            draft.list = RemoveExpression(id, draft.list);
            draft.item = RemoveExpression(id, draft.item);
            break;
          case 'draw_line':
            if (draft.x1) draft.x1 = RemoveExpression(id, draft.x1); // x1
            if (draft.y1) draft.y1 = RemoveExpression(id, draft.y1); // y1
            if (draft.x2) draft.x2 = RemoveExpression(id, draft.x2); // x2
            if (draft.y2) draft.y2 = RemoveExpression(id, draft.y2); // y2
            break;
          case 'draw_rect':
            if (draft.x) draft.x = RemoveExpression(id, draft.x); // x
            if (draft.y) draft.y = RemoveExpression(id, draft.y); // y
            if (draft.w) draft.w = RemoveExpression(id, draft.w); // w
            if (draft.h) draft.h = RemoveExpression(id, draft.h); // h
            break;
          case 'draw_pixel':
            if (draft.x) draft.x = RemoveExpression(id, draft.x); // x
            if (draft.y) draft.y = RemoveExpression(id, draft.y); // y
            break;
        }
      }),
    );
  }

  /**
   * Remove an expression by id recursively from an expression into a new expression state
   */
  function RemoveExpression<T extends Expression>(
    id: string,
    expression: T | null,
  ): T | null {
    if (!expression) return expression;
    if (expression.id === id) return null;

    // this is not the expression, search within
    return produce(expression, (draft) => {
      switch (draft.type) {
        case 'eq':
        case 'ne':
        case 'lt':
        case 'gt':
        case 'le':
        case 'ge':
        case 'and':
        case 'or':
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
        case 'modulo':
        case 'exponent':
        case 'random':
          const [lvalue, rvalue] = draft.expression;
          draft.expression[0] = RemoveExpression(id, lvalue); // expression lvalue
          if (rvalue) draft.expression[1] = RemoveExpression(id, rvalue); // optional expression rvalue
          break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'round':
        case 'floor':
        case 'ceil':
        case 'abs':
        case 'sqrt':
        case 'log':
          draft.expression = RemoveExpression(id, draft.expression);
          break;
        case 'subscript':
          draft.list = RemoveExpression(id, draft.list);
          draft.index = RemoveExpression(id, draft.index);
          break;
        case 'list':
          for (const [index, expression] of draft.expression.entries())
            draft.expression[index] = RemoveExpression(id, expression); // search expressions
          draft.fill = RemoveExpression(id, draft.fill); // search first expression
          draft.reserve = RemoveExpression(id, draft.reserve); // search second expression
          break;
      }
    });
  }

  /** Mutation **/

  export function Mutate(
    id: string,
    state: Block[] | null,
    mutation: Mutation,
  ): Block[] | null {
    if (!state) return state;

    const next = state.map((block) => {
      if (block.id === id)
        return produce(block, (draft) => Object.assign(draft, mutation));

      return produce(block, (draft) => {
        switch (draft.type) {
          case 'definition':
            draft.expression = MutateExpression(id, draft.expression, mutation); // variable|literal expression
            break;
          case 'branch':
            draft.condition = MutateExpression(id, draft.condition, mutation); // condition

            for (const [index, branch] of draft.branches.entries())
              draft.branches[index] = Mutate(id, branch, mutation); // branches

            break;
          case 'repeat':
            draft.repetition = MutateExpression(id, draft.repetition, mutation);
            draft.components = Mutate(id, draft.components, mutation); // repeat body
            break;
          case 'while':
            draft.condition = MutateExpression(id, draft.condition, mutation);
            draft.components = Mutate(id, draft.components, mutation); // repeat body
            break;
          case 'forever':
            draft.components = Mutate(id, draft.components, mutation); // forever body
            break;
          case 'increment':
          case 'decrement':
            draft.expression = MutateExpression(id, draft.expression, mutation);
            break;
          case 'print':
            if (draft.expression)
              draft.expression = MutateExpression(
                id,
                draft.expression,
                mutation,
              ); // variable|literal expression

            break;
          case 'append':
            draft.list = MutateExpression(id, draft.list, mutation);
            draft.item = MutateExpression(id, draft.item, mutation);
            break;
          case 'assignment':
            draft.lvalue = MutateExpression(id, draft.lvalue, mutation);
            draft.rvalue = MutateExpression(id, draft.rvalue, mutation);
            break;
          case 'draw_line':
            if (draft.x1) draft.x1 = MutateExpression(id, draft.x1, mutation);
            if (draft.y1) draft.y1 = MutateExpression(id, draft.y1, mutation);
            if (draft.x2) draft.x2 = MutateExpression(id, draft.x2, mutation);
            if (draft.y2) draft.y2 = MutateExpression(id, draft.y2, mutation);
            break;
          case 'draw_rect':
            if (draft.x) draft.x = MutateExpression(id, draft.x, mutation);
            if (draft.y) draft.y = MutateExpression(id, draft.y, mutation);
            if (draft.w) draft.w = MutateExpression(id, draft.w, mutation);
            if (draft.h) draft.h = MutateExpression(id, draft.h, mutation);
            break;
          case 'draw_pixel':
            if (draft.x) draft.x = MutateExpression(id, draft.x, mutation);
            if (draft.y) draft.y = MutateExpression(id, draft.y, mutation);
            break;
        }
      });
    });

    return next;
  }

  function MutateExpression<T extends Expression>(
    id: string,
    expression: T | null,
    mutation: Mutation,
  ): T | null {
    if (!expression) return expression;
    if (expression.id === id) return Object.assign(expression, mutation);

    // this is not the expression, search within
    return produce(expression, (draft) => {
      switch (draft.type) {
        case 'not':
        case 'eq':
        case 'ne':
        case 'lt':
        case 'gt':
        case 'le':
        case 'ge':
        case 'and':
        case 'or':
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
        case 'modulo':
        case 'exponent':
        case 'random':
          const [lvalue, rvalue] = draft.expression;
          draft.expression[0] = MutateExpression(id, lvalue, mutation); // expression lvalue
          if (rvalue)
            draft.expression[1] = MutateExpression(id, rvalue, mutation); // optional expression rvalue
          break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'round':
        case 'floor':
        case 'ceil':
        case 'abs':
        case 'sqrt':
        case 'log':
          draft.expression = MutateExpression(id, draft.expression, mutation);
          break;
        case 'subscript':
          draft.list = MutateExpression(id, draft.list, mutation);
          draft.index = MutateExpression(id, draft.index, mutation);
          break;
        case 'list':
          for (const [index, expression] of draft.expression.entries())
            draft.expression[index] = MutateExpression(
              id,
              expression,
              mutation,
            ); // search expressions
          draft.reserve = MutateExpression(id, draft.reserve, mutation);
          draft.fill = MutateExpression(id, draft.fill, mutation);
          break;
      }
    });
  }

  /** Emplacement **/

  /**
   * Emplace a block|expression by id recursively into a block[] state
   */
  export function Emplace(emplacement: Emplacement, state: Block[]): Block[] {
    console.log(
      `emplacing ${emplacement.component.id} ${emplacement.action} ${emplacement.destinationId} at ${emplacement.locale}`,
    );
    const { component, destinationId, action, locale } = emplacement;

    // check for root emplacement
    if (destinationId === null && IsBlock(component))
      return [component, ...state];

    const dest = state.find((block) => block.id === destinationId);

    if (dest) {
      return produce(state, (draft) => {
        const index = draft.findIndex((block) => block.id == destinationId);
        const isBlock = IsBlock(component);

        switch (action) {
          case 'prepend':
            if (IsBlock(component)) draft.splice(index, 0, component);
            else console.error('Cannot prepend expression to a block');
            break;
          case 'append':
            if (IsBlock(component)) draft.splice(index + 1, 0, component);
            else console.error('Cannot append expression to a block');
            break;
          case 'insert':
            if (!locale) {
              console.error('Cannot insert block without locale');
              return;
            }

            draft[index] = produce(draft[index], (draft) => {
              switch (draft.type) {
                // Blocks
                case 'definition':
                  if (
                    locale === 'expression' &&
                    (IsVariable(component) ||
                      IsCondition(component) ||
                      // IsSubscript(component) ||
                      IsList(component) ||
                      IsBinaryOperation(component))
                  )
                    draft.expression = component;
                  break;
                case 'repeat':
                  if (locale === 'repetition' && IsNumericVariable(component))
                    draft.repetition = component;
                  if (locale === 'components' && isBlock)
                    draft.components = [component];
                  break;
                case 'while':
                  if (
                    locale === 'condition' &&
                    (IsCondition(component) ||
                      IsSubscript(component) ||
                      IsVariable(component) ||
                      IsSubscript(component))
                  )
                    draft.condition = component;
                  if (locale === 'components' && isBlock)
                    draft.components = [component];
                  break;
                case 'forever':
                  if (locale === 'components' && isBlock)
                    draft.components = [component];
                  break;
                case 'branch':
                  if (locale === 'true' && isBlock)
                    draft.branches[0] = [component];
                  else if (locale === 'false' && isBlock)
                    draft.branches[1] = [component];
                  else if (locale === 'condition' && IsCondition(component))
                    draft.condition = component;
                  break;
                case 'print':
                  if (
                    locale === 'expression' &&
                    (IsVariable(component) ||
                      IsLiteral(component) ||
                      IsOperation(component) ||
                      IsCondition(component) ||
                      IsSubscript(component))
                  )
                    draft.expression = component;
                  break;
                case 'increment':
                case 'decrement':
                  if (locale === 'expression' && IsVariable(component))
                    draft.expression = component;
                  break;
                case 'assignment':
                  if (locale === 'lvalue' && IsVariable(component))
                    draft.lvalue = component;
                  // lvalue must be assignable (variable)
                  else if (
                    locale === 'rvalue' &&
                    (IsVariable(component) ||
                      IsLiteral(component) ||
                      IsCondition(component) ||
                      IsOperation(component))
                  )
                    draft.rvalue = component;
                  break;
                case 'append':
                  if (
                    locale === 'list' &&
                    (IsVariable(component) || IsSubscript(component))
                  )
                    draft.list = component;
                  else if (
                    locale === 'item' &&
                    (IsVariable(component) ||
                      IsLiteral(component) ||
                      IsList(component) ||
                      IsOperation(component) ||
                      IsCondition(component) ||
                      IsSubscript(component))
                  )
                    draft.item = component;
                  break;
                case 'draw_line':
                  if (
                    !IsNumericVariable(component) &&
                    !IsLiteral(component) &&
                    !IsOperation(component)
                  )
                    return;
                  switch (locale) {
                    case 'x1':
                      draft.x1 = component;
                      break;
                    case 'y1':
                      draft.y1 = component;
                      break;
                    case 'x2':
                      draft.x2 = component;
                      break;
                    case 'y2':
                      draft.y2 = component;
                      break;
                  }
                  break;
                case 'draw_rect':
                  if (
                    !IsNumericVariable(component) &&
                    !IsLiteral(component) &&
                    !IsOperation(component)
                  )
                    return;
                  switch (locale) {
                    case 'x':
                      draft.x = component;
                      break;
                    case 'y':
                      draft.y = component;
                      break;
                    case 'w':
                      draft.w = component;
                      break;
                    case 'h':
                      draft.h = component;
                      break;
                  }
                  break;
                case 'draw_pixel':
                  if (
                    !IsNumericVariable(component) &&
                    !IsLiteral(component) &&
                    !IsOperation(component)
                  )
                    return;
                  switch (locale) {
                    case 'x':
                      draft.x = component;
                      break;
                    case 'y':
                      draft.y = component;
                      break;
                  }
                  break;
              }
            });
        }
      });
    } else
      return state.map((block) =>
        produce(block, (draft) => {
          switch (draft.type) {
            case 'definition':
              if (draft.expression)
                draft.expression = EmplaceExpression(
                  emplacement,
                  draft.expression,
                ); // expression
              break;
            case 'branch':
              // branches
              if (draft.branches)
                for (const [index, branch] of draft.branches.entries())
                  if (branch)
                    draft.branches[index] = Emplace(emplacement, branch); // branches

              // condition
              if (draft.condition) {
                draft.condition = EmplaceExpression(
                  emplacement,
                  draft.condition,
                );
              }

              break;
            case 'while':
              if (draft.condition)
                draft.condition = EmplaceExpression(
                  emplacement,
                  draft.condition,
                ); // condition
            case 'repeat':
            case 'forever':
              if (draft.components)
                draft.components = Emplace(emplacement, draft.components); // repeat body
              break;
            case 'print':
            case 'increment':
            case 'decrement':
              if (draft.expression)
                draft.expression = EmplaceExpression(
                  emplacement,
                  draft.expression,
                ); // variable|literal expression
              break;
            case 'assignment':
              if (draft.lvalue)
                draft.lvalue = EmplaceExpression(emplacement, draft.lvalue);
              if (draft.rvalue)
                draft.rvalue = EmplaceExpression(emplacement, draft.rvalue);
              break;
            case 'append':
              if (draft.list)
                draft.list = EmplaceExpression(emplacement, draft.list);
              if (draft.item)
                draft.item = EmplaceExpression(emplacement, draft.item);
              break;
            case 'draw_line':
              if (draft.x1) draft.x1 = EmplaceExpression(emplacement, draft.x1);
              if (draft.y1) draft.y1 = EmplaceExpression(emplacement, draft.y1);
              if (draft.x2) draft.x2 = EmplaceExpression(emplacement, draft.x2);
              if (draft.y2) draft.y2 = EmplaceExpression(emplacement, draft.y2);
              break;
            case 'draw_rect':
              if (draft.x) draft.x = EmplaceExpression(emplacement, draft.x);
              if (draft.y) draft.y = EmplaceExpression(emplacement, draft.y);
              if (draft.w) draft.w = EmplaceExpression(emplacement, draft.w);
              if (draft.h) draft.h = EmplaceExpression(emplacement, draft.h);
              break;
            case 'draw_pixel':
              if (draft.x) draft.x = EmplaceExpression(emplacement, draft.x);
              if (draft.y) draft.y = EmplaceExpression(emplacement, draft.y);
              break;
          }
        }),
      );
  }
  /**
   * Emplace an expression by id recursively into an expression state
   */
  function EmplaceExpression<E extends Expression>(
    emplacement: Emplacement,
    state: E,
  ): E {
    if (IsBlock(emplacement.component)) return state; // block cannot be emplaced into an expression

    const { component, destinationId, action, locale } = emplacement;

    if (!destinationId) throw new Error('Cannot emplace expression without id');

    if (state.id === destinationId) {
      if (action !== 'insert') {
        console.error(`Cannot ${action} an expression to itself!`);
        return state;
      }

      if (!locale) {
        console.error('Cannot insert expression without locale');
        return state;
      }

      // emplace expression into expression (swap)
      return produce(state, (draft) => {
        switch (draft.type) {
          case 'eq':
          case 'ne':
          case 'lt':
          case 'gt':
          case 'le':
          case 'ge':
          case 'and':
          case 'or':
          case 'not':
          case 'add':
          case 'subtract':
          case 'multiply':
          case 'divide':
          case 'modulo':
          case 'exponent':
          case 'random':
            // @ts-ignore
            if (locale === 'left') draft.expression[0] = component;
            // @ts-ignore
            if (locale === 'right') draft.expression[1] = component;
            break;
          case 'size':
            // @ts-ignore
            if (locale === 'list') draft.list = component;
            break;
          case 'sin':
          case 'cos':
          case 'tan':
          case 'abs':
          case 'sqrt':
          case 'round':
          case 'floor':
          case 'ceil':
          case 'log':
            // @ts-ignore
            if (locale === 'expression') draft.expression = component;
            break;
          case 'subscript':
            // @ts-ignore
            if (locale === 'list') draft.list = component;
            // @ts-ignore
            if (locale === 'index') draft.index = component;
            break;
          case 'list':
            const index = Number.parseInt(locale);
            console.log('locale:', locale);
            if (!isNaN(index) && index >= 0 && index < draft.expression.length)
              // @ts-ignore
              draft.expression[index] = component;
            if (locale === 'reserve')
              // @ts-ignore
              draft.reserve = component;
            if (locale === 'fill')
              // @ts-ignore
              draft.fill = component;
            break;
        }
      });
    } else
      return produce(state, (draft) => {
        switch (draft.type) {
          case 'eq':
          case 'ne':
          case 'lt':
          case 'gt':
          case 'le':
          case 'not':
          case 'ge':
          case 'and':
          case 'or':
          case 'add':
          case 'subtract':
          case 'multiply':
          case 'divide':
          case 'modulo':
          case 'exponent':
          case 'random':
            const [lvalue, rvalue] = draft.expression;
            if (lvalue)
              draft.expression[0] = EmplaceExpression(emplacement, lvalue);

            if (rvalue)
              draft.expression[1] = EmplaceExpression(emplacement, rvalue);
            break;
          case 'sin':
          case 'cos':
          case 'tan':
          case 'abs':
          case 'sqrt':
          case 'round':
          case 'floor':
          case 'ceil':
          case 'log':
            // @ts-ignore
            if (draft.expression)
              draft.expression = EmplaceExpression(
                emplacement,
                draft.expression,
              );
            break;
          case 'subscript':
            if (draft.list)
              draft.list = EmplaceExpression(emplacement, draft.list);
            if (draft.index)
              draft.index = EmplaceExpression(emplacement, draft.index);
            break;
          case 'size':
            if (draft.list)
              draft.list = EmplaceExpression(emplacement, draft.list);
            break;
          case 'list':
            if (draft.expression)
              for (const [index, expression] of draft.expression.entries()) {
                if (expression)
                  draft.expression[index] = EmplaceExpression(
                    emplacement,
                    expression,
                  );
              }
            if (draft.reserve)
              draft.reserve = EmplaceExpression(emplacement, draft.reserve);
            if (draft.fill)
              draft.fill = EmplaceExpression(emplacement, draft.fill);
            break;
        }
      });
  }

  export function Move(
    sourceId: string,
    destinationId: string | null,
    action: EmplacementAction,
    locale: string | undefined,
    state: Block[],
  ): Block[] {
    console.log(`Moving ${sourceId} ${action} ${destinationId} in ${locale}`);

    if (sourceId === destinationId) return state;

    // find destination component
    const componentToMove = Find(sourceId, state);
    if (!componentToMove) return state;

    // remove original component
    const stateWithOmission = Remove(sourceId, state);
    if (!stateWithOmission) return state;

    // emplace component
    const stateWithEmplacement = Emplace(
      { component: componentToMove, destinationId, action, locale },
      stateWithOmission,
    );

    return stateWithEmplacement;
  }
}
