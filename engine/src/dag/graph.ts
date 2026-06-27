export type NodeId = string;

export interface ExecutionGraph {
  /** Topological level for every step. Level 0 = no dependencies. */
  levels: Map<NodeId, number>;
  /** Adjacency list: stepId → stepIds it depends on. */
  deps: Map<NodeId, string[]>;
  /** Steps with no dependencies. */
  roots: NodeId[];
}
