export type Primitive = string | number | boolean | null;
export type PrimitiveArray = Primitive[];

export type Operator =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "RELATIVE_DATE"
  | "LIKE"
  | "NOT LIKE"
  | "ANY"
  | "CONTAINS"
  | string;

export interface Condition {
  field: string | null;
  operator: Operator | null;
  value: Primitive | PrimitiveArray | null;
}

export type ConditionInput = {
  field: string;
  operator: Operator;
  value: Primitive | PrimitiveArray;
};
