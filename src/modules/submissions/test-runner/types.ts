export type TestConfig = {
  runner?: 'jest';
  checks?: Check[];
};

export type Check =
  | {
      id: string;
      description: string;
      selector?: string;
    }
  | {
      id: string;
      description: string;
      rule: 'attr';
      selector: string;
      attr: string;
    }
  | {
      id: string;
      description: string;
      rule: 'count';
      selector: string;
      equals?: number;
      gte?: number;
    }
  | {
      id: string;
      description: string;
      rule: 'any';
      selectors: string[];
    }
  | {
      id: string;
      description: string;
      rule: 'bodyTextNotEmpty';
    }
  | {
      id: string;
      description: string;
      rule: 'textNotEmpty';
    }
  | {
      id: string;
      description: string;
      rule: 'style';
      selector: string;
      property: string;
    }
  | {
      id: string;
      description: string;
      rule: 'hasStyleAttributeOrRule';
      selector: string;
    };

export type FriendlyResult = {
  name: string;
  passed: boolean;
  message: string;
};

