export const ptBr = {
  mixed: {
    default: 'O campo é inválido',
    required: 'Campo obrigatório',
    oneOf: 'O campo deve ser um dos seguintes valores: ${values}',
    notOneOf: 'O campo não pode ser um dos seguintes valores: ${values}',
  },
  string: {
    length: 'O campo deve ter exatamente ${length} caracteres',
    min: 'O campo deve ter pelo menos ${min} caracteres',
    max: 'O campo deve ter no máximo ${max} caracteres',
    email: 'Formato de e-mail inválido',
    url: 'O campo deve ter um formato de URL válida',
    trim: 'O campo não deve conter espaços no início ou no fim.',
    lowercase: 'O campo deve estar em maiúsculo',
    uppercase: 'O campo deve estar em minúsculo',
    matches: 'O campo informado é inválido',
  },
  number: {
    min: 'O campo deve ser no mínimo ${min}',
    max: 'O campo deve ser no máximo ${max}',
    lessThan: 'O campo deve ser menor que ${less}',
    moreThan: 'O campo deve ser maior que ${more}',
    notEqual: 'O campo não pode ser igual à ${notEqual}',
    positive: 'O campo deve ser um número positivo',
    negative: 'O campo deve ser um número negativo',
    integer: 'O campo deve ser um número inteiro',
  },
  date: {
    min: 'O campo deve ser maior que a data ${min}',
    max: 'O campo deve ser menor que a data ${max}',
  },
  array: {
    min: 'O campo deve ter no mínimo ${min} itens',
    max: 'O campo deve ter no máximo ${max} itens',
  },
} as const;

export type PtBrMessages = typeof ptBr;
