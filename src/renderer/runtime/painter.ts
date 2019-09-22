import { Node, ComponentNode, PrimativeNode } from '/src/renderer/state_tree/state_tree';

export class Painter {
  constructor(private readonly context: WebGLRenderingContext) {
  }

  paint(rootNodes: readonly Node[]) {
    rootNodes.forEach(node => this.paintNode(node));
  }

  private paintNode(node: Node) {
    if (node instanceof ComponentNode) {
      this.paintComponent(node);
    } else if (node instanceof PrimativeNode) {
      this.paintPrimative(node);
    } else {
      throw new Error('unknown node');
    }
  }

  private paintComponent<T>({ childNode }: ComponentNode<T>) {
    if (childNode) {
      this.paintNode(childNode);
    }
  }

  private paintPrimative({ childNodes, primative }: PrimativeNode) {
    const paintChildren = () => {
      childNodes && childNodes.forEach(f => this.paintNode(f));
    };

    switch (primative.type) {
      case 'set-context':
      case 'fragment':
        paintChildren();
        break;

      case 'set-program': {
        this.context.useProgram(primative.props.program);
        paintChildren();
        break;
      }

      case 'set-uniform': {
        const { uniform: { location, type }, value } = primative.props;
        const contextMethodName: keyof WebGLRenderingContext = ('uniform' + type) as any;
        if (this.context[contextMethodName]) {
          (this.context[contextMethodName] as any)(location, ...value);
          paintChildren();
        } else {
          throw new Error(`unknown unform type, ${type}`);
        }
        break;
      }

      case 'set-attribute-data': {
        const { attribute: { location, size }, buffer, drawKind } = primative.props;
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer.buffer);
        this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, buffer.data, buffer.kind);
        this.context.vertexAttribPointer(location, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(location);
        this.context.drawArrays(drawKind, 0, buffer.data.length / size);
        paintChildren();
        break;
      }

      default:
        throw new Error(`unsuppported primative: ${primative}`);
    }
  }
}
