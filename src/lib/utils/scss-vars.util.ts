import styleVariables from '../styles/abstracts/_variables.scss-exported.json';

const variableCache = new Map<string, string>();

styleVariables.variables.forEach((variable) => {
  const cleanName = variable.name.replace(/^\$/, '');
  variableCache.set(cleanName, variable.compiledValue);
});

export function getScssVar(
  name: string,
  fallback: string = 'transparent'
): string {
  const cleanName = name.replace(/^\$/, '');
  return variableCache.get(cleanName) ?? fallback;
}

export function getScssVars<T extends Record<string, string>>(
  vars: T
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;

  for (const key in vars) {
    if (vars.hasOwnProperty(key)) {
      result[key as keyof T] = getScssVar(vars[key], 'transparent');
    }
  }

  return result;
}

export const scssVars = {
  backgroundColorPrimary: getScssVar('background-color-primary'),
  backgroundColorSecondary: getScssVar('background-color-secondary'),
  textColor: getScssVar('text-color'),
  textColorSecondary: getScssVar('text-color-secondary'),
  transitionFast: Number(getScssVar('transition-fast').replace('s ease', '')),
  transitionNormal: Number(
    getScssVar('transition-normal').replace('s ease', '')
  ),
  transitionSlow: Number(getScssVar('transition-slow').replace('s ease', '')),
} as const;

export type ScssVariableName =
  | 'background-color-primary'
  | 'background-color-secondary'
  | 'text-color'
  | 'text-color-secondary'
  | 'font-stack'
  | 'line-height'
  | 'font-weight-normal'
  | 'font-weight-medium'
  | 'font-weight-bold'
  | 'transition-fast'
  | 'transition-normal'
  | 'transition-slow';
