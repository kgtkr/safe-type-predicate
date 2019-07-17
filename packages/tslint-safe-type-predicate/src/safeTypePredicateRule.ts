import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new SafeTypePredicateWalker(sourceFile, this.getOptions())
    );
  }
}

function isIdentWithName(node: ts.Node, name: string): boolean {
  return ts.isIdentifier(node) && node.text === name;
}

function argumentsIsOne(node: ts.CallExpression): ts.Expression | null {
  if (node.arguments.length === 1) {
    return node.arguments[0];
  } else {
    return null;
  }
}

function argumentsIsOneAnd(
  node: ts.CallExpression,
  f: (arg: ts.Expression) => boolean
): boolean {
  const arg = argumentsIsOne(node);
  return arg !== null && f(arg);
}

function parametersIsOne(
  node: ts.ArrowFunction
): ts.ParameterDeclaration | null {
  if (node.parameters.length === 1) {
    return node.parameters[0];
  } else {
    return null;
  }
}

function unwrapParent<T extends ts.Node>(node: T): ts.Expression | T {
  if (ts.isParenthesizedExpression(node)) {
    return unwrapParent(node.expression);
  }

  return node;
}

function unwrapParentNullable<T extends ts.Node>(
  node: T | null
): ts.Expression | T | null {
  if (node !== null) {
    return unwrapParent(node);
  } else {
    return null;
  }
}

function statIsOne(node: ts.NodeArray<ts.Statement>): ts.Statement | null {
  if (node.length === 1) {
    return node[0];
  } else {
    return null;
  }
}

function blockIsOneStat(node: ts.Node): ts.Statement | null {
  if (ts.isBlock(node)) {
    return statIsOne(node.statements);
  } else {
    return null;
  }
}

function blockIsOneReturnExpr(node: ts.Node): ts.Expression | null {
  const stat = blockIsOneStat(node);
  return stat !== null ? unwrapReturn(stat) : null;
}

function unwrapReturn(node: ts.Statement): ts.Expression | null {
  if (ts.isReturnStatement(node)) {
    if (node.expression !== undefined) {
      return node.expression;
    }
  }
  return null;
}

function arrowBodyIsCond(
  node: ts.ConciseBody
): [ts.Expression, ts.Expression, ts.Expression] | null {
  const node_ = unwrapParent(node);
  if (ts.isConditionalExpression(node_)) {
    return [node_.condition, node_.whenTrue, node_.whenFalse];
  }

  if (ts.isBlock(node_)) {
    const ifStat = statIsOne(node_.statements);
    if (ifStat !== null && ts.isIfStatement(ifStat)) {
      const cond = ifStat.expression;
      const whenExpr = blockIsOneReturnExpr(ifStat.thenStatement);
      const elseExpr =
        ifStat.elseStatement !== undefined
          ? blockIsOneReturnExpr(ifStat.elseStatement)
          : null;

      if (whenExpr !== null && elseExpr !== null) {
        return [cond, whenExpr, elseExpr];
      }
    }
  }

  return null;
}

// The walker takes care of all the work.
class SafeTypePredicateWalker extends Lint.RuleWalker {
  checkCondTrueExpr(node: ts.Expression, name: string) {
    if (
      !(
        ts.isCallExpression(node) &&
        isIdentWithName(unwrapParent(node.expression), "isT") &&
        argumentsIsOneAnd(node, arg => isIdentWithName(unwrapParent(arg), name))
      )
    ) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          `expect: 'isT(${name})'`
        )
      );
    }
  }

  checkCondFalseExpr(node: ts.Expression) {
    if (
      !(
        ts.isCallExpression(node) &&
        isIdentWithName(unwrapParent(node.expression), "isNotT") &&
        node.arguments.length === 0
      )
    ) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          `expect: 'isNotT()'`
        )
      );
    }
  }

  visitCallExpression(node: ts.CallExpression) {
    if (isIdentWithName(unwrapParent(node.expression), "defineIsT")) {
      const arrow = unwrapParentNullable(argumentsIsOne(node));
      if (arrow === null) {
        this.addFailure(
          this.createFailure(
            node.getStart(),
            node.getWidth(),
            "argument should be one"
          )
        );
      } else {
        if (!ts.isArrowFunction(arrow)) {
          this.addFailure(
            this.createFailure(
              arrow.getStart(),
              arrow.getWidth(),
              "expect to be an arrow function"
            )
          );
        } else {
          const arrowX = parametersIsOne(arrow);
          if (arrowX === null) {
            this.addFailure(
              this.createFailure(
                arrow.getStart(),
                arrow.getWidth(),
                "argument should be one"
              )
            );
          } else {
            const arrowXName = arrowX.name;
            if (!ts.isIdentifier(arrowXName)) {
              this.addFailure(
                this.createFailure(
                  arrowX.name.getStart(),
                  arrowX.name.getWidth(),
                  "should be a simple identifier"
                )
              );
            } else {
              const xName = arrowXName.text;
              const arrowBody = arrowBodyIsCond(arrow.body);
              if (arrowBody === null) {
                this.addFailure(
                  this.createFailure(
                    arrow.body.getStart(),
                    arrow.body.getWidth(),
                    "expect: '<expr> ? <expr> : <expr>' or '{ if(<expr>) { return <expr>; } else { return <expr>; } }'"
                  )
                );
              } else {
                const [_cond, whenTrue, whenFalse] = arrowBody;
                this.checkCondTrueExpr(unwrapParent(whenTrue), xName);
                this.checkCondFalseExpr(unwrapParent(whenFalse));
              }
            }
          }
        }
      }
    }

    super.visitCallExpression(node);
  }
}
