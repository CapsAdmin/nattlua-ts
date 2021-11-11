import { Environment } from "./Analyzer.ts";
import { BaseType } from "./Types/BaseType.ts";

export class Upvalue {
  shadow: Upvalue | undefined;
  position = 0;
  scope: LexicalScope | undefined;
  key: string | undefined;
  value: BaseType | undefined;
  SetValue(value: BaseType) {
    this.value = value;
    value.SetUpvalue(this);
  }
}

let ref = 0;
export class LexicalScope {
  ref: number;
  children: LexicalScope[] = [];
  upvalues: {
    runtime: {
      list: Upvalue[];
      map: Map<string, Upvalue>;
    };
    typesystem: {
      list: Upvalue[];
      map: Map<string, Upvalue>;
    };
  } = {
    runtime: {
      list: [],
      map: new Map(),
    },
    typesystem: {
      list: [],
      map: new Map(),
    },
  };

  SetParent(parent: LexicalScope | undefined) {
    this.parent = parent;
    if (parent) {
      parent.AddChild(this);
    }
  }

  AddChild(child: LexicalScope) {
    child.parent = this;
    this.children.push(child);
  }

  GetChildren() {
    return this.children;
  }

  FindValue(key: string, env: Environment) {
    let scope: LexicalScope | undefined = this;
    let prev_scope: LexicalScope | undefined = undefined;

    while (scope) {
      const upvalue = scope.upvalues[env].map.get(key);

      if (upvalue) {
        const upvalue_position = prev_scope
          ? prev_scope.upvalue_position
          : undefined;

        if (upvalue_position !== undefined) {
          if (upvalue.position >= upvalue_position) {
            let shadowed_upvalue = upvalue.shadow;

            while (shadowed_upvalue) {
              if (shadowed_upvalue.position <= upvalue_position) {
                return shadowed_upvalue;
              }
              shadowed_upvalue = upvalue.shadow;
            }
          }
        }
        return upvalue;
      }

      prev_scope = scope;
      scope = scope.parent;
    }

    return undefined;
  }

  CreateValue(key: string, obj: BaseType, env: Environment) {
    let shadow;

    if (key != "..." && env == "runtime") {
      shadow = this.upvalues[env].map.get(key);
    }

    const upvalue = new Upvalue();
    upvalue.shadow = shadow;
    upvalue.key = key;
    upvalue.position = this.upvalues[env].list.length;

    this.upvalues[env].list.push(upvalue);
    this.upvalues[env].map.set(key, upvalue);

    upvalue.SetValue(obj);
    upvalue.scope = this;

    return upvalue;
  }

  constructor(
    public parent: LexicalScope | undefined,
    public upvalue_position: number,
  ) {
    this.ref = ref++;
    this.SetParent(parent);
  }
}
