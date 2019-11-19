import React, { PureComponent, FormEvent } from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import is from 'styled-is';
import { Field, FieldTitle } from '../../components/Form';
import Accordion, { AccordionItem, AccordionHead, AccordionBody } from '../../components/Accordion';
import { Abi } from 'cyberwayjs/dist/eosjs-rpc-interfaces';
import { getAbi } from '../../utils/cyberway';
import { COLORS } from '../../utils/theme';
import ToastsManager from 'toasts-manager';

function isPlainObject(x: any) {
  return x && !Array.isArray(x) && typeof x === 'object';
}

const Wrapper = styled.div`
  margin: 16px 16px 200px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const FlexField = styled(Field)`
  display: flex;
  flex-direction: row;
`;

const ActionName = styled.span<{ active?: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  background: ${COLORS.blue};
  color: #fff;
  font-size: 15px;

  ${is('active')`
    border-radius: 0 2px 6px 2px;
    background: #fff;
    color: ${COLORS.blue};
  `};
`;

const Action = styled.form``;

const Input = styled.input<{ fullWidth?: boolean }>`
  &:invalid:focus:not(:placeholder-shown) + small {
    color: darkred;
  }

  ${is('fullWidth')`
    width: 100%;
  `}
`;

const InputWrap = styled.div`
  flex: 1;
  padding: 0 6px;
`;

const ActionAuthLine = styled.div`
  display: flex;
`;

const Submit = styled.button`
  background: ${COLORS.green}
  color:#fff;
  font-weight:bold;
  margin: 0 12px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  align-self: center;
`;

const Auth = styled.div`
  margin: 6px 0 12px;
  display: flex;
  align-items: flex-end;
`;

const FieldName = styled(FieldTitle)`
  display: inline-block;
  min-width: 120px;
  text-align: right;
  line-height: 24px; // TODO: match with field using constant
`;

const FieldNameMini = styled.div<{ inline?: boolean }>`
  color: #555;
  font-size: 11px;

  ${is('inline')`
    display: inline;
  `};
`;

type AbiField = {
  name: string;
  type: string;
};

type AbiTypeInfo = {
  type: string;
  min?: number;
  max?: number;
  size?: number;
  pattern?: string;
  title?: string;
  upper?: boolean;
  unsafe?: boolean;
};

type Props = RouteComponentProps & {
  account: string;
};

type State = {
  abi: Abi | null;
};

export default class Contract extends PureComponent<Props, State> {
  state = {
    abi: null,
  };

  componentDidMount() {
    this.loadAbi().catch((err: Error) => {
      ToastsManager.error(`Contract abi loading failed: ${err.message}`);
    });
  }

  async loadAbi() {
    const { account } = this.props;
    const abi = await getAbi({ account });
    this.setState({ abi });
  }

  resolveType(type: string, abi: Abi): string {
    const checkType = (t: { new_type_name: string; type: string }) => t.new_type_name === type;
    let alias = abi.types.find(checkType);
    // limit with `l` to avoid potential infinite loop
    for (let i = 0, l = abi.types.length; i < l && alias; i++) {
      type = alias.type;
      alias = abi.types.find(checkType);
    }
    return type;
  }

  fullStruct(type: string, abi: Abi): AbiField[] | null {
    const baseType = this.resolveType(type, abi);
    let struct = abi.structs.find(({ name }) => name === baseType);
    if (struct) {
      if (struct.base) {
        const base = this.fullStruct(struct.base, abi);
        if (base !== null) {
          return [...base, ...struct.fields];
        } else {
          console.error(`No base for type ${struct.base}`);
          return null;
        }
      } else {
        return struct.fields;
      }
    } else {
      console.error(`No struct for type ${type}`);
      return null;
    }
  }

  structToString() {}

  parseType(type: string, abi: Abi) {
    const fields = this.fullStruct(type, abi);
    if (fields) {
      return `{${fields.map(f => `${f.name}: ${f.type}`).join(', ')}}`;
    } else {
      return `(?type: ${type})`;
    }
  }

  renderAuthorization() {
    return (
      <Auth>
        <label>
          <FieldNameMini>actor:</FieldNameMini>
          <input
            required
            name="_actor"
            size={12}
            style={{ textAlign: 'right' }}
            placeholder="your account"
          />
        </label>
        <input value="@" disabled size={1} />
        <label>
          <FieldNameMini>permission:</FieldNameMini>
          <input defaultValue="active" required name="_permission" size={13} />
        </label>
      </Auth>
    );
  }

