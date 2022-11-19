import { expect, jest, test, describe,it } from '@jest/globals';

import path from 'path';
import { parseFilesAndTransform,transform } from '../src/index';

describe('params', () => {
  it('mixed', () => {
    const results = parseFilesAndTransform([path.resolve(__dirname, 'mixed.ts')]);
    console.log(results)
    expect(results).toMatchSnapshot()
  });

});
