export const createElement = (kind, ...props) => {
  const [prefix, subKind] = kind.split(':');

  switch (prefix) {
    case 'p':
      return UiNode.primative(Primative.createPrimative(subKind, ...props));

    case 'component':
      return UiNode.component(...props);

    default:
      throw new Error(`element kind not supported, ${kind}`);
  }
};


export const UiNode = {
  component(component, props) {
    return { type: 'component', component, props };
  },

  primative(primative) {
    return { type: 'primative', primative };
  }
};

export const Primative = {
  setAttributeData(attribute, bufferKind, data, drawKind) {
    return { type: 'set-attribute-data', attribute, bufferKind, data, drawKind };
  },

  setUniform(key, value, children) {
    return { type: 'set-uniform', key, value, children };
  },

  setProgram(program, children) {
    return { type: 'set-program', program, children };
  },

  createPrimative(kind, props) {
    switch (kind) {
      case 'set-attribute-data':
        return Primative.setAttributeData(
            props.attribute,
            props.bufferKind,
            props.data,
            props.drawKind,
        );

      case 'set-program':
        return Primative.setProgram(props.program, props.children);

      case 'set-uniform':
        return Primative.setUniform(props.key, props.value, props.children);

      default:
        throw new Error('unknown primative');
    }
  },
};