  isNameInput(input: any) {
    return input.maxLength === 13;
  }

  isJsonInput(input: any) {
    const { placeholder } = input;
    return placeholder === '[]' || placeholder === '{}';
  }

  onSubmit(action: string, e: FormEvent) {
    e.preventDefault();
    const els = (e.target as any).elements;
    const vals: Array<{ name: string; value: string; type: string }> = [];
    const args: { [key: string]: string | number | null } = {};
    const auth = { actor: '', permission: '' };
    for (const el of els) {
      const { name, value, checked, type, dataset } = el;
      if (name) {
        vals.push({ name, value, type });
        if (name[0] === '_') {
          auth[name === '_actor' ? 'actor' : 'permission'] = value;
        } else {
          const skip = value === '' && dataset.optional;
          if (skip) {
            args[name] = null;
          } else {
            args[name] =
              type === 'checkbox' || type === 'radio'
                ? checked
                : type === 'number'
                ? Number(value)
                : value === '-' && this.isNameInput(el) // `-` is empty name (to allow empty in optional name)
                ? ''
                : this.isJsonInput(el)
                ? JSON.parse(value)
                : value;
          }
        }
      }
    }

    const trx = {
      actions: [
        {
          account: this.props.account,
          name: action,
          authorization: [auth],
          data: args,
        },
      ],
    };
    this.props.history.push(`/sign?trx=${encodeURIComponent(JSON.stringify(trx))}`);
  }

  uppercaseOnInput(e: FormEvent) {
    const el: any = e.target;
    const p = el.selectionStart;
    el.value = el.value.toUpperCase();
    el.setSelectionRange(p, p);
    el.reportValidity();
  }

  validatingOnInput(e: FormEvent) {
    const el: any = e.target;
    if (this.isJsonInput(el)) {
      let json: any;
      try {
        json = JSON.parse(el.value);
      } catch (err) {
        // `json` still undefined here
      }
      const { placeholder } = el;
      el.setCustomValidity(
        placeholder === '[]' && !Array.isArray(json)
          ? 'Should be valid JSON array'
          : placeholder === '{}' && !isPlainObject(json)
          ? 'Should be valid JSON object'
          : ''
      );
    } else {
      el.reportValidity();
    }
  }

