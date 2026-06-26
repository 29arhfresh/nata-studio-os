export interface DataRoute {
  fromStep: string;
  toStep: string;
  outputKey: string;
  inputKey: string;
}

/** Maps step outputs to downstream step inputs via declarative routing rules. */
export class DataRouter {
  private routes: DataRoute[] = [];

  /** Registers a new route from one step's output to another step's input. */
  addRoute(route: DataRoute): void {
    this.routes.push({ ...route });
  }

  /** Removes all routes originating from a given step. */
  removeRoutesFrom(stepId: string): void {
    this.routes = this.routes.filter((r) => r.fromStep !== stepId);
  }

  /**
   * Resolves all registered routes targeting toStep and assembles
   * the combined input object from the provided step output map.
   */
  resolveInputs(
    toStep: string,
    stepOutputs: Map<string, Record<string, unknown>>,
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    for (const route of this.routes) {
      if (route.toStep !== toStep) continue;
      const output = stepOutputs.get(route.fromStep);
      if (
        output !== undefined &&
        Object.prototype.hasOwnProperty.call(output, route.outputKey)
      ) {
        inputs[route.inputKey] = output[route.outputKey];
      }
    }
    return inputs;
  }

  /** Returns all routes that target a given step. */
  getRoutesTo(stepId: string): DataRoute[] {
    return this.routes.filter((r) => r.toStep === stepId);
  }

  /** Returns all routes that originate from a given step. */
  getRoutesFrom(stepId: string): DataRoute[] {
    return this.routes.filter((r) => r.fromStep === stepId);
  }
}
