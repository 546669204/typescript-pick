import { expect, jest, test, describe,it } from '@jest/globals';

import path from 'path';
import { parseFilesAndTransform,transform } from '../src/index';

describe('params', () => {
  it('array', () => {
    const results = parseFilesAndTransform([path.resolve(__dirname, 'array.ts')]);
    expect(results).toMatchSnapshot()
  });
});