  renderTypedInput(name: string, type: string, abi: Abi) {
    const isArray = type.indexOf('[]') >= 0;
    const isOptional = type.indexOf('?') >= 0;
    const isExtension = type.indexOf('$') >= 0;
    const simpleType = type.replace(/(\[\]|\$|\?)*$/, '');
    const base = this.resolveType(simpleType, abi);
    const isStruct = abi.structs.find(({ name }) => name === base);
    const allowedEmpty = !isArray && base === 'string';
    const optional = isOptional || isExtension || allowedEmpty || base === 'bool';

    const baseTypes: { [key: string]: AbiTypeInfo } = {
      bool: { type: 'checkbox' },
      int8: { type: 'number', max: 127, min: -128 },
      uint8: { type: 'number', max: 255, min: 0 },
      int16: { type: 'number', max: 32767, min: -32768 },
      uint16: { type: 'number', max: 65535, min: 0 },
      int32: { type: 'number', max: 2147483647, min: -2147483648 },
      uint32: { type: 'number', max: 4294967295, min: 0 },
      int64: { type: 'string', pattern: '-?[0-9]+' },
      uint64: { type: 'string', pattern: '[0-9]+' },
      int128: { type: 'string', pattern: '-?[0-9]+' },
      uint128: { type: 'string', pattern: '[0-9]+' },
      varint32: { type: 'number', max: 2147483647, min: -2147483648 },
      varuint32: { type: 'number', max: 4294967295, min: 0 },
      float32: { type: 'string', unsafe: true },
      float64: { type: 'string', unsafe: true },
      float128: { type: 'string', unsafe: true },
      time_point: { type: 'string', pattern: '-?[0-9]+' }, //int64
      time_point_sec: { type: 'number', min: 0, max: 4294967295 }, //uint32
      block_timestamp_type: { type: 'number', min: 0, max: 4294967295 }, //uint32
      name: { type: 'string', size: 13, pattern: '(-|[.1-5a-z]{0,12}|[.1-5a-z]{12}[.1-5a-j])' },
      bytes: { type: 'string', pattern: '([0-9A-Fa-f]{2})*' }, // TODO: from file
      string: { type: 'string' },
      checksum160: { type: 'string', size: 40, pattern: '([0-9A-Fa-f]{2}){20}' },
      checksum256: { type: 'string', size: 64, pattern: '([0-9A-Fa-f]{2}){32}' },
      checksum512: { type: 'string', size: 128, pattern: '([0-9A-Fa-f]{2}){64}' },
      public_key: { type: 'string', size: 53, pattern: 'GLS[0-9a-zA-Z]{50}' },
      signature: { type: 'string' }, // TODO
      symbol_code: { type: 'string', size: 7, pattern: '[A-Z]{1,7}', upper: true },
      symbol: {
        type: 'string',
        size: 10,
        pattern: '(0|(1[0-8])|[1-9]),[A-Z]{1,7}',
        upper: true,
        title: 'e.g. "4,CYBER"',
      },
      asset: { type: 'string', pattern: '-?[0-9]+(.[0-9]+)? +[A-Z]{1,7}', upper: true },
    };

    let typeInfo = isArray || isStruct ? { type: 'string' } : baseTypes[base];
    if (!typeInfo) {
      console.error('Cannot resolve type', type, base);
      typeInfo = { type: 'string' };
    }

    let details: string | null = null;
    if (base !== type || isStruct) {
      details = isOptional ? 'optional ' : '';
      details += isExtension ? 'binary extension ' : '';
      details += isArray ? 'array of ' : '';
      details += isStruct ? 'struct ' : '';
      details += abi.variants && abi.variants.find(({ name }) => name === base) ? 'variant ' : '';
      details += base !== simpleType || !isStruct ? base : '';
      details += isStruct ? ' ' + this.parseType(base, abi) : '';
    }
    const { size } = typeInfo;
    const width100 = (size && size >= 53) || isArray || Boolean(isStruct) || base === 'string';

    return (
      <div>
        <Input
          name={name}
          required={!optional} // allows empty string and checkbox
          data-optional={isOptional || isExtension ? 1 : undefined}
          type={typeInfo.type}
          min={typeInfo.min}
          max={typeInfo.max}
          step={typeInfo.max && 1}
          fullWidth={width100}
          maxLength={typeInfo.size}
          pattern={optional && typeInfo.pattern ? `(|(${typeInfo.pattern}))` : typeInfo.pattern}
          title={typeInfo.title || typeInfo.pattern}
          placeholder={isArray ? '[]' : isStruct ? '{}' : ' '} // space is for validation trick
          onInput={typeInfo.upper ? e => this.uppercaseOnInput(e) : undefined}
          onChange={e => this.validatingOnInput(e)}
        />
        <FieldNameMini>
          {type}
          {details && ` (${details})`}
        </FieldNameMini>
      </div>
    );
  }

  renderActionDetails(action: string, args: AbiField[] | null, abi: Abi) {
    return args ? (
      <Action action="/sign" onSubmit={e => this.onSubmit(action, e)}>
        {args.length ? (
          args.map(({ name, type }, i) => (
            <FlexField line key={i}>
              <FieldName>{name}:</FieldName>
              <InputWrap>{this.renderTypedInput(name, type, abi)}</InputWrap>
            </FlexField>
          ))
        ) : (
          <i style={{ color: '#888' }}>No parameters</i>
        )}
        <hr />
        Authorization:
        <ActionAuthLine>
          {this.renderAuthorization()}
          <Submit>Build transaction</Submit>
        </ActionAuthLine>
      </Action>
    ) : (
      "can't parse"
    );
  }

  renderActions(abi: Abi) {
    const { actions } = abi;

    return (
      <>
        <h2>Actions:</h2>
        {actions.length ? (
          <Accordion transitionDuration={300}>
            {actions.map(({ name, type }, i) => {
              const fields = this.fullStruct(type, abi);
              return (
                <AccordionItem key={i}>
                  <AccordionHead>
                    <ActionName>{name}</ActionName> /{' '}
                    {fields && fields.length ? (
                      fields.map(({ name }) => name).join(', ')
                    ) : (
                      <i>no parameters</i>
                    )}
                  </AccordionHead>
                  <AccordionBody>{this.renderActionDetails(name, fields, abi)}</AccordionBody>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          'No actions'
        )}
      </>
    );
  }

  render() {
    const { account } = this.props;
    const { abi } = this.state;
    const title = `Contract: ${account}`;

    return (
      <Wrapper>
        <Helmet title={title} />
        <Title>{title}</Title>
        {abi ? this.renderActions(abi!) : 'Loading…'}
      </Wrapper>
    );
  }
}
