// src/reducers/agentReducer.ts
import _ from 'lodash';

export type AgentAction = 
  | { type: 'UPDATE_FIELD'; path: string; value: any }
  | { type: 'LOAD_TEMPLATE'; payload: any };

export const agentReducer = (state: any, action: AgentAction) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      // cloneDeep ensures we don't accidentally mutate the old state
      const newState = _.cloneDeep(state);
      // _.set(object, path, value) handles deep nesting automatically
      _.set(newState, action.path, action.value);
      return newState;

    case 'LOAD_TEMPLATE':
      // This is for your "hit api and get json" requirement
      return { ...action.payload };

    default:
      return state;
  }
};