/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['css/**', 'node_modules/**'],
  rules: {
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Класс должен соответствовать БЭМ: block__element--modifier' },
    ],
    'declaration-block-no-redundant-longhand-properties': [true, { ignoreShorthands: ['grid-template'] }],
    'value-keyword-case': ['lower', { ignoreProperties: ['/^--font-/'] }],
  },
};
